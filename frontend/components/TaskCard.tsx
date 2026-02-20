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
    <div className="card card-padding flex flex-col">
      <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {task.location && <span>{task.location}</span>}
        {skills && <span>{skills}</span>}
        {task.hours_per_week && <span>{task.hours_per_week} hrs/wk</span>}
      </div>
      {showAnalyze && onAnalyze && (
        <button
          onClick={() => onAnalyze(task.id)}
          disabled={isAnalyzing}
          className="mt-5 w-full rounded-md bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing…" : "Analyze match"}
        </button>
      )}
    </div>
  );
}
