"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import MatchCard from "@/components/MatchCard";

interface StoredMatch {
  id: string;
  task_id: string;
  volunteer_id: string;
  overall_score: number;
  skill_fit?: number;
  availability_fit?: number;
  completion_confidence?: number;
  risk_level?: string;
  explanation?: string;
  impact_alignment?: string;
  created_at?: string;
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
      <div className="container-page py-12">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <Link href="/dashboard/volunteer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">My matches</h1>
      <p className="mt-2 text-slate-600">AI-evaluated compatibility results</p>
      <div className="mt-8 space-y-6">
        {matches.length === 0 ? (
          <p className="text-slate-500">No matches yet. Analyze a task from your dashboard to get started.</p>
        ) : (
          matches.map((m) => (
            <MatchCard
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
          ))
        )}
      </div>
    </div>
  );
}
