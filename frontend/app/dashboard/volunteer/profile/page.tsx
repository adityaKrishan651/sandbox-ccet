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

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

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
        setHoursPerWeek(typeof avail?.hours_per_week === "number" ? String(avail.hours_per_week) : "");
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
        availability: { hours_per_week: hoursPerWeek ? Number(hoursPerWeek) : undefined },
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
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Skills, availability, and bio</p>
      </header>

      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        {error && (
          <div className="rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-600">{error}</div>
        )}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={inputClass} />
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
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Skills</label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill name"
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="w-20 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <li key={i} className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
                  <span>{s.name} ({s.proficiency}%)</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="text-slate-400 hover:text-danger-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
