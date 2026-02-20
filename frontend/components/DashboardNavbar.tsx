"use client";

import ProfileDropdown from "./ProfileDropdown";

export default function DashboardNavbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-slate-200 bg-white px-6">
      <ProfileDropdown />
    </header>
  );
}
