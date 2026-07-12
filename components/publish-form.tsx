"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  UploadCloud,
  GitBranch,
  ClipboardType,
  ShieldX,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Eye,
  FileWarning,
  TerminalSquare,
  Bot,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrustBadge } from "@/components/trust-badge";
import { FindingsList } from "@/components/findings-list";
import { cn } from "@/lib/utils";
import { SCAN_LAYERS } from "@/lib/trust";
import type { SampleFinding } from "@/lib/sample-data";

const LAYER_ICONS = {
  hidden_text: Eye,
  dangerous_pattern: FileWarning,
  script_analysis: TerminalSquare,
  llm_injection: Bot,
} as const;

/**
 * The three signatures the simulated scanner reacts to. These mirror what the
 * real layers catch: a prompt-override phrase, a curl|bash remote-code fetch,
 * and invisible Unicode Tag characters (the tag-smuggling attack).
 */
const INJECT_RE = /ignore\s+previous\s+instructions/i;
const CURL_BASH_RE = /curl\b[^\n]*\|\s*(?:sudo\s+)?(?:bash|sh)\b/i;
const TAG_SMUGGLE_RE = /[\u{E0000}-\u{E007F}]/u;

const PLACEHOLDER = `---
name: my-skill
description: One sentence on what this skill does and when the agent should use it.
---

# My Skill

Explain the workflow your agent should follow, step by step.
Keep instructions concrete and never ask it to read secrets or run remote code.`;

const STEP_MS = 300;
const REVEAL_MS = 1400;

type Tab = "paste" | "upload" | "github";
type Phase = "idle" | "scanning" | "done";
type ScanResult = { blocked: boolean; findings: SampleFinding[] };

function firstMatchLine(text: string, re: RegExp): string {
  const line = text.split(/\r?\n/).find((l) => re.test(l));
  return (line ?? "").trim();
}

/**
 * Build findings from whatever the submission actually contains. Nothing is
 * faked: each finding is tied to a signature that fired on the pasted text.
 */
function buildFindings(text: string): SampleFinding[] {
  const findings: SampleFinding[] = [];

  if (TAG_SMUGGLE_RE.test(text)) {
    const count = (text.match(/[\u{E0000}-\u{E007F}]/gu) ?? []).length;
    findings.push({
      id: "scan_hidden",
      layer: "hidden_text",
      severity: "critical",
      category: "hidden_unicode",
      title: "Invisible Unicode Tag characters found in the text",
      description:
        "The submission contains characters from the Unicode Tags block that render as nothing to a human reviewer but are read by the model as instructions. This is how hidden payloads are smuggled past review.",
      filePath: null,
      evidence: `${count} invisible tag character(s) decoded from the submission`,
    });
  }

  if (INJECT_RE.test(text)) {
    findings.push({
      id: "scan_inject",
      layer: "dangerous_pattern",
      severity: "critical",
      category: "prompt_override",
      title: "Prompt-override instruction detected",
      description:
        "The skill tells the agent to disregard its prior instructions. Loaded into an agent, this hijacks the session before the user has typed a single command.",
      filePath: "SKILL.md",
      evidence: firstMatchLine(text, INJECT_RE),
    });
    findings.push({
      id: "scan_llm",
      layer: "llm_injection",
      severity: "high",
      category: "prompt_injection",
      title: "LLM classifier: high-confidence prompt injection",
      description:
        "The injection classifier rated this content a direct instruction-override attempt aimed at the agent rather than the end user.",
      filePath: null,
      confidence: 0.96,
    });
  }

  if (CURL_BASH_RE.test(text)) {
    findings.push({
      id: "scan_curl",
      layer: "script_analysis",
      severity: "critical",
      category: "remote_code_fetch",
      title: "Remote code piped straight into a shell",
      description:
        "The submission downloads a script from an external host and executes it immediately. That is arbitrary remote code execution on the installer's machine at setup time.",
      filePath: "SKILL.md",
      evidence: firstMatchLine(text, CURL_BASH_RE),
    });
  }

  return findings;
}

export function PublishForm() {
  const [tab, setTab] = useState<Tab>("paste");
  const [pasteValue, setPasteValue] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [checked, setChecked] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [, startTransition] = useTransition();

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function resetScan() {
    clearTimers();
    setPhase("idle");
    setChecked(0);
    setResult(null);
  }

  function currentInput(): { ok: boolean; text: string; error: string } {
    if (tab === "paste") {
      return {
        ok: pasteValue.trim().length > 0,
        text: pasteValue,
        error: "Paste your SKILL.md contents before scanning.",
      };
    }
    if (tab === "upload") {
      return {
        ok: fileName !== null,
        text: fileName ?? "",
        error: "Choose a skill file to scan first.",
      };
    }
    return {
      ok: repoUrl.trim().length > 0,
      text: repoUrl,
      error: "Enter a public repository URL to scan.",
    };
  }

  function handleScan() {
    const { ok, text, error } = currentInput();
    if (!ok) {
      toast.error(error);
      return;
    }

    clearTimers();
    setResult(null);
    setChecked(0);
    setPhase("scanning");

    const toastId = toast.loading("Scanning submission across four layers...");

    for (let i = 0; i < SCAN_LAYERS.length; i++) {
      timers.current.push(
        setTimeout(() => setChecked(i + 1), (i + 1) * STEP_MS),
      );
    }

    timers.current.push(
      setTimeout(() => {
        const findings = buildFindings(text);
        const blocked = findings.length > 0;

        startTransition(() => {
          setResult({ blocked, findings });
          setChecked(SCAN_LAYERS.length);
          setPhase("done");
        });

        if (blocked) {
          toast.error("Blocked. A critical finding was detected.", {
            id: toastId,
          });
        } else {
          toast.success("Verified Safe. Added to the catalog (demo).", {
            id: toastId,
          });
        }
      }, REVEAL_MS),
    );
  }

  const scanning = phase === "scanning";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="paste">
            <ClipboardType aria-hidden />
            Paste
          </TabsTrigger>
          <TabsTrigger value="upload">
            <UploadCloud aria-hidden />
            Upload
          </TabsTrigger>
          <TabsTrigger value="github">
            <GitBranch aria-hidden />
            Import from GitHub
          </TabsTrigger>
        </TabsList>

        {/* -------------------------------------------------------- paste */}
        <TabsContent value="paste" className="mt-5">
          <div className="grid gap-2">
            <Label htmlFor="skill-md">SKILL.md contents</Label>
            <Textarea
              id="skill-md"
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder={PLACEHOLDER}
              spellCheck={false}
              className="min-h-64 font-mono text-sm leading-relaxed"
              disabled={scanning}
            />
            <p className="text-xs text-muted-foreground">
              Trying the scanner? Paste a snippet with{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.8em]">
                curl ... | bash
              </code>{" "}
              or the phrase &ldquo;ignore previous instructions&rdquo; and watch
              it get blocked.
            </p>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------- upload */}
        <TabsContent value="upload" className="mt-5">
          <div className="grid gap-2">
            <Label htmlFor="skill-file">Skill bundle</Label>
            <label
              htmlFor="skill-file"
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-12 text-center transition-colors hover:border-primary/40",
                scanning && "pointer-events-none opacity-60",
              )}
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <UploadCloud className="size-6" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {fileName ?? "Drop your skill bundle here"}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {fileName
                    ? "Ready to scan. Choose another file to replace it."
                    : "SKILL.md or a .zip that contains it. Click to browse."}
                </span>
              </span>
              <input
                id="skill-file"
                type="file"
                accept=".md,.zip,.tar,.tgz"
                className="sr-only"
                disabled={scanning}
                onChange={(e) =>
                  setFileName(e.target.files?.[0]?.name ?? null)
                }
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Files are read for their SKILL.md and bundled scripts. Scripts are
              analyzed statically and never executed.
            </p>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------- github */}
        <TabsContent value="github" className="mt-5">
          <div className="grid gap-2">
            <Label htmlFor="repo-url">Public repository URL</Label>
            <Input
              id="repo-url"
              type="url"
              inputMode="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/your-org/your-skill"
              disabled={scanning}
            />
            <p className="text-xs text-muted-foreground">
              Public repositories only. We fetch the SKILL.md and any bundled
              scripts, scan them, then discard the checkout.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* --------------------------------------------------------- action */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={handleScan} disabled={scanning}>
          {scanning ? (
            <>
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
              Scanning...
            </>
          ) : (
            <>
              Scan &amp; publish
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          A critical finding blocks publication. Nothing goes live until the
          scan passes.
        </p>
      </div>

      {/* ------------------------------------------------ scan + results */}
      {phase !== "idle" && (
        <div className="mt-6 border-t border-border pt-6" aria-live="polite">
          <ul className="grid gap-2">
            {SCAN_LAYERS.map((layer, i) => {
              const Icon = LAYER_ICONS[layer.key];
              const done = i < checked;
              return (
                <li
                  key={layer.key}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3"
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      done
                        ? "bg-safe/10 text-safe ring-1 ring-inset ring-safe/25"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                    {layer.name}
                  </span>
                  {done ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-safe">
                      <CheckCircle2 className="size-4" aria-hidden />
                      Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2
                        className="size-4 animate-spin motion-reduce:animate-none"
                        aria-hidden
                      />
                      Checking
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          {result && result.blocked && (
            <div className="mt-6">
              <div className="flex items-start gap-3 rounded-xl bg-danger/10 p-4 ring-1 ring-inset ring-danger/25">
                <ShieldX
                  className="mt-0.5 size-5 shrink-0 text-danger"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-danger">
                    Publication blocked
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A critical finding stops this skill from being published.
                    Nothing was added to the catalog. Fix the issues below and
                    scan again.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <FindingsList findings={result.findings} />
              </div>

              <div className="mt-5">
                <Button variant="outline" onClick={resetScan}>
                  Edit and rescan
                </Button>
              </div>
            </div>
          )}

          {result && !result.blocked && (
            <div className="mt-6">
              <TrustBadge tier="verified_safe" showBlurb />
              <p className="mt-4 text-sm text-muted-foreground">
                Your skill passed. It is now in the catalog (demo).
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href="/skills">
                    View it in the catalog
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button variant="ghost" onClick={resetScan}>
                  Publish another
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
