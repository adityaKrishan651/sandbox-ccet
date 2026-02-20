"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { Task } from "@/types";

export default function NGODashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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
      <header className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Your NGO dashboard</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total tasks</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">{tasks.length}</p>
        </div>
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Open</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-primary-600">{openTasks.length}</p>
        </div>
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Closed</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-slate-600">{tasks.length - openTasks.length}</p>
        </div>
      </div>

      <section className="section-spacing">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="section-title">Your tasks</h2>
          <div className="flex gap-2">
            <Link
              href="/dashboard/ngo/create-task"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Create task
            </Link>
            <Link href="/dashboard/ngo/tasks" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="card card-padding py-12 text-center">
            <p className="text-sm text-slate-500">No tasks yet. Create one to get started.</p>
            <Link
              href="/dashboard/ngo/create-task"
              className="mt-4 inline-block rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Create task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="card card-padding flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-600">{task.description}</p>
                  <span
                    className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                      task.status === "open" ? "bg-success-50 text-success-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <Link
                  href={`/dashboard/ngo/tasks/${task.id}`}
                  className="shrink-0 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View ranked volunteers
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
