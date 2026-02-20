export type Role = "volunteer" | "ngo";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  location: string;
}

export interface Task {
  id: string;
  ngo_id?: string;
  title: string;
  description: string;
  location?: string | null;
  required_skills: string[];
  hours_per_week?: number | null;
  time_commitment_hours?: number | null;
  deadline?: string | null;
  impact_area?: string | null;
  status?: string;
  created_at?: string;
}

export interface VolunteerProfile {
  id?: string;
  user_id: string;
  bio?: string | null;
  availability?: { hours_per_week?: number; timezone?: string; notes?: string } | null;
  reliability_score?: number;
  impact_points?: number;
}

export interface VolunteerSkill {
  id?: string;
  name: string;
  proficiency: number;
}

export interface MatchResult {
  skill_fit: number;
  availability_fit: number;
  impact_alignment: "Low" | "Medium" | "High";
  completion_confidence: number;
  risk_level: "Low" | "Medium" | "High";
  overall_score: number;
  explanation: string;
}

export interface RunMatchResponse {
  ai_used: boolean;
  task: Partial<Task>;
  volunteer: { id: string; reliability_score: number; impact_points: number };
  match: MatchResult;
  stored_match?: unknown;
}
