import ScoreBadge from "./ScoreBadge";
import type { MatchResult } from "@/types";

interface MatchCardProps {
  match: MatchResult;
  taskTitle?: string;
  volunteerName?: string;
  aiUsed?: boolean;
}

export default function MatchCard({
  match,
  taskTitle,
  volunteerName,
  aiUsed = true,
}: MatchCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
      {taskTitle && (
        <h3 className="text-lg font-semibold text-slate-900">{taskTitle}</h3>
      )}
      {volunteerName && (
        <p className="text-sm text-slate-600">Volunteer: {volunteerName}</p>
      )}
      <div className="mt-4 text-3xl font-bold text-indigo-600">
        {match.overall_score}/100
      </div>
      <p className="text-sm text-slate-500">Overall Match Score</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ScoreBadge label="Skill Fit" value={`${match.skill_fit}%`} />
        <ScoreBadge label="Availability" value={`${match.availability_fit}%`} />
        <ScoreBadge
          label="Confidence"
          value={`${Math.round(match.completion_confidence * 100)}%`}
        />
        <ScoreBadge
          label="Risk"
          value={match.risk_level}
          variant="risk"
          riskLevel={match.risk_level}
        />
      </div>
      {match.impact_alignment && (
        <p className="mt-2 text-sm text-slate-600">
          Impact alignment: <strong>{match.impact_alignment}</strong>
        </p>
      )}
      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        {match.explanation}
      </p>
      {!aiUsed && (
        <p className="mt-2 text-xs text-amber-600">
          Fallback scoring used (AI unavailable)
        </p>
      )}
    </div>
  );
}
