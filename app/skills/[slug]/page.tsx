import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  TerminalSquare,
  Clock,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/trust-badge";
import { FindingsList } from "@/components/findings-list";
import { Markdown } from "@/components/markdown";
import { InstallCommand } from "@/components/install-command";
import { SEVERITY_META } from "@/lib/trust";
import { getSkillBySlug } from "@/lib/sample-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return { title: "Skill not found" };
  return { title: skill.name, description: skill.summary };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  const severityCounts = skill.findings.reduce<Record<string, number>>(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/skills"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to catalog
      </Link>

      {/* header */}
      <div className="mt-6 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {skill.category}
            </span>
            <TrustBadge tier={skill.trustTier} />
            <span className="font-mono text-xs text-muted-foreground">
              v{skill.version}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {skill.name}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {skill.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-secondary-foreground">
                {skill.author.initials}
              </span>
              <span className="text-foreground">{skill.author.name}</span>
              <span>· {skill.author.role}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="size-4" aria-hidden />
              {skill.installs.toLocaleString()} installs
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              Updated {skill.updatedAt}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
        {/* main column */}
        <div className="min-w-0 space-y-10">
          {/* scan report */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Security scan report
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {skill.scannerVersion}
              </span>
            </div>

            <div className="mt-4">
              <TrustBadge tier={skill.trustTier} showBlurb />
            </div>

            {/* severity summary */}
            {skill.findings.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(["critical", "high", "medium", "low", "info"] as const)
                  .filter((s) => severityCounts[s])
                  .map((s) => (
                    <span
                      key={s}
                      className={
                        "rounded-full px-2.5 py-0.5 text-xs font-medium " +
                        SEVERITY_META[s].surface
                      }
                    >
                      {severityCounts[s]} {SEVERITY_META[s].label.toLowerCase()}
                    </span>
                  ))}
              </div>
            )}

            <div className="mt-5">
              <FindingsList findings={skill.findings} />
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Classifier: {skill.classifierModel}. Automated vetting reduces
              risk but is not a guarantee. Review a skill before trusting it with
              sensitive data.
            </p>
          </section>

          {/* SKILL.md */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              SKILL.md
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The full instructions that load into your agent. Read them before
              installing.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-card p-6">
              <Markdown>{skill.skillMd}</Markdown>
            </div>
          </section>
        </div>

        {/* sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">Install</h3>
            <div className="mt-3">
              <InstallCommand slug={skill.slug} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Package className="size-4 text-muted-foreground" aria-hidden />
              Bundle contents
            </h3>
            <ul className="mt-3 grid gap-2">
              {skill.files.map((f) => (
                <li
                  key={f.path}
                  className="flex items-center gap-2 text-sm"
                >
                  {f.isScript ? (
                    <TerminalSquare
                      className="size-4 shrink-0 text-caution"
                      aria-hidden
                    />
                  ) : (
                    <FileText
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                  <span className="truncate font-mono text-xs text-foreground">
                    {f.path}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {f.sizeLabel}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Scripts are analyzed statically. We never execute a submitted
              skill.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
