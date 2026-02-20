import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { supabase } from "../config/supabase.js";

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("Missing JWT_SECRET");

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["volunteer", "ngo"]),
  location: z.string().min(2).max(120),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign({ role: user.role }, jwtSecret, { subject: String(user.id), expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { name, email, password, role, location } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (existingError) {
    console.error("Register email check failed:", existingError);
    return res.status(500).json({
      error: "Failed to validate email",
      details: existingError.message,
    });
  }
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const { data, error } = await supabase
    .from("users")
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role,
      location,
    })
    .select("id, name, email, role, location")
    .single();

  if (error) return res.status(500).json({ error: "Failed to create user" });

  const token = signToken(data);
  return res.status(201).json({ token, user: data });
});

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role, location, password_hash")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) return res.status(500).json({ error: "Failed to login" });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.password_hash || "");
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(user);
  const { password_hash, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

export default router;

