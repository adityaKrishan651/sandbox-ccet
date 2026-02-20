"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface RankedVolunteer {
  id: string;
  overall_score?: number;
  skill_fit?: number;
  availability_fit?: number;
  completion_confidence?: number;
  risk_level?: string;
  explanation?: string;
  volunteer?: { id: string; name: string; email: string; location?: string };
}

function getRiskClass(r?: string) {
  if (r === "Low") return "bg-success-50 text-success-700";
  if (r === "Medium") return "bg-warning-50 text-warning-700";
  return "bg-danger-50 text-danger-700";
}

export default function NGORankedVolunteersPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [task, setTask] = useState<{ id: string; title: string; ngo_id: string } | null>(null);
  const [ranked, setRanked] = useState<RankedVolunteer[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "ngo") {
      router.replace("/login");
      return;
    }
    setUser(u);
    api
      .get<{ task: { id: string; title: string; ngo_id: string }; ranked: RankedVolunteer[] }>(
        `/match/task/${taskId}`
      )
      .then((res) => {
        if (res.data.task.ngo_id !== u.id) {
          router.replace("/dashboard/ngo");
          return;
        }
        setTask(res.data.task);
        setRanked(res.data.ranked || []);
      })
      .catch(() => router.replace("/dashboard/ngo"))
      .finally(() => setLoading(false));
  }, [router, taskId]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div>
      <Link href="/dashboard/ngo/tasks" className="text-sm font-medium text-primary-600 hover:text-primary-700">
        ← My tasks
      </Link>
      <header className="page-header mt-4">
        <h1 className="page-title">{task.title}</h1>
        <p className="page-subtitle">AI-ranked volunteers</p>
      </header>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Rank
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Volunteer
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Score
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Risk
                </th>
                <th className="w-10 px-4 py-4" />
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                    No volunteer analyses yet.
                  </td>
                </tr>
              ) : (
                ranked.map((r, idx) => (
                  <Fragment key={r.id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30">
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">#{idx + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{r.volunteer?.name ?? "Unknown"}</p>
                        <p className="text-xs text-slate-500">{r.volunteer?.email}</p>
                        {r.volunteer?.location && (
                          <p className="text-xs text-slate-500">{r.volunteer.location}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-base font-semibold tabular-nums text-primary-600">
                          {r.overall_score ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${getRiskClass(
                            r.risk_level
                          )}`}
                        >
                          {r.risk_level ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {r.explanation && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="View AI explanation"
                          >
                            <svg
                              className={`h-4 w-4 transition-transform ${expandedId === r.id ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === r.id && r.explanation && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                              AI explanation
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-700">{r.explanation}</p>
                            {(r.skill_fit !== undefined || r.completion_confidence != null) && (
                              <p className="mt-2 text-xs text-slate-500">
                                Skill fit: {r.skill_fit ?? "—"}% · Availability: {r.availability_fit ?? "—"}% · Confidence:{" "}
                                {r.completion_confidence != null ? `${Math.round(r.completion_confidence * 100)}%` : "—"}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
