import type { Metadata } from "next";

import { Catalog } from "@/components/catalog";
import { SAMPLE_SKILLS } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Browse skills",
  description:
    "Browse security-scanned AI agent skills from verified professionals. Every skill carries a trust badge.",
};

export default function SkillsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Browse skills
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Every skill below passed the security scanner. Blocked submissions
          never appear here.
        </p>
      </div>

      <div className="mt-10">
        <Catalog skills={SAMPLE_SKILLS} />
      </div>
    </main>
  );
}
