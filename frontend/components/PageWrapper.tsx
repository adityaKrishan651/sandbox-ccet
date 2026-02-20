"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return <>{children}</>;
  }

  return <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>;
}
