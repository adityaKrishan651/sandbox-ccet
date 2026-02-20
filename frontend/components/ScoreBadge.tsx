type RiskLevel = "Low" | "Medium" | "High";

const riskColors: Record<RiskLevel, string> = {
  Low: "bg-success-100 text-success-600",
  Medium: "bg-warning-100 text-warning-600",
  High: "bg-danger-100 text-danger-600",
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
      ? `inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold ${riskColors[riskLevel]}`
      : "inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700";

  return (
    <span className={className}>
      {label}: {value}
    </span>
  );
}
