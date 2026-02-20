import Link from "next/link";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  showAnalyze?: boolean;
  onAnalyze?: (taskId: string) => void;
  isAnalyzing?: boolean;
}

export default function TaskCard({
  task,
  showAnalyze = false,
  onAnalyze,
  isAnalyzing = false,
}: TaskCardProps) {
  const skills = Array.isArray(task.required_skills)
    ? task.required_skills.join(", ")
    : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-slate-900">{task.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
      {task.location && (
        <p className="mt-1 text-xs text-slate-500">📍 {task.location}</p>
      )}
      {skills && (
        <p className="mt-1 text-xs text-slate-500">Skills: {skills}</p>
      )}
      {task.hours_per_week && (
        <p className="mt-1 text-xs text-slate-500">
          ~{task.hours_per_week} hrs/week
        </p>
      )}
      {showAnalyze && onAnalyze && (
        <button
          onClick={() => onAnalyze(task.id)}
          disabled={isAnalyzing}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isAnalyzing ? "Analyzing…" : "Analyze Match"}
        </button>
      )}
    </div>
  );
}
