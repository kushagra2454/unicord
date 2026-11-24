import { GoogleGenAI } from "@google/genai";
import { getServerEnv } from "@/lib/env";
import type { AIPersona } from "@/types/database";

export interface CitationRef {
  title: string;
  url: string;
  type: "institutional_content" | "academic_calendar" | "resource" | "opportunity";
}

const PERSONA_SYSTEM_PROMPTS: Record<AIPersona, string> = {
  study_buddy:
    "You are Unicord Study Buddy (an AI assistant, not a human tutor). Explain academic concepts clearly step-by-step, help clarify assignments without doing dishonest work, and cite only verified Unicord resources provided in the retrieved context.",
  campus_guide:
    "You are Unicord Campus Guide (an AI assistant). Answer questions about university schools, academic calendars, clubs, and campus facilities strictly using the retrieved verified institutional records and official URLs. If information is missing, say so plainly.",
  placement_mentor:
    "You are Unicord Placement Mentor (an AI assistant). Help students prepare for interviews, resumes, and internships. Cite only verified university career resources and real opportunity records from the context. Never invent vacancies or salary packages.",
  project_partner:
    "You are Unicord Project Partner (an AI assistant). Help students brainstorm technical architectures, break down software projects into milestones, and choose stacks cleanly.",
  opportunity_finder:
    "You are Unicord Opportunity Finder (an AI assistant). Match the student's query strictly against the authorized, non-expired opportunity records in the retrieved context, always mentioning verification state and direct source URLs.",
};

export interface GeminiAssistantInput {
  persona: AIPersona;
  prompt: string;
  universityName: string;
  citations: CitationRef[];
  retrievedContextText: string;
}

export interface GeminiAssistantResult {
  configured: boolean;
  answer: string;
  citations: CitationRef[];
  modelUsed: string | null;
  error?: string;
}

export async function generateGroundedResponse(
  input: GeminiAssistantInput
): Promise<GeminiAssistantResult> {
  const { geminiApiKey, geminiModel } = getServerEnv();

  if (!geminiApiKey) {
    return {
      configured: false,
      answer:
        "Gemini AI is not yet configured on this server (`GEMINI_API_KEY` is missing). Add `GEMINI_API_KEY` to `.env.local` or your deployment environment to enable live AI responses.",
      citations: input.citations,
      modelUsed: null,
      error: "GEMINI_API_KEY_MISSING",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const systemInstruction = `${PERSONA_SYSTEM_PROMPTS[input.persona]}

Strict safety and accuracy rules:
1. Active university context: ${input.universityName}.
2. Never fabricate university policies, exam schedules, previous-year question papers, stipends, or active job vacancies.
3. If the retrieved context below does not contain a factual answer for a university-specific or opportunity-specific question, state clearly that no verified record is available in Unicord yet.
4. Always remind the user briefly that AI responses can make mistakes and official university sources should be verified directly.`;

    const fullPrompt = `Retrieved authorized Unicord records:
${input.retrievedContextText || "No matching records found in Unicord database."}

Student question:
${input.prompt}`;

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return {
        configured: true,
        answer: "The AI provider returned an empty response. Please try rephrasing your question.",
        citations: input.citations,
        modelUsed: geminiModel,
        error: "EMPTY_RESPONSE",
      };
    }

    return {
      configured: true,
      answer: text,
      citations: input.citations,
      modelUsed: geminiModel,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Gemini API error";
    const isQuota = /429|quota|rate/i.test(message);
    return {
      configured: true,
      answer: isQuota
        ? "Gemini API quota or rate limit was reached. Please retry in a moment."
        : "Unable to reach the Gemini API right now. Please try again later.",
      citations: input.citations,
      modelUsed: geminiModel,
      error: message,
    };
  }
}
