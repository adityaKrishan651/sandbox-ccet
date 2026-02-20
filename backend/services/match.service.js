import { supabase } from "../config/supabase.js";
import { evaluateCompatibility } from "./ai.service.js";
import { scoringFallback } from "../utils/scoringFallback.js";

async function loadVolunteerProfile(userId) {
  const { data, error } = await supabase
    .from("volunteer_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Failed to load volunteer profile");
  return data;
}

async function loadVolunteerSkills(userId) {
  const { data, error } = await supabase
    .from("volunteer_skills")
    .select("proficiency, skill:skills(id, name)")
    .eq("volunteer_id", userId);
  if (error) throw new Error("Failed to load volunteer skills");
  return data || [];
}

async function loadTask(taskId) {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();
  if (error) throw new Error("Failed to load task");
  return data;
}

function buildVolunteerContext({ user, profile, skills }) {
  const skillList = (skills || []).map((s) => ({
    name: s?.skill?.name ?? s?.name,
    proficiency: s?.proficiency ?? 0,
  }));

  return {
    id: user.id,
    name: user.name,
    location: user.location,
    availability: profile?.availability ?? profile?.availability_json ?? profile?.availability_hours ?? null,
    reliability_score: profile?.reliability_score ?? 0,
    impact_points: profile?.impact_points ?? 0,
    skills: skillList,
  };
}

function buildTaskContext(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    location: task.location,
    required_skills: task.required_skills ?? [],
    hours_per_week: task.hours_per_week ?? task.time_commitment_hours ?? null,
    deadline: task.deadline ?? null,
    impact_area: task.impact_area ?? task.category ?? null,
  };
}

async function storeMatch({ volunteerId, taskId, match }) {
  const payload = {
    volunteer_id: volunteerId,
    task_id: taskId,
    skill_fit: match.skill_fit,
    availability_fit: match.availability_fit,
    impact_alignment: match.impact_alignment,
    completion_confidence: match.completion_confidence,
    risk_level: match.risk_level,
    overall_score: match.overall_score,
    explanation: match.explanation,
    raw: match,
  };

  const { data, error } = await supabase.from("ai_matches").insert(payload).select("*").maybeSingle();
  if (error) {
    // If the table doesn't have the expanded columns, try a minimal insert.
    const minimal = {
      volunteer_id: volunteerId,
      task_id: taskId,
      overall_score: match.overall_score,
      risk_level: match.risk_level,
      result: match,
    };
    const second = await supabase.from("ai_matches").insert(minimal).select("*").maybeSingle();
    if (second.error) throw new Error("Failed to store match result");
    return second.data;
  }
  return data;
}

export async function runMatch({ user, taskId }) {
  const [profile, skills, task] = await Promise.all([
    loadVolunteerProfile(user.id),
    loadVolunteerSkills(user.id),
    loadTask(taskId),
  ]);

  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }

  const volunteerCtx = buildVolunteerContext({ user, profile, skills });
  const taskCtx = buildTaskContext(task);

  let match;
  let aiUsed = true;
  try {
    match = await evaluateCompatibility({ volunteer: volunteerCtx, task: taskCtx });
  } catch {
    aiUsed = false;
    match = scoringFallback({ volunteerProfile: profile, volunteerSkills: skills, task });
  }

  const stored = await storeMatch({ volunteerId: user.id, taskId: task.id, match });

  return {
    ai_used: aiUsed,
    task: taskCtx,
    volunteer: {
      id: user.id,
      reliability_score: volunteerCtx.reliability_score,
      impact_points: volunteerCtx.impact_points,
    },
    match,
    stored_match: stored,
  };
}

