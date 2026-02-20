"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import TaskCard from "@/components/TaskCard";
import MatchCard from "@/components/MatchCard";
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
      <div className="container-page py-12">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  const completion = profile?.profile_completion_percent ?? 0;
  const reliability = profile?.volunteer_profile?.reliability_score ?? 0;
  const impactPoints = profile?.volunteer_profile?.impact_points ?? 0;

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-slate-900">Volunteer Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Profile completion</p>
          <p className="text-2xl font-bold text-indigo-600">{completion}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Reliability score</p>
          <p className="text-2xl font-bold text-slate-900">{reliability}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Impact points</p>
          <p className="text-2xl font-bold text-slate-900">{impactPoints}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard/volunteer/profile"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Complete profile
        </Link>
        <Link
          href="/dashboard/volunteer/matches"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View my matches
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Open tasks</h2>
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {matchResult && (
        <div className="mt-6">
          <MatchCard
            match={matchResult.match}
            taskTitle={matchResult.task?.title}
            aiUsed={matchResult.ai_used}
          />
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks
          .filter((t) => t.status !== "closed")
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showAnalyze
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzingTaskId === task.id}
            />
          ))}
      </div>
      {tasks.filter((t) => t.status !== "closed").length === 0 && (
        <p className="mt-6 text-slate-500">No open tasks yet.</p>
      )}
    </div>
  );
}
