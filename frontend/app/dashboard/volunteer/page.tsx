"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import TaskCard from "@/components/TaskCard";
import AIMatchDisplay from "@/components/AIMatchDisplay";
import type { Task, RunMatchResponse } from "@/types";

interface ProfileResponse {
  user: unknown;
  volunteer_profile: { reliability_score?: number; impact_points?: number } | null;
  skills: unknown[];
  profile_completion_percent: number;
}

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [matchResult, setMatchResult] = useState<RunMatchResponse | null>(null);
  const [analyzingTaskId, setAnalyzingTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "volunteer") {
      router.replace("/login");
      return;
    }
    setUser(u);
    Promise.all([api.get<ProfileResponse>("/profile/me"), api.get<{ tasks: Task[] }>("/tasks")])
      .then(([profileRes, tasksRes]) => {
        setProfile(profileRes.data);
        setTasks(tasksRes.data.tasks || []);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleAnalyze = async (taskId: string) => {
    if (!user) return;
    setAnalyzingTaskId(taskId);
    setMatchResult(null);
    setError("");
    try {
      const { data } = await api.post<RunMatchResponse>(`/match/${taskId}`);
      setMatchResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Analysis failed";
      setError(msg);
    } finally {
      setAnalyzingTaskId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  const completion = profile?.profile_completion_percent ?? 0;
  const reliability = profile?.volunteer_profile?.reliability_score ?? 0;
  const impactPoints = profile?.volunteer_profile?.impact_points ?? 0;
  const openTasks = tasks.filter((t) => t.status !== "closed").slice(0, 3);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Your volunteer dashboard</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Profile completion</p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-primary-600 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">{completion}%</p>
        </div>
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Reliability</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-success-600">{reliability}</p>
        </div>
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Impact points</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">{impactPoints}</p>
        </div>
      </div>

      <section className="section-spacing">
        <div className="flex items-center justify-between gap-4">
          <h2 className="section-title">Open tasks</h2>
          <Link href="/dashboard/volunteer/tasks" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        {error && (
          <div className="mt-4 rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-600">{error}</div>
        )}
        {matchResult && (
          <div className="mt-5 max-w-2xl">
            <AIMatchDisplay
              match={matchResult.match}
              taskTitle={matchResult.task?.title}
              aiUsed={matchResult.ai_used}
            />
          </div>
        )}
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {openTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showAnalyze
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzingTaskId === task.id}
            />
          ))}
        </div>
        {openTasks.length === 0 && (
          <p className="mt-5 text-sm text-slate-500">No open tasks yet.</p>
        )}
      </section>
    </div>
  );
}
