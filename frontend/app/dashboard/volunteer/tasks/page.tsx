"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import TaskCard from "@/components/TaskCard";
import AIMatchDisplay from "@/components/AIMatchDisplay";
import type { Task, RunMatchResponse } from "@/types";

export default function VolunteerTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
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
    api
      .get<{ tasks: Task[] }>("/tasks")
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => setTasks([]))
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

  const openTasks = tasks.filter((t) => t.status !== "closed");

  return (
    <div>
      <Link href="/dashboard/volunteer" className="text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Overview
      </Link>
      <header className="page-header mt-4">
        <h1 className="page-title">Open tasks</h1>
        <p className="page-subtitle">Browse and analyze compatibility</p>
      </header>

      {error && (
        <div className="mb-5 rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-600">{error}</div>
      )}
      {matchResult && (
        <div className="mb-8 max-w-2xl">
          <AIMatchDisplay
            match={matchResult.match}
            taskTitle={matchResult.task?.title}
            aiUsed={matchResult.ai_used}
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <p className="text-sm text-slate-500">No open tasks yet.</p>
      )}
    </div>
  );
}
