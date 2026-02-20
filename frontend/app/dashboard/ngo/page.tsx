"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { Task } from "@/types";

interface RankedVolunteer {
  id: string;
  overall_score?: number;
  risk_level?: string;
  volunteer?: { id: string; name: string; email: string; location?: string };
}

export default function NGODashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rankedByTask, setRankedByTask] = useState<Record<string, RankedVolunteer[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "ngo") {
      router.replace("/login");
      return;
    }
    setUser(u);
    api
      .get<{ tasks: Task[] }>("/tasks/me")
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [router]);

  const loadRanked = async (taskId: string) => {
    try {
      const { data } = await api.get<{ ranked: RankedVolunteer[] }>(`/match/task/${taskId}`);
      setRankedByTask((prev) => ({ ...prev, [taskId]: data.ranked || [] }));
    } catch {
      setRankedByTask((prev) => ({ ...prev, [taskId]: [] }));
    }
  };

  if (loading || !user) {
    return (
      <div className="container-page py-12">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-slate-900">NGO Dashboard</h1>
      <Link
        href="/dashboard/ngo/create-task"
        className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Create task
      </Link>
      <h2 className="mt-10 text-lg font-semibold text-slate-900">Your tasks</h2>
      <div className="mt-6 space-y-6">
        {tasks.length === 0 ? (
          <p className="text-slate-500">No tasks yet. Create one to get started.</p>
        ) : (
          tasks.map((task) => {
            const ranked = rankedByTask[task.id];
            return (
              <div
                key={task.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <h3 className="font-semibold text-slate-900">{task.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
                <button
                  onClick={() => loadRanked(task.id)}
                  className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View AI-ranked volunteers
                </button>
                {ranked !== undefined && (
                  <div className="mt-4 space-y-2">
                    {ranked.length === 0 ? (
                      <p className="text-sm text-slate-500">No volunteer analyses yet.</p>
                    ) : (
                      ranked.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {r.volunteer?.name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Score: {r.overall_score ?? "—"} · Risk: {r.risk_level ?? "—"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
