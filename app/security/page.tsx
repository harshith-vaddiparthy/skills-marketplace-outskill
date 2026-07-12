import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  FileWarning,
  TerminalSquare,
  Bot,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScanPreview } from "@/components/scan-preview";
import { TrustBadge } from "@/components/trust-badge";
import { LiveScanner } from "@/components/live-scanner";
import { SCAN_LAYERS, type TrustTier } from "@/lib/trust";

export const metadata: Metadata = {
  title: "How vetting works",
  description:
    "How the security scanner reads every skill: four independent layers, three trust outcomes, and an honest account of what automated vetting can and cannot catch.",
};

const LAYER_ICONS: Record<(typeof SCAN_LAYERS)[number]["key"], LucideIcon> = {
  hidden_text: Eye,
  dangerous_pattern: FileWarning,
  script_analysis: TerminalSquare,
  llm_injection: Bot,
};

// The three outcomes a scan can produce, in the order a submission moves through
// them. "pending" is a transient state, not an outcome, so it is omitted here.
const OUTCOME_TIERS: TrustTier[] = ["verified_safe", "caution", "blocked"];

export default function SecurityPage() {
  return (
    <main>
      {/* --------------------------------------------------------------- hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pt-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            How vetting works
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            How we vet every skill
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A skill is instructions and scripts that load straight into your
            agent, so we read it before you do. Every submission runs through
            four independent layers, and the result is one honest trust badge.
            Nothing reaches the catalog until it clears that scan.
          </p>
        </div>

        <div className="lg:pl-4">
          <ScanPreview />
        </div>
      </section>

      {/* -------------------------------------------------------- four layers */}
      <section className="border-t border-border/80 bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              The scanner
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              The four layers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Each layer looks for a different class of attack. They run in
              sequence, and their findings combine into a single risk score.
            </p>
          </div>

          {/* Vertical stepped timeline — a deliberately different treatment than
              the homepage's four-column grid. */}
          <ol className="mt-12 space-y-px">
            {SCAN_LAYERS.map((layer, i) => {
              const Icon = LAYER_ICONS[layer.key];
              const isLast = i === SCAN_LAYERS.length - 1;
              return (
                <li key={layer.key} className="relative flex gap-5 pb-8">
                  {/* connector rail */}
                  {!isLast && (
                    <span
                      className="absolute left-6 top-14 h-[calc(100%-3.5rem)] w-px bg-border"
                      aria-hidden
                    />
                  )}
                  <div className="relative flex flex-col items-center">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
                      <Icon className="size-5" aria-hidden />
                    </span>
                  </div>
                  <div className="flex-1 rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        Layer 0{i + 1}
                      </span>
                      <h3 className="text-base font-semibold text-foreground">
                        {layer.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {layer.blurb}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------- try it yourself */}
      <section className="border-t border-border/80">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Try the scanner yourself
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              This is the real engine, running on the server. Paste a skill and
              run it, or start from the malicious example and watch it get
              blocked with the hidden payload decoded in front of you.
            </p>
          </div>
          <div className="mt-10">
            <LiveScanner />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- trust tiers */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            The outcome
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Three trust tiers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every scan resolves to one of three outcomes. The same badge and the
            same words follow the skill across the catalog, its detail page, and
            your install.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {OUTCOME_TIERS.map((tier) => (
            <div
              key={tier}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <TrustBadge tier={tier} showBlurb />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tier === "verified_safe" &&
                  "Clean across all four layers, or only informational notes. It ships with the emerald badge and appears everywhere in the catalog."}
                {tier === "caution" &&
                  "Published, but the scanner flagged findings worth a look, like a script that makes a network call. You see every finding before you install."}
                {tier === "blocked" &&
                  "A critical finding, like a hidden instruction payload or remote code execution. The skill is rejected and never reaches the public catalog."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- honesty callout */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <Alert className="border-caution/25 bg-caution/10 text-caution">
          <ShieldOff className="size-4" aria-hidden />
          <AlertTitle className="text-caution">
            What we do not claim
          </AlertTitle>
          <AlertDescription className="text-foreground/80">
            Prompt injection is not a fully solved problem, and we will not
            pretend otherwise. Automated vetting meaningfully reduces risk, but
            it is not a guarantee. We never claim to catch everything, and we
            never execute a submitted script. Treat the trust badge as informed
            defense in depth, not a promise, and keep reading the findings
            before you install.
          </AlertDescription>
        </Alert>
      </section>

      {/* ----------------------------------------------------------- closing cta */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-card/40 px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            See the badges in the wild.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Browse skills that passed the scan, or submit your own and watch it
            run through all four layers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/skills">
                Browse skills
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/publish">Publish a skill</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
