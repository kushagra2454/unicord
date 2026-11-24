export interface DemoResource {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  school: string;
  type: "lecture_notes" | "pyq" | "ai_practice_paper" | "lab_manual";
  examYear?: number;
  examType?: string;
  status: "verified" | "pending_review" | "rejected";
  label: string;
  uploader: string;
}

export interface DemoMessage {
  id: string;
  channel: string;
  senderName: string;
  senderBadge: "DEMO USER — SIMULATED PARTICIPANT";
  body: string;
  timestamp: string;
}

export interface DemoOpportunity {
  id: string;
  title: string;
  organization: string;
  category: string;
  workMode: string;
  location: string;
  status: "verified_current" | "expired";
  deadlineText: string;
  sourceUrl: string;
  label: string;
}

export interface DemoMembershipItem {
  id: string;
  studentName: string;
  username: string;
  programme: string;
  status: "pending" | "verified" | "rejected";
}

export interface DemoState {
  environment: "demo";
  seedVersion: string;
  resources: DemoResource[];
  messages: DemoMessage[];
  opportunities: DemoOpportunity[];
  memberships: DemoMembershipItem[];
  announcements: Array<{ id: string; title: string; body: string; label: string }>;
}

export function createInitialDemoState(): DemoState {
  return {
    environment: "demo",
    seedVersion: "2026.1",
    resources: [
      {
        id: "demo-res-1",
        title: "Database Management Systems — Normalization & B+ Trees Notes",
        subject: "Database Management Systems",
        subjectCode: "DEMO-CS401",
        school: "School of Engineering & Technology",
        type: "lecture_notes",
        status: "verified",
        label: "DEMO — SIMULATED RESOURCE",
        uploader: "DEMO USER (Aarav)",
      },
      {
        id: "demo-res-2",
        title: "Operating Systems Sample Question Paper (Simulated)",
        subject: "Operating Systems",
        subjectCode: "DEMO-CS402",
        school: "School of Engineering & Technology",
        type: "pyq",
        examYear: 2025,
        examType: "end_semester",
        status: "verified",
        label: "DEMO — NOT AN AUTHENTIC PYQ",
        uploader: "DEMO USER (Priya)",
      },
      {
        id: "demo-res-3",
        title: "AI Practice Set: Computer Networks Routing Protocols",
        subject: "Computer Networks",
        subjectCode: "DEMO-CS501",
        school: "School of Computer Applications",
        type: "ai_practice_paper",
        status: "verified",
        label: "AI-GENERATED PRACTICE PAPER — NOT AN ACTUAL PREVIOUS-YEAR PAPER",
        uploader: "Unicord Demo AI",
      },
      {
        id: "demo-res-4",
        title: "Software Engineering Sprint Lab Manual (Pending Moderation)",
        subject: "Software Engineering",
        subjectCode: "DEMO-CS504",
        school: "School of Engineering & Technology",
        type: "lab_manual",
        status: "pending_review",
        label: "DEMO — SIMULATED RESOURCE",
        uploader: "DEMO USER (Rohan)",
      },
    ],
    messages: [
      {
        id: "demo-msg-1",
        channel: "general",
        senderName: "Aarav (Demo)",
        senderBadge: "DEMO USER — SIMULATED PARTICIPANT",
        body: "Welcome to the JECRC Demo Sandbox! Feel free to send a test message here.",
        timestamp: "10:05 AM",
      },
      {
        id: "demo-msg-2",
        channel: "academic-doubts",
        senderName: "Priya (Demo)",
        senderBadge: "DEMO USER — SIMULATED PARTICIPANT",
        body: "Anyone reviewing DBMS normal forms before the mid-semester demo?",
        timestamp: "10:12 AM",
      },
      {
        id: "demo-msg-3",
        channel: "placements",
        senderName: "Rohan (Demo)",
        senderBadge: "DEMO USER — SIMULATED PARTICIPANT",
        body: "Check the Opportunities tab to see how Unicord tracks source freshness and deadlines.",
        timestamp: "10:18 AM",
      },
    ],
    opportunities: [
      {
        id: "demo-opp-1",
        title: "Software Engineering Intern (Simulated Example)",
        organization: "Demo Tech Systems",
        category: "internship",
        workMode: "hybrid",
        location: "Jaipur / Hybrid",
        status: "verified_current",
        deadlineText: "In 21 days (Simulated)",
        sourceUrl: "https://jecrcuniversity.edu.in/placements/",
        label: "DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY",
      },
      {
        id: "demo-opp-2",
        title: "Campus AI Buildathon (Expired State Example)",
        organization: "Demo Innovation Lab",
        category: "hackathon",
        workMode: "remote",
        location: "Online",
        status: "expired",
        deadlineText: "Closed 10 days ago (Simulated)",
        sourceUrl: "https://devpost.com/hackathons",
        label: "DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY",
      },
    ],
    memberships: [
      {
        id: "demo-mem-1",
        studentName: "Kabir Verma (Simulated)",
        username: "kabir_demo",
        programme: "B.Tech CSE — Year 3",
        status: "pending",
      },
      {
        id: "demo-mem-2",
        studentName: "Ananya Joshi (Simulated)",
        username: "ananya_demo",
        programme: "MCA — Year 1",
        status: "pending",
      },
    ],
    announcements: [
      {
        id: "demo-ann-1",
        title: "Simulated Semester Registration Briefing",
        body: "Demonstrates how university-scoped notices display source links and audience scope.",
        label: "DEMO — NOT AN OFFICIAL UNIVERSITY ANNOUNCEMENT",
      },
    ],
  };
}

export const DEMO_WALKTHROUGH_STEPS = [
  {
    step: 1,
    title: "Multi-University Architecture",
    route: "/",
    summary: "Explain Unicord's tenant-first SaaS design starting with JECRC University, Jaipur.",
  },
  {
    step: 2,
    title: "University Directory & Official Sources",
    route: "/universities/jecrc-university-jaipur",
    summary: "Show real official JECRC schools, 2026–27 academic calendar PDFs, and source timestamps.",
  },
  {
    step: 3,
    title: "Demo Dashboard",
    route: "/demo/dashboard",
    summary: "Review isolated simulated metrics, profile completion, and quick actions.",
  },
  {
    step: 4,
    title: "Academic Resource Library & Upload",
    route: "/demo/resources",
    summary: "Filter simulated lecture notes, test simulated upload, and inspect review states.",
  },
  {
    step: 5,
    title: "Authentic PYQ Centre",
    route: "/demo/pyqs",
    summary: "Demonstrate strict separation between verified PYQs and AI-generated practice papers.",
  },
  {
    step: 6,
    title: "Discord-Inspired Community & Realtime Messaging",
    route: "/demo/community",
    summary: "Switch channels (#general, #academic-doubts, #placements), send a message, and preview DMs.",
  },
  {
    step: 7,
    title: "Source-Backed Opportunities",
    route: "/demo/opportunities",
    summary: "Inspect freshness badges, expired listing guards, and personal application tracking.",
  },
  {
    step: 8,
    title: "AI Campus Assistant",
    route: "/demo/assistant",
    summary: "Test Study Buddy or Campus Guide (uses real Gemini API if configured, else scripted walkthrough).",
  },
  {
    step: 9,
    title: "Admin Moderation & Verification",
    route: "/demo/admin",
    summary: "Approve a pending student membership or resource, then reset demo state cleanly.",
  },
  {
    step: 10,
    title: "Real Student Signup",
    route: "/signup",
    summary: "Show the separate real Supabase Auth registration flow with pending verification.",
  },
];
