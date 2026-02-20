function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeSkillName(s) {
  return String(s || "").trim().toLowerCase();
}

function parseRequiredSkills(task) {
  const raw = task?.required_skills;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function scoringFallback({ volunteerProfile, volunteerSkills, task }) {
  const required = parseRequiredSkills(task);
  const requiredNames = required
    .map((r) => (typeof r === "string" ? r : r?.name))
    .map(normalizeSkillName)
    .filter(Boolean);

  const volunteerMap = new Map();
  for (const vs of volunteerSkills || []) {
    const name = normalizeSkillName(vs?.skill?.name ?? vs?.skill_name ?? vs?.name);
    if (!name) continue;
    const prof = Number(vs?.proficiency ?? 0);
    volunteerMap.set(name, clamp(prof, 0, 100));
  }

  let matched = 0;
  let profSum = 0;
  for (const reqName of requiredNames) {
    if (volunteerMap.has(reqName)) {
      matched += 1;
      profSum += volunteerMap.get(reqName);
    }
  }

  const denom = Math.max(1, requiredNames.length);
  const coverage = matched / denom;
  const avgProf = matched > 0 ? profSum / matched : 0;
  const skillFit = clamp(Math.round(coverage * 60 + (avgProf / 100) * 40), 0, 100);

  const vAvail = volunteerProfile?.availability ?? volunteerProfile?.availability_json ?? volunteerProfile?.availability_hours;
  const vHours = Number(
    typeof vAvail === "object" && vAvail ? vAvail?.hours_per_week : vAvail
  );
  const tHours = Number(task?.hours_per_week ?? task?.time_commitment_hours ?? 0);
  const availabilityFit =
    tHours > 0 && Number.isFinite(vHours) ? clamp(Math.round((vHours / tHours) * 100), 0, 100) : 60;

  const impact = (task?.impact_area || task?.category || "").toString().toLowerCase();
  const alignment =
    impact.includes("health") || impact.includes("education") || impact.includes("climate")
      ? "High"
      : impact
        ? "Medium"
        : "Low";

  const completionConfidence = clamp(
    Number(((skillFit * 0.6 + availabilityFit * 0.4) / 100).toFixed(2)),
    0,
    1
  );

  const riskLevel = completionConfidence >= 0.75 ? "Low" : completionConfidence >= 0.5 ? "Medium" : "High";
  const overallScore = clamp(Math.round(skillFit * 0.65 + availabilityFit * 0.35), 0, 100);

  return {
    skill_fit: skillFit,
    availability_fit: availabilityFit,
    impact_alignment: alignment,
    completion_confidence: completionConfidence,
    risk_level: riskLevel,
    overall_score: overallScore,
    explanation:
      "Fallback scoring used (AI unavailable). Score is based on skill overlap/proficiency and availability capacity vs task demand.",
  };
}

