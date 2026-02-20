import express from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { supabase } from "../config/supabase.js";
import { runMatch } from "../services/match.service.js";

const router = express.Router();

router.post("/:taskId", auth, requireRole("volunteer"), async (req, res) => {
  try {
    const result = await runMatch({ user: req.user, taskId: req.params.taskId });
    return res.json(result);
  } catch (e) {
    const status = e?.statusCode || 500;
    return res.status(status).json({ error: e?.message || "Match failed" });
  }
});

router.get("/me/list", auth, requireRole("volunteer"), async (req, res) => {
  const { data, error } = await supabase
    .from("ai_matches")
    .select("*, task:tasks(*)")
    .eq("volunteer_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: "Failed to load matches" });
  return res.json({ matches: data || [] });
});

router.get("/task/:taskId", auth, requireRole("ngo"), async (req, res) => {
  const taskId = req.params.taskId;

  const taskRes = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();
  if (taskRes.error) return res.status(500).json({ error: "Failed to load task" });
  if (!taskRes.data) return res.status(404).json({ error: "Task not found" });
  if (taskRes.data.ngo_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("ai_matches")
    .select("*, volunteer:users(id, name, email, location)")
    .eq("task_id", taskId)
    .order("overall_score", { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ error: "Failed to load ranked volunteers" });
  return res.json({ task: taskRes.data, ranked: data || [] });
});

export default router;

