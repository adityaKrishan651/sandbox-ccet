"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface ProfileResponse {
  volunteer_profile: { reliability_score?: number; impact_points?: number } | null;
  profile_completion_percent: number;
  skills: unknown[];
}

export default function VolunteerStatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "volunteer") {
      router.replace("/login");
      return;
    }
    setUser(u);
    api
      .get<ProfileResponse>("/profile/me")
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  const reliability = profile?.volunteer_profile?.reliability_score ?? 0;
  const impactPoints = profile?.volunteer_profile?.impact_points ?? 0;
  const completion = profile?.profile_completion_percent ?? 0;
  const skillCount = profile?.skills?.length ?? 0;

  return (
    <div>
      <Link href="/dashboard/volunteer" className="text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Overview
      </Link>
      <header className="page-header mt-4">
        <h1 className="page-title">Impact & stats</h1>
        <p className="page-subtitle">Your volunteer track record</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Reliability</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-success-600">{reliability}</p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-success-500"
              style={{ width: `${Math.min(100, reliability)}%` }}
            />
          </div>
        </div>
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Impact points</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-primary-600">{impactPoints}</p>
        </div>
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Profile completion</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{completion}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="card card-padding">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Skills listed</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{skillCount}</p>
        </div>
      </div>

      <div className="section-spacing card card-padding">
        <h2 className="section-title">Improve your profile</h2>
        <p className="mt-2 text-sm text-slate-600">
          Complete your profile and add skills to get better AI match recommendations.
        </p>
        <Link
          href="/dashboard/volunteer/profile"
          className="mt-4 inline-block rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Edit profile
        </Link>
      </div>
    </div>
  );
}
