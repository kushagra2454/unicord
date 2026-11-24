import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.-]{3,32}$/, "Username must be 3-32 characters (a-z, 0-9, _, ., -)"),
  universityId: z.string().uuid("Select a valid university"),
  schoolId: z.string().uuid().optional().or(z.literal("")),
  programme: z.string().trim().max(120).optional().or(z.literal("")),
  yearOfStudy: z.coerce.number().int().min(1).max(8).optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(500).default(""),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  interests: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
  showProfile: z.boolean().default(true),
  showSkills: z.boolean().default(true),
  showOnlineStatus: z.boolean().default(false),
});

export const resourceCreateSchema = z.object({
  universityId: z.string().uuid(),
  schoolId: z.string().uuid().optional().nullable(),
  subjectName: z.string().trim().min(2).max(120),
  subjectCode: z.string().trim().max(32).optional().nullable(),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(1000).optional().default(""),
  resourceType: z.enum([
    "assignment",
    "lecture_notes",
    "pyq",
    "ai_practice_paper",
    "syllabus",
    "academic_calendar",
    "lab_manual",
    "practical_file",
    "reference",
    "project_guide",
  ]),
  examType: z
    .enum(["internal", "mid_semester", "end_semester", "final", "supplementary", "other"])
    .optional()
    .nullable(),
  examYear: z.coerce.number().int().min(1990).max(2100).optional().nullable(),
  academicYear: z.string().trim().max(20).optional().nullable(),
  semesterLabel: z.string().trim().max(40).optional().nullable(),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
  provenanceNotes: z.string().trim().max(500).optional().default(""),
  tags: z.array(z.string().trim().min(1).max(32)).max(10).default([]),
});

export const messageCreateSchema = z.object({
  channelId: z.string().uuid(),
  universityId: z.string().uuid(),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000),
  replyToId: z.string().uuid().optional().nullable(),
});

export const directMessageCreateSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000),
});

export const opportunitySaveSchema = z.object({
  opportunityId: z.string().uuid(),
  applicationStatus: z.enum([
    "saved",
    "planning",
    "applied",
    "assessment",
    "interview",
    "offer",
    "rejected",
    "closed",
  ]),
  privateNotes: z.string().trim().max(2000).optional().default(""),
});

export const aiChatRequestSchema = z.object({
  universityId: z.string().uuid().optional().nullable(),
  conversationId: z.string().uuid().optional().nullable(),
  persona: z.enum([
    "study_buddy",
    "campus_guide",
    "placement_mentor",
    "project_partner",
    "opportunity_finder",
  ]),
  prompt: z.string().trim().min(2, "Ask a clear question").max(2000),
});

export const reportCreateSchema = z.object({
  universityId: z.string().uuid().optional().nullable(),
  targetType: z.enum([
    "resource",
    "opportunity",
    "message",
    "direct_message",
    "user",
    "community",
    "other",
  ]),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(1000).optional().default(""),
});
