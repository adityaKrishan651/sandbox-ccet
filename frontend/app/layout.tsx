import "./globals.css";
import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PageWrapper from "@/components/PageWrapper";

export const metadata: Metadata = {
  title: "SkillBridge",
  description: "AI-powered volunteer–NGO matching platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PublicNavbar />
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}

