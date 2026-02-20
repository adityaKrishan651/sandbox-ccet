import { z } from "zod";
import { getGeminiModel } from "../config/gemini.js";

const MatchSchema = z.object({
  skill_fit: z.number().min(0).max(100),
  availability_fit: z.number().min(0).max(100),
  impact_alignment: z.enum(["Low", "Medium", "High"]),
  completion_confidence: z.number().min(0).max(1),
  risk_level: z.enum(["Low", "Medium", "High"]),
  overall_score: z.number().min(0).max(100),
  explanation: z.string().min(1),
});

function stripCodeFences(text) {
  const t = String(text || "").trim();
  if (t.startsWith("```")) {
    return t.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return t;
}

function safeJsonParse(text) {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Invalid JSON from AI");
  }
}

export async function evaluateCompatibility({ volunteer, task }) {
  const model = getGeminiModel();

  const prompt = [
    "You are an evaluator for volunteer–task compatibility.",
    "Return STRICT JSON ONLY matching this exact shape and types:",
    JSON.stringify(
      {
        skill_fit: 0,
        availability_fit: 0,
        impact_alignment: "Low",
        completion_confidence: 0,
        risk_level: "Low",
        overall_score: 0,
        explanation: "",
      },
      null,
      2
    ),
    "",
    "Rules:",
    "- skill_fit and availability_fit are 0-100 integers.",
    "- completion_confidence is 0-1 number (0.00-1.00).",
    "- impact_alignment is one of Low|Medium|High.",
    "- risk_level is one of Low|Medium|High.",
    "- overall_score is 0-100 integer combining all factors.",
    "- explanation is a concise paragraph referencing concrete mismatches and strengths.",
    "",
    "Input JSON:",
    JSON.stringify({ volunteer, task }, null, 2),
  ].join("\n");

  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.() ?? "";
  const parsed = safeJsonParse(text);
  return MatchSchema.parse(parsed);
}

