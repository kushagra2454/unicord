export type UniversityRole =
  | "university_admin"
  | "moderator"
  | "verified_student"
  | "student"
  | "faculty_contributor"
  | "guest";

export type VerificationStatus = "pending" | "verified" | "unverified" | "rejected";

export type ResourceType =
  | "assignment"
  | "lecture_notes"
  | "pyq"
  | "ai_practice_paper"
  | "syllabus"
  | "academic_calendar"
  | "lab_manual"
  | "practical_file"
  | "reference"
  | "project_guide";

export type ExamType =
  | "internal"
  | "mid_semester"
  | "end_semester"
  | "final"
  | "supplementary"
  | "other";

export type ResourceVerificationStatus =
  | "pending_review"
  | "verified"
  | "unverified"
  | "rejected"
  | "unavailable";

export type OpportunityCategory =
  | "internship"
  | "full_time"
  | "part_time"
  | "remote_internship"
  | "hackathon"
  | "coding_competition"
  | "case_competition"
  | "scholarship"
  | "workshop_webinar"
  | "conference"
  | "campus_event"
  | "volunteering"
  | "student_leadership";

export type OpportunityVerificationStatus =
  | "verified_current"
  | "source_listed_unreviewed"
  | "pending_review"
  | "stale"
  | "expired"
  | "closed"
  | "rejected";

export type InstitutionalVerificationStatus =
  | "verified_official"
  | "pending_review"
  | "stale"
  | "unavailable"
  | "rejected";

export type AIPersona =
  | "study_buddy"
  | "campus_guide"
  | "placement_mentor"
  | "project_partner"
  | "opportunity_finder";

export interface University {
  id: string;
  name: string;
  slug: string;
  official_website: string | null;
  city: string;
  state: string;
  country: string;
  address: string | null;
  description: string | null;
  logo_path: string | null;
  status: "active" | "pending" | "archived";
  environment: "production" | "demo";
  require_verified_domain: boolean;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  university_id: string;
  name: string;
  slug: string;
  source_url: string | null;
  is_active: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_path: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  portfolio_links: Record<string, string>;
  privacy_settings: {
    show_profile?: boolean;
    show_skills?: boolean;
    show_online_status?: boolean;
    allow_dm_from?: "university_members" | "verified_only" | "nobody";
  };
  active_university_id: string | null;
  is_platform_admin: boolean;
  environment: "production" | "demo";
  created_at: string;
  updated_at: string;
}

export interface UniversityMembership {
  id: string;
  university_id: string;
  user_id: string;
  role: UniversityRole;
  verification_status: VerificationStatus;
  school_id: string | null;
  programme: string | null;
  year_of_study: number | null;
  semester: number | null;
  joined_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  universities?: University;
  schools?: School;
}

export interface AcademicResource {
  id: string;
  university_id: string;
  school_id: string | null;
  programme_id: string | null;
  subject_name: string | null;
  subject_code: string | null;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  exam_type: ExamType | null;
  exam_year: number | null;
  academic_year: string | null;
  semester_label: string | null;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  checksum: string | null;
  source_url: string | null;
  provenance_notes: string | null;
  verification_status: ResourceVerificationStatus;
  tags: string[];
  download_count: number;
  helpful_count: number;
  uploaded_by: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  environment: "production" | "demo";
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  university_id: string | null;
  source_id: string | null;
  external_id: string | null;
  canonical_url: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  description: string;
  work_mode: "remote" | "onsite" | "hybrid" | "unspecified";
  location: string | null;
  stipend_text: string | null;
  eligibility: string | null;
  skills: string[];
  source_url: string;
  application_url: string;
  posted_at: string | null;
  deadline: string | null;
  verification_status: OpportunityVerificationStatus;
  last_checked_at: string;
  expires_at: string | null;
  environment: "production" | "demo";
  created_at: string;
  updated_at: string;
}

export interface InstitutionalContent {
  id: string;
  university_id: string;
  category: string;
  title: string;
  summary: string;
  source_url: string;
  source_organization: string;
  metadata: Record<string, unknown>;
  effective_at: string | null;
  expires_at: string | null;
  verification_status: InstitutionalVerificationStatus;
  last_fetched_at: string;
  reviewed_at: string | null;
}

export interface AcademicTerm {
  id: string;
  university_id: string;
  school_id: string | null;
  name: string;
  academic_year: string;
  start_date: string | null;
  end_date: string | null;
  source_url: string;
  document_url: string | null;
  last_checked_at: string | null;
  status: InstitutionalVerificationStatus;
}
