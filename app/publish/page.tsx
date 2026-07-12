import type { Metadata } from "next";
import { Eye, FileWarning, TerminalSquare, Bot, ShieldCheck } from "lucide-react";

import { PublishForm } from "@/components/publish-form";
import { SCAN_LAYERS } from "@/lib/trust";

export const metadata: Metadata = {
  title: "Publish a skill",
  description:
    "Submit an AI agent skill. Every submission is scanned across four layers before it can reach the catalog, and a critical finding blocks publication.",
};

const LAYER_ICONS = {
  hidden_text: Eye,
  dangerous_pattern: FileWarning,
  script_analysis: TerminalSquare,
  llm_injection: Bot,
} as const;

export default function PublishPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          Scanned before it ships
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Publish a skill
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Paste your SKILL.md, upload a bundle, or import a public repo. Every
          submission runs through four independent scanner layers before it can
          reach the catalog. A single critical finding blocks publication, so
          the trust badge on a listed skill actually means something.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        <PublishForm />

        <aside className="lg:pt-1">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            What we check
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Four layers read every submission. Bundled scripts are analyzed
            statically and never executed.
          </p>

          <ul className="mt-5 grid gap-3">
            {SCAN_LAYERS.map((layer, i) => {
              const Icon = LAYER_ICONS[layer.key];
              return (
                <li
                  key={layer.key}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {layer.name}
                    </h3>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {layer.blurb}
                  </p>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </main>
  );
}
