"use client";

import type { MatchResult } from "@/types";

type RiskLevel = "Low" | "Medium" | "High";

const riskConfig: Record<
  RiskLevel,
  { bg: string; text: string }
> = {
  Low: { bg: "bg-success-50", text: "text-success-700" },
  Medium: { bg: "bg-warning-50", text: "text-warning-700" },
  High: { bg: "bg-danger-50", text: "text-danger-700" },
};

interface AIMatchDisplayProps {
  match: MatchResult;
  taskTitle?: string;
  volunteerName?: string;
  aiUsed?: boolean;
}

function MetricRing({ value, label }: { value: number; label: string }) {
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="4"
            className="stroke-slate-200"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-primary-600 transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-slate-900">
          {value}
        </span>
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default function AIMatchDisplay({
  match,
  taskTitle,
  volunteerName,
  aiUsed = true,
}: AIMatchDisplayProps) {
  const risk = (match.risk_level || "Low") as RiskLevel;
  const { bg: riskBg, text: riskText } = riskConfig[risk];

  return (
    <article className="card overflow-hidden">
      <header className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          AI Compatibility Report
        </p>
        {taskTitle && (
          <h2 className="mt-1 text-base font-semibold text-slate-900">{taskTitle}</h2>
        )}
        {volunteerName && (
          <p className="text-sm text-slate-500">{volunteerName}</p>
        )}
      </header>

      <div className="px-6 py-6">
        <div className="flex flex-col items-center gap-2 pb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Overall score
          </p>
          <p className="text-4xl font-semibold tabular-nums text-primary-600">
            {match.overall_score}
            <span className="ml-1 text-2xl font-normal text-slate-400">/100</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 border-y border-slate-100 py-6">
          <MetricRing value={match.skill_fit} label="Skill fit" />
          <MetricRing value={match.availability_fit} label="Availability" />
          <MetricRing
            value={Math.round(match.completion_confidence * 100)}
            label="Confidence"
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm text-slate-500">Risk level</span>
          <span
            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${riskBg} ${riskText}`}
          >
            {match.risk_level}
          </span>
        </div>

        {match.impact_alignment && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">Impact alignment</span>
            <span className="text-sm font-medium text-slate-700">{match.impact_alignment}</span>
          </div>
        )}

        <div className="mt-5 rounded-md border border-slate-100 bg-slate-50/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Explanation
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {match.explanation}
          </p>
        </div>

        {!aiUsed && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Fallback scoring (AI unavailable)
          </p>
        )}
      </div>
    </article>
  );
}
