"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "volunteer") router.replace("/dashboard/volunteer");
    else if (user.role === "ngo") router.replace("/dashboard/ngo");
    else router.replace("/");
  }, [user, router]);

  return (
    <div className="container-page flex min-h-[40vh] items-center justify-center py-12">
      <p className="text-slate-600">Redirecting to your dashboard…</p>
    </div>
  );
}
