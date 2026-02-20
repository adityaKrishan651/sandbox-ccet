import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("Missing JWT_SECRET");

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const payload = jwt.verify(token, jwtSecret);
    const userId = payload?.sub;
    const role = payload?.role;
    if (!userId || !role) return res.status(401).json({ error: "Invalid token payload" });

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, location")
      .eq("id", userId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: "Failed to load user" });
    if (!data) return res.status(401).json({ error: "User no longer exists" });

    req.user = data;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

