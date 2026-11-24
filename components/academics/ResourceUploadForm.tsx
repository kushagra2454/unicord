"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import type { School } from "@/types/database";

export function ResourceUploadForm({
  universityId,
  universitySlug,
  schools,
}: {
  universityId: string;
  universitySlug: string;
  schools: School[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState("lecture_notes");
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [semesterLabel, setSemesterLabel] = useState("");
  const [examType, setExamType] = useState("end_semester");
  const [examYear, setExamYear] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [provenanceNotes, setProvenanceNotes] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setResult({ tone: "error", text: "Please select a file to upload." });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("universityId", universityId);
      if (schoolId) formData.append("schoolId", schoolId);
      formData.append("title", title);
      formData.append("resourceType", resourceType);
      formData.append("subjectName", subjectName);
      if (subjectCode) formData.append("subjectCode", subjectCode);
      if (academicYear) formData.append("academicYear", academicYear);
      if (semesterLabel) formData.append("semesterLabel", semesterLabel);
      if (resourceType === "pyq") {
        formData.append("examType", examType);
        if (examYear) formData.append("examYear", examYear);
      }
      if (sourceUrl) formData.append("sourceUrl", sourceUrl);
      if (provenanceNotes) formData.append("provenanceNotes", provenanceNotes);
      formData.append("description", description);
      formData.append("tags", tags);

      const res = await fetch("/api/resources/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { error?: string; resource?: { id: string } };
      if (!res.ok) {
        setResult({ tone: "error", text: json.error || "Upload failed." });
        return;
      }

      setResult({
        tone: "success",
        text: "Resource uploaded to private storage with status: pending_review.",
      });
      if (json.resource?.id) {
        router.push(`/${universitySlug}/resources/${json.resource.id}`);
        router.refresh();
      }
    } catch {
      setResult({ tone: "error", text: "Network error during upload." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {result && <AlertBanner tone={result.tone}>{result.text}</AlertBanner>}

        {resourceType === "pyq" && (
          <AlertBanner tone="warning" title="PYQ Authenticity Requirement">
            Only upload genuine previous-year university question papers and include source or
            provenance notes (e.g., exam session, department copy). Never upload fabricated or
            AI-generated papers as PYQs.
          </AlertBanner>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="res-title" className="text-xs font-medium text-slate-300">
              Resource Title
            </label>
            <Input
              id="res-title"
              required
              placeholder="e.g., Data Structures Unit 3 Lecture Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="res-type" className="text-xs font-medium text-slate-300">
              Category
            </label>
            <Select
              id="res-type"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
            >
              <option value="lecture_notes">Lecture Notes</option>
              <option value="assignment">Assignment</option>
              <option value="pyq">Authentic Previous-Year Question Paper (PYQ)</option>
              <option value="ai_practice_paper">
                AI-Generated Practice Paper (Not an Actual PYQ)
              </option>
              <option value="syllabus">Syllabus</option>
              <option value="academic_calendar">Academic Calendar</option>
              <option value="lab_manual">Lab Manual</option>
              <option value="practical_file">Practical File</option>
              <option value="reference">Reference Document</option>
              <option value="project_guide">Project Guide</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="res-school" className="text-xs font-medium text-slate-300">
              School / Faculty
            </label>
            <Select
              id="res-school"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
            >
              <option value="">All / General</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="res-subject" className="text-xs font-medium text-slate-300">
              Subject Name
            </label>
            <Input
              id="res-subject"
              required
              placeholder="e.g., Database Management Systems"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="res-code" className="text-xs font-medium text-slate-300">
              Subject Code (optional, only if known)
            </label>
            <Input
              id="res-code"
              placeholder="e.g., BCO001A"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="res-ay" className="text-xs font-medium text-slate-300">
              Academic Year
            </label>
            <Input
              id="res-ay"
              placeholder="2026-27"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="res-sem" className="text-xs font-medium text-slate-300">
              Semester
            </label>
            <Input
              id="res-sem"
              placeholder="e.g., Semester 4"
              value={semesterLabel}
              onChange={(e) => setSemesterLabel(e.target.value)}
            />
          </div>

          {resourceType === "pyq" && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="res-exam-type" className="text-xs font-medium text-slate-300">
                  Examination Type
                </label>
                <Select
                  id="res-exam-type"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                >
                  <option value="end_semester">End-Semester</option>
                  <option value="mid_semester">Mid-Semester</option>
                  <option value="internal">Internal</option>
                  <option value="final">Final</option>
                  <option value="supplementary">Supplementary</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="res-exam-year" className="text-xs font-medium text-slate-300">
                  Paper Year
                </label>
                <Input
                  id="res-exam-year"
                  type="number"
                  min={2000}
                  max={2030}
                  required
                  placeholder="2025"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="res-desc" className="text-xs font-medium text-slate-300">
            Description
          </label>
          <Textarea
            id="res-desc"
            rows={3}
            placeholder="Describe topics covered, lecturer/department context, or revision scope..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="res-source" className="text-xs font-medium text-slate-300">
              Source URL (if from official page)
            </label>
            <Input
              id="res-source"
              type="url"
              placeholder="https://..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="res-tags" className="text-xs font-medium text-slate-300">
              Tags (comma-separated)
            </label>
            <Input
              id="res-tags"
              placeholder="dbms, sql, normalization"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="res-prov" className="text-xs font-medium text-slate-300">
            Provenance / Attribution Notes
          </label>
          <Input
            id="res-prov"
            placeholder="Where this document came from (e.g. own class notes, library paper scan)"
            value={provenanceNotes}
            onChange={(e) => setProvenanceNotes(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="res-file" className="text-xs font-medium text-slate-300">
            File (PDF, DOCX, PPTX, TXT, MD, PNG, JPG — max 25 MB)
          </label>
          <Input
            id="res-file"
            type="file"
            required
            accept=".pdf,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Uploading to Private Storage..." : "Submit for Moderator Review"}
        </Button>
      </form>
    </Card>
  );
}
