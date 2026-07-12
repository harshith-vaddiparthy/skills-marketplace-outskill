import {
  FileWarning,
  Eye,
  TerminalSquare,
  Bot,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SEVERITY_META, type Severity } from "@/lib/trust";
import type { SampleFinding } from "@/lib/sample-data";

const LAYER_ICON = {
  hidden_text: Eye,
  dangerous_pattern: FileWarning,
  script_analysis: TerminalSquare,
  llm_injection: Bot,
} as const;

const LAYER_LABEL = {
  hidden_text: "Hidden text",
  dangerous_pattern: "Instruction pattern",
  script_analysis: "Script analysis",
  llm_injection: "LLM classifier",
} as const;

const SEVERITY_ORDER: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

export function FindingsList({ findings }: { findings: SampleFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-safe/10 p-4 ring-1 ring-inset ring-safe/25">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-safe" aria-hidden />
        <div>
          <p className="text-sm font-medium text-safe">No findings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Every scanner layer passed with nothing worth flagging.
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return (
    <ul className="grid gap-3">
      {sorted.map((f) => {
        const Icon = LAYER_ICON[f.layer];
        const sev = SEVERITY_META[f.severity];
        return (
          <li
            key={f.id}
            className="rounded-xl border border-border bg-card/60 p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  sev.surface,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                      sev.surface,
                    )}
                  >
                    {sev.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {LAYER_LABEL[f.layer]}
                  </span>
                  {typeof f.confidence === "number" && (
                    <span className="text-xs text-muted-foreground">
                      · {Math.round(f.confidence * 100)}% confidence
                    </span>
                  )}
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {f.filePath ?? "SKILL.md · description"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {f.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {f.description}
                </p>
                {f.evidence && (
                  <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-background/80 px-3 py-2 font-mono text-xs text-foreground/90">
                    <code>{f.evidence}</code>
                  </pre>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
