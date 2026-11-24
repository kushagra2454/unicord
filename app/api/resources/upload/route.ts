import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasActiveMembership, validateResourceUpload } from "@/lib/permissions/roles";
import { resourceCreateSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`upload:${user.id}`, 10, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please wait before uploading again." },
      { status: 429 }
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Multipart form data required" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File attachment is required" }, { status: 400 });
  }

  const fileCheck = validateResourceUpload({
    name: file.name,
    mimeType: file.type,
    size: file.size,
  });
  if (!fileCheck.valid) {
    return NextResponse.json({ error: fileCheck.error }, { status: 400 });
  }

  const parsed = resourceCreateSchema.safeParse({
    universityId: formData.get("universityId"),
    schoolId: formData.get("schoolId") || null,
    subjectName: formData.get("subjectName"),
    subjectCode: formData.get("subjectCode") || null,
    title: formData.get("title"),
    description: formData.get("description") || "",
    resourceType: formData.get("resourceType"),
    examType: formData.get("examType") || null,
    examYear: formData.get("examYear") || null,
    academicYear: formData.get("academicYear") || null,
    semesterLabel: formData.get("semesterLabel") || null,
    sourceUrl: formData.get("sourceUrl") || "",
    provenanceNotes: formData.get("provenanceNotes") || "",
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: membership } = await supabase
    .from("university_memberships")
    .select("university_id, role, verification_status")
    .eq("university_id", parsed.data.universityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!hasActiveMembership(membership, parsed.data.universityId)) {
    return NextResponse.json(
      { error: "Active university membership required to upload resources" },
      { status: 403 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(bytes).digest("hex");

  // Duplicate checksum detection within the same university
  const { data: duplicate } = await supabase
    .from("resources")
    .select("id, title")
    .eq("university_id", parsed.data.universityId)
    .eq("checksum", checksum)
    .eq("environment", "production")
    .maybeSingle();

  if (duplicate) {
    return NextResponse.json(
      {
        error: `A file with the exact same checksum already exists (${duplicate.title}).`,
        duplicateId: duplicate.id,
      },
      { status: 409 }
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const storagePath = `${parsed.data.universityId}/${user.id}/${randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("academic-resources")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: created, error: dbError } = await supabase
    .from("resources")
    .insert({
      university_id: parsed.data.universityId,
      school_id: parsed.data.schoolId || null,
      subject_name: parsed.data.subjectName,
      subject_code: parsed.data.subjectCode || null,
      title: parsed.data.title,
      description: parsed.data.description,
      resource_type: parsed.data.resourceType,
      exam_type: parsed.data.examType || null,
      exam_year: parsed.data.examYear || null,
      academic_year: parsed.data.academicYear || null,
      semester_label: parsed.data.semesterLabel || null,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      checksum,
      source_url: parsed.data.sourceUrl || null,
      provenance_notes: parsed.data.provenanceNotes || null,
      verification_status: "pending_review",
      tags: parsed.data.tags,
      uploaded_by: user.id,
      environment: "production",
    })
    .select("id, verification_status")
    .single();

  if (dbError) {
    await supabase.storage.from("academic-resources").remove([storagePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, resource: created }, { status: 201 });
}
