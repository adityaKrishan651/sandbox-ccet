import express from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const CreateTaskSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(5000),
  location: z.string().min(2).max(120).optional().nullable(),
  required_skills: z.array(z.string().min(1).max(80)).min(1),
  hours_per_week: z.number().int().min(1).max(80).optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  impact_area: z.string().min(2).max(120).optional().nullable(),
});

router.get("/", auth, async (req, res) => {
  // Volunteers: open tasks; NGOs: all tasks (or open).
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ error: "Failed to load tasks" });
  return res.json({ tasks: data || [] });
});

router.get("/me", auth, requireRole("ngo"), async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("ngo_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ error: "Failed to load tasks" });
  return res.json({ tasks: data || [] });
});

router.get("/:id", auth, async (req, res) => {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", req.params.id).maybeSingle();
  if (error) return res.status(500).json({ error: "Failed to load task" });
  if (!data) return res.status(404).json({ error: "Task not found" });
  return res.json({ task: data });
});

router.post("/", auth, requireRole("ngo"), async (req, res) => {
  const parsed = CreateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const input = parsed.data;

  const payload = {
    ngo_id: req.user.id,
    title: input.title,
    description: input.description,
    location: input.location ?? req.user.location,
    required_skills: input.required_skills,
    hours_per_week: input.hours_per_week ?? null,
    deadline: input.deadline ?? null,
    impact_area: input.impact_area ?? null,
    status: "open",
  };

  const { data, error } = await supabase.from("tasks").insert(payload).select("*").single();
  if (error) return res.status(500).json({ error: "Failed to create task" });
  return res.status(201).json({ task: data });
});

export default router;

