import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Package,
  Download,
  ShieldX,
  Gauge,
  Settings2,
  FileSearch,
  Plus,
  ArrowRight,
  AlertTriangle,
  FilePlus2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/trust-badge";
import { SAMPLE_SKILLS, BLOCKED_SAMPLE } from "@/lib/sample-data";
import type { SampleSkill } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Your skills",
  description:
    "Manage your published skills, track installs, and review anything the security scanner is holding back.",
};

function formatInstalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

function formatDate(iso: string): string {
  // Parse as UTC so the label is stable regardless of server timezone.
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function DashboardPage() {
  // No real auth yet: the signed-in publisher is Priya, the CPA who authored
  // the month-end-close skill. For the demo we treat the first three catalog
  // skills as hers, plus the blocked submission that never reached the catalog.
  const me = SAMPLE_SKILLS[0].author;
  const myPublished = SAMPLE_SKILLS.slice(0, 3);

  const totalInstalls = myPublished.reduce((sum, s) => sum + s.installs, 0);
  const avgRisk = myPublished.length
    ? Math.round(
        myPublished.reduce((sum, s) => sum + s.riskScore, 0) /
          myPublished.length,
      )
    : 0;
  const criticalCount = BLOCKED_SAMPLE.findings.filter(
    (f) => f.severity === "critical",
  ).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* ------------------------------------------------------------ header */}
      <div className="flex flex-col gap-6 border-b border-border/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your skills
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Manage what you have published, track installs, and see anything the
            scanner is holding back before it reaches the catalog.
          </p>

          <div className="mt-5 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-secondary-foreground">
              {me.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {me.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{me.handle} · {me.role}
              </p>
            </div>
          </div>
        </div>

        <Button size="lg" asChild>
          <Link href="/publish">
            Publish a skill
            <Plus className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {/* ------------------------------------------------------- stat tiles */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={Package}
          label="Published skills"
          value={`${myPublished.length}`}
        />
        <StatTile
          icon={Download}
          label="Total installs"
          value={totalInstalls.toLocaleString()}
        />
        <StatTile
          icon={ShieldX}
          label="Blocked"
          value="1"
          tone="danger"
        />
        <StatTile
          icon={Gauge}
          label="Avg. risk score"
          value={`${avgRisk}`}
          hint="of 100"
        />
      </div>

      {/* ------------------------------------------------ published section */}
      <section className="mt-12">
        <SectionHeading
          title="Your published skills"
          count={myPublished.length}
        />

        {myPublished.length === 0 ? (
          <EmptyState
            icon={FilePlus2}
            title="Nothing here yet."
            body="Package what you know as a skill. We scan it, badge it, and put it in front of people who need it."
            ctaLabel="Publish your first skill"
            ctaHref="/publish"
            className="mt-5"
          />
        ) : (
          <ul className="mt-5 grid gap-3">
            {myPublished.map((skill) => (
              <PublishedRow key={skill.id} skill={skill} />
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------- needs attention */}
      <section className="mt-12">
        <SectionHeading title="Needs attention" count={1} tone="danger" />

        <div className="mt-5 rounded-2xl border border-danger/30 bg-danger/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {BLOCKED_SAMPLE.name}
                </h3>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {BLOCKED_SAMPLE.category}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  v{BLOCKED_SAMPLE.version}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-danger">
                <AlertTriangle className="size-4 shrink-0" aria-hidden />
                Blocked, cannot publish. {criticalCount} critical findings
                detected.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:shrink-0">
              <TrustBadge tier={BLOCKED_SAMPLE.trustTier} />
              <span className="text-xs text-muted-foreground">
                Submitted {formatDate(BLOCKED_SAMPLE.updatedAt)}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/skills/${BLOCKED_SAMPLE.slug}`}>
                  View report
                  <FileSearch className="size-3.5" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- drafts */}
      {/* A genuinely empty section, so the empty-state pattern is visible. */}
      <section className="mt-12">
        <SectionHeading title="Drafts" count={0} />
        <EmptyState
          icon={FilePlus2}
          title="No drafts yet."
          body="Start a new skill and we will scan every layer before it goes live. Nothing publishes until it passes."
          ctaLabel="Publish a skill"
          ctaHref="/publish"
          className="mt-5"
        />
      </section>
    </main>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "danger";
}) {
  const isDanger = tone === "danger";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon
          className={cn("size-4", isDanger ? "text-danger" : "text-primary")}
          aria-hidden
        />
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-3xl font-semibold tracking-tight",
            isDanger ? "text-danger" : "text-foreground",
          )}
        >
          {value}
        </span>
        {hint && (
          <span className="font-mono text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  count,
  tone = "default",
}: {
  title: string;
  count: number;
  tone?: "default" | "danger";
}) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-xs",
          tone === "danger"
            ? "bg-danger/10 text-danger ring-1 ring-inset ring-danger/25"
            : "bg-secondary text-muted-foreground",
        )}
      >
        {count}
      </span>
    </div>
  );
}

function PublishedRow({ skill }: { skill: SampleSkill }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {skill.name}
            </h3>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {skill.category}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              v{skill.version}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">
            {skill.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:shrink-0">
          <TrustBadge tier={skill.trustTier} />
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Download className="size-3.5" aria-hidden />
            {formatInstalls(skill.installs)}
          </span>
          <span className="text-xs text-muted-foreground">
            Updated {formatDate(skill.updatedAt)}
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/skills/${skill.slug}`}>
              Manage
              <Settings2 className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </li>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  ctaLabel,
  ctaHref,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      <Button className="mt-5" asChild>
        <Link href={ctaHref}>
          {ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
