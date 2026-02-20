"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/" className="text-base font-semibold text-primary-600">
          SkillBridge
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              pathname === "/login" ? "text-primary-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
