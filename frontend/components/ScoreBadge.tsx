type RiskLevel = "Low" | "Medium" | "High";

const riskColors: Record<RiskLevel, string> = {
  Low: "bg-emerald-100 text-emerald-800",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-red-100 text-red-800",
};

interface ScoreBadgeProps {
  label: string;
  value: string | number;
  variant?: "default" | "risk";
  riskLevel?: RiskLevel;
}

export default function ScoreBadge({
  label,
  value,
  variant = "default",
  riskLevel,
}: ScoreBadgeProps) {
  const className =
    variant === "risk" && riskLevel
      ? `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${riskColors[riskLevel]}`
      : "inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700";

  return (
    <span className={className}>
      {label}: {value}
    </span>
  );
}
