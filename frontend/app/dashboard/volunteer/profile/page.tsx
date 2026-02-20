"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { VolunteerSkill } from "@/types";

interface ProfileData {
  volunteer_profile: { bio?: string; availability?: { hours_per_week?: number; notes?: string } } | null;
  skills: VolunteerSkill[];
}

export default function VolunteerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [bio, setBio] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] = useState("50");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "volunteer") {
      router.replace("/login");
      return;
    }
    setUser(u);
    api
      .get<ProfileData>("/profile/me")
      .then((res) => {
        const p = res.data.volunteer_profile;
        setBio(p?.bio ?? "");
        const avail = p?.availability;
        setHoursPerWeek(
          typeof avail?.hours_per_week === "number" ? String(avail.hours_per_week) : ""
        );
        setSkills(res.data.skills || []);
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  const addSkill = () => {
    const name = newSkillName.trim();
    if (!name) return;
    setSkills((prev) => [
      ...prev,
      { name, proficiency: Math.min(100, Math.max(0, Number(newSkillProficiency) || 0)) },
    ]);
    setNewSkillName("");
    setNewSkillProficiency("50");
  };

  const removeSkill = (i: number) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put("/profile/volunteer", {
        bio: bio || undefined,
        availability: {
          hours_per_week: hoursPerWeek ? Number(hoursPerWeek) : undefined,
        },
      });
      await api.put("/profile/skills", { skills });
      router.push("/dashboard/volunteer");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Save failed";
      setError(msg);
    } finally {
      setSaving(false);
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
      <Link href="/dashboard/volunteer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Complete your profile</h1>
      <form onSubmit={handleSave} className="mt-6 max-w-xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-slate-700">
            Availability (hours per week)
          </label>
          <input
            id="hours"
            type="number"
            min={0}
            max={80}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            placeholder="e.g. 5"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Skills</label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill name"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              placeholder="0-100"
              className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {skills.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-2 py-1 text-sm">
                  {s.name} ({s.proficiency}%)
                </span>
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
