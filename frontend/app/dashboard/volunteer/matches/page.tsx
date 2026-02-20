"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import AIMatchDisplay from "@/components/AIMatchDisplay";

interface StoredMatch {
  id: string;
  task_id: string;
  skill_fit?: number;
  availability_fit?: number;
  completion_confidence?: number;
  risk_level?: string;
  overall_score: number;
  explanation?: string;
  impact_alignment?: string;
  task?: { id: string; title: string };
}

export default function VolunteerMatchesPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "volunteer") {
      router.replace("/login");
      return;
    }
    setUser(u);
    api
      .get<{ matches: StoredMatch[] }>("/match/me/list")
      .then((res) => setMatches(res.data.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/volunteer" className="text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Overview
      </Link>
      <header className="page-header mt-4">
        <h1 className="page-title">My matches</h1>
        <p className="page-subtitle">AI-evaluated compatibility results</p>
      </header>

      {matches.length === 0 ? (
        <div className="card card-padding py-12 text-center">
          <p className="text-sm text-slate-500">No matches yet. Analyze a task from Open tasks to get started.</p>
          <Link
            href="/dashboard/volunteer/tasks"
            className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Browse open tasks
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((m) => (
            <AIMatchDisplay
              key={m.id}
              match={{
                skill_fit: m.skill_fit ?? 0,
                availability_fit: m.availability_fit ?? 0,
                impact_alignment: (m.impact_alignment as "Low" | "Medium" | "High") ?? "Low",
                completion_confidence: m.completion_confidence ?? 0,
                risk_level: (m.risk_level as "Low" | "Medium" | "High") ?? "Low",
                overall_score: m.overall_score,
                explanation: m.explanation ?? "No explanation stored.",
              }}
              taskTitle={m.task?.title}
              aiUsed={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
