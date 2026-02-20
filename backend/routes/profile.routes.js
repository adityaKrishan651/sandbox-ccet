import express from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const VolunteerProfileSchema = z.object({
  bio: z.string().max(2000).optional().nullable(),
  availability: z
    .object({
      hours_per_week: z.number().int().min(0).max(80).optional(),
      timezone: z.string().min(2).max(80).optional(),
      notes: z.string().max(400).optional(),
    })
    .partial()
    .optional()
    .nullable(),
});

const VolunteerSkillsSchema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        proficiency: z.number().int().min(0).max(100),
      })
    )
    .max(50),
});

router.get("/me", auth, async (req, res) => {
  const base = { user: req.user };

  if (req.user.role !== "volunteer") return res.json(base);

  const [profileRes, skillsRes] = await Promise.all([
    supabase.from("volunteer_profiles").select("*").eq("user_id", req.user.id).maybeSingle(),
    supabase
      .from("volunteer_skills")
      .select("proficiency, skill:skills(id, name)")
      .eq("volunteer_id", req.user.id),
  ]);

  if (profileRes.error) return res.status(500).json({ error: "Failed to load profile" });
  if (skillsRes.error) return res.status(500).json({ error: "Failed to load skills" });

  const profile = profileRes.data || null;
  const skills = (skillsRes.data || []).map((s) => ({
    id: s?.skill?.id,
    name: s?.skill?.name,
    proficiency: s?.proficiency ?? 0,
  }));

  const completion = (() => {
    let points = 0;
    const total = 3;
    if (profile?.bio) points += 1;
    const avail = profile?.availability ?? profile?.availability_json ?? null;
    if (avail) points += 1;
    if (skills.length > 0) points += 1;
    return Math.round((points / total) * 100);
  })();

  return res.json({
    ...base,
    volunteer_profile: profile,
    skills,
    profile_completion_percent: completion,
  });
});

router.put("/volunteer", auth, requireRole("volunteer"), async (req, res) => {
  const parsed = VolunteerProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { bio, availability } = parsed.data;
  const payload = {
    user_id: req.user.id,
    bio: bio ?? null,
    availability: availability ?? null,
  };

  const { data, error } = await supabase
    .from("volunteer_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: "Failed to update profile" });
  return res.json({ volunteer_profile: data });
});

async function getOrCreateSkillId(name) {
  const normalized = name.trim();
  let { data, error } = await supabase.from("skills").select("id, name").ilike("name", normalized).maybeSingle();
  if (error) throw new Error("Failed to read skills");
  if (data?.id) return data.id;

  const created = await supabase.from("skills").insert({ name: normalized }).select("id").maybeSingle();
  if (!created.error && created.data?.id) return created.data.id;

  // Likely a unique constraint race; try again.
  ({ data, error } = await supabase.from("skills").select("id, name").ilike("name", normalized).maybeSingle());
  if (error || !data?.id) throw new Error("Failed to create skill");
  return data.id;
}

router.put("/skills", auth, requireRole("volunteer"), async (req, res) => {
  const parsed = VolunteerSkillsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { skills } = parsed.data;

  const del = await supabase.from("volunteer_skills").delete().eq("volunteer_id", req.user.id);
  if (del.error) return res.status(500).json({ error: "Failed to update skills" });

  const rows = [];
  for (const s of skills) {
    const skillId = await getOrCreateSkillId(s.name);
    rows.push({ volunteer_id: req.user.id, skill_id: skillId, proficiency: s.proficiency });
  }

  if (rows.length === 0) return res.json({ skills: [] });

  const ins = await supabase
    .from("volunteer_skills")
    .insert(rows)
    .select("proficiency, skill:skills(id, name)");
  if (ins.error) return res.status(500).json({ error: "Failed to save skills" });

  const saved = (ins.data || []).map((x) => ({
    id: x?.skill?.id,
    name: x?.skill?.name,
    proficiency: x?.proficiency ?? 0,
  }));

  return res.json({ skills: saved });
});

export default router;

