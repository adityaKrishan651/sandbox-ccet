"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export default function CreateTaskPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [impactArea, setImpactArea] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "ngo") {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skills.length === 0) {
      setError("Add at least one skill");
      setLoading(false);
      return;
    }
    try {
      await api.post("/tasks", {
        title,
        description,
        location: location || undefined,
        required_skills: skills,
        hours_per_week: hoursPerWeek ? Number(hoursPerWeek) : undefined,
        impact_area: impactArea || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/ngo"), 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Failed to create task";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/ngo" className="text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Overview
      </Link>
      <header className="page-header mt-4">
        <h1 className="page-title">Create task</h1>
        <p className="page-subtitle">Add a new volunteer task</p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        {error && (
          <div className="rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-600">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-success-50 px-4 py-3 text-sm text-success-600">
            Task created. Redirecting…
          </div>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            rows={4}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, San Francisco"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-slate-700">
            Required skills (comma-separated)
          </label>
          <input
            id="skills"
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            required
            placeholder="e.g. Web development, Communication"
            className={inputClass}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-slate-700">
              Hours per week
            </label>
            <input
              id="hours"
              type="number"
              min={1}
              max={80}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              placeholder="e.g. 5"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="impact" className="block text-sm font-medium text-slate-700">
              Impact area
            </label>
            <input
              id="impact"
              type="text"
              value={impactArea}
              onChange={(e) => setImpactArea(e.target.value)}
              placeholder="e.g. Education, Health"
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || success}
          className="rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : success ? "Created" : "Create task"}
        </button>
      </form>
    </div>
  );
}
