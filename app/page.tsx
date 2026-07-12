import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  FileWarning,
  TerminalSquare,
  Bot,
  BadgeCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScanPreview } from "@/components/scan-preview";
import { SkillCard } from "@/components/skill-card";
import { SAMPLE_SKILLS, CATALOG_STATS } from "@/lib/sample-data";
import { SCAN_LAYERS } from "@/lib/trust";

const LAYER_ICONS = {
  hidden_text: Eye,
  dangerous_pattern: FileWarning,
  script_analysis: TerminalSquare,
  llm_injection: Bot,
} as const;

export default function Home() {
  const featured = SAMPLE_SKILLS.slice(0, 3);

  return (
    <main>
      {/* ------------------------------------------------------------ hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            Every skill scanned before it ships
          </span>

          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            The skills marketplace that reads the code first.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Professionals publish AI agent skills here. A multi-layer scanner
            checks each one for hidden instructions and malicious code, so you
            install with a trust badge, not a leap of faith.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/skills">
                Browse skills
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/security">See how vetting works</Link>
            </Button>
          </div>
        </div>

        <div className="lg:pl-4">
          <ScanPreview />
        </div>
      </section>

      {/* --------------------------------------------------------- stat bar */}
      <section className="border-y border-border/80 bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
          <Stat
            value={CATALOG_STATS.scansRun.toLocaleString()}
            label="Security scans run"
          />
          <Stat
            value={`${CATALOG_STATS.blockedThisWeek}`}
            label="Skills blocked this week"
          />
          <Stat
            value={`${CATALOG_STATS.verifiedProfessionals}`}
            label="Publishing professionals"
          />
          <Stat value="4 layers" label="On every submission" />
        </div>
      </section>

      {/* ------------------------------------------------------ the problem */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Open registries trust the author. We trust the scanner.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              A skill is a bundle of instructions and scripts that loads
              straight into your agent. Some public registries index anything on
              GitHub with no review, and malicious skills have carried prompt
              injection that quietly exfiltrates secrets. The instruction the
              agent obeys is often invisible to the human who installed it.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Here, nothing reaches the catalog without passing the scanner
              first. A critical finding blocks the skill outright.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Contrast
              tone="danger"
              title="Unvetted registries"
              points={[
                "Listed automatically from public repos",
                "Hidden Unicode instructions go unread",
                "Install scripts run on your machine",
                "The badge just means it exists",
              ]}
            />
            <Contrast
              tone="safe"
              title="Vetted Skills"
              points={[
                "Scanned across four independent layers",
                "Hidden payloads decoded and shown to you",
                "Scripts read statically, never executed by us",
                "The badge means it passed",
              ]}
            />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- 4 layers */}
      <section className="border-t border-border/80 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              The scanner
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Four layers read every skill before you do.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {SCAN_LAYERS.map((layer, i) => {
              const Icon = LAYER_ICONS[layer.key];
              return (
                <div key={layer.key} className="bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {layer.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {layer.blurb}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
            Prompt injection is an unsolved problem, so we do not claim to catch
            everything. Defense in depth plus an honest trust badge beats a
            single filter that pretends to be perfect.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- featured */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Skills from real professionals
          </h2>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/skills">
              View all
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- final cta */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card px-6 py-14 text-center sm:px-12">
          <BadgeCheck className="mx-auto size-9 text-primary" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Publish your expertise. Let the scanner vouch for it.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Package what you know as a skill. We scan it, badge it, and put it in
            front of people who need it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/publish">
                Publish a skill
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/skills">Browse the catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-transparent px-2 py-8 text-center">
      <p className="font-mono text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Contrast({
  tone,
  title,
  points,
}: {
  tone: "danger" | "safe";
  title: string;
  points: string[];
}) {
  const isSafe = tone === "safe";
  return (
    <div
      className={
        "rounded-2xl border p-5 " +
        (isSafe ? "border-primary/25 bg-primary/5" : "border-border bg-card")
      }
    >
      <p
        className={
          "text-sm font-semibold " +
          (isSafe ? "text-primary" : "text-muted-foreground")
        }
      >
        {title}
      </p>
      <ul className="mt-4 grid gap-3">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm">
            <span
              className={
                "mt-1.5 size-1.5 shrink-0 rounded-full " +
                (isSafe ? "bg-primary" : "bg-muted-foreground/50")
              }
            />
            <span
              className={isSafe ? "text-foreground" : "text-muted-foreground"}
            >
              {p}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
