"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/types";

interface SidebarProps {
  user: User;
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary-50 text-primary-600"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  if (user.role === "volunteer") {
    return (
      <aside className="w-52 shrink-0 border-r border-slate-200 bg-white">
        <div className="flex h-full flex-col p-5">
          <Link
            href="/dashboard/volunteer"
            className="mb-8 text-base font-semibold text-primary-600"
          >
            SkillBridge
          </Link>
          <nav className="flex flex-col gap-0.5">
            <NavLink
              href="/dashboard/volunteer"
              label="Overview"
              active={pathname === "/dashboard/volunteer"}
            />
            <NavLink
              href="/dashboard/volunteer/tasks"
              label="Open tasks"
              active={pathname === "/dashboard/volunteer/tasks"}
            />
            <NavLink
              href="/dashboard/volunteer/matches"
              label="My matches"
              active={pathname === "/dashboard/volunteer/matches"}
            />
            <NavLink
              href="/dashboard/volunteer/profile"
              label="Profile"
              active={pathname === "/dashboard/volunteer/profile"}
            />
            <NavLink
              href="/dashboard/volunteer/stats"
              label="Impact & stats"
              active={pathname === "/dashboard/volunteer/stats"}
            />
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-52 shrink-0 border-r border-slate-200 bg-white">
      <div className="flex h-full flex-col p-5">
        <Link
          href="/dashboard/ngo"
          className="mb-8 text-base font-semibold text-primary-600"
        >
          SkillBridge
        </Link>
        <nav className="flex flex-col gap-0.5">
          <NavLink
            href="/dashboard/ngo"
            label="Overview"
            active={pathname === "/dashboard/ngo"}
          />
          <NavLink
            href="/dashboard/ngo/tasks"
            label="My tasks"
            active={pathname === "/dashboard/ngo/tasks"}
          />
          <NavLink
            href="/dashboard/ngo/create-task"
            label="Create task"
            active={pathname === "/dashboard/ngo/create-task"}
          />
        </nav>
      </div>
    </aside>
  );
}
