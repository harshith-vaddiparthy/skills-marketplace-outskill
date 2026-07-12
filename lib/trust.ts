import type { LucideIcon } from "lucide-react";
import { ShieldAlert, ShieldCheck, ShieldX, ShieldQuestion } from "lucide-react";

/**
 * Trust tiers are the product's whole point: every skill carries one, derived
 * from the security scanner. These are shared by the badge, cards, and detail
 * page so the language is identical everywhere.
 */
export type TrustTier = "verified_safe" | "caution" | "blocked" | "pending";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export const TRUST_META: Record<
  TrustTier,
  {
    label: string;
    short: string;
    blurb: string;
    icon: LucideIcon;
    // Tailwind classes keyed to the semantic trust tokens in globals.css.
    dot: string;
    text: string;
    ring: string;
    surface: string;
  }
> = {
  verified_safe: {
    label: "Verified Safe",
    short: "Safe",
    blurb: "Passed every automated check with no high-risk findings.",
    icon: ShieldCheck,
    dot: "bg-safe",
    text: "text-safe",
    ring: "ring-safe/30",
    surface: "bg-safe/10 text-safe ring-1 ring-inset ring-safe/25",
  },
  caution: {
    label: "Caution",
    short: "Caution",
    blurb: "Published, but the scanner flagged findings worth reviewing.",
    icon: ShieldAlert,
    dot: "bg-caution",
    text: "text-caution",
    ring: "ring-caution/30",
    surface: "bg-caution/10 text-caution ring-1 ring-inset ring-caution/25",
  },
  blocked: {
    label: "Blocked",
    short: "Blocked",
    blurb: "A critical finding was detected. This skill cannot be published.",
    icon: ShieldX,
    dot: "bg-danger",
    text: "text-danger",
    ring: "ring-danger/30",
    surface: "bg-danger/10 text-danger ring-1 ring-inset ring-danger/25",
  },
  pending: {
    label: "Scanning",
    short: "Pending",
    blurb: "The security scan is still running.",
    icon: ShieldQuestion,
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    ring: "ring-border",
    surface: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  },
};

export const SEVERITY_META: Record<
  Severity,
  { label: string; text: string; surface: string; weight: number }
> = {
  critical: {
    label: "Critical",
    text: "text-danger",
    surface: "bg-danger/10 text-danger ring-1 ring-inset ring-danger/25",
    weight: 100,
  },
  high: {
    label: "High",
    text: "text-danger",
    surface: "bg-danger/10 text-danger ring-1 ring-inset ring-danger/20",
    weight: 25,
  },
  medium: {
    label: "Medium",
    text: "text-caution",
    surface: "bg-caution/10 text-caution ring-1 ring-inset ring-caution/25",
    weight: 10,
  },
  low: {
    label: "Low",
    text: "text-muted-foreground",
    surface: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    weight: 3,
  },
  info: {
    label: "Info",
    text: "text-muted-foreground",
    surface: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    weight: 0,
  },
};

export const SCAN_LAYERS = [
  {
    key: "hidden_text",
    name: "Hidden-text detection",
    blurb:
      "Decodes invisible Unicode, bidi, and zero-width characters that smuggle instructions past a human reviewer.",
  },
  {
    key: "dangerous_pattern",
    name: "Dangerous-instruction patterns",
    blurb:
      "Flags prompt-override phrasing, secret/credential reads, and network exfiltration in the SKILL.md.",
  },
  {
    key: "script_analysis",
    name: "Static script analysis",
    blurb:
      "Inspects bundled scripts for remote code execution, subprocess calls, and obfuscation. Never runs them.",
  },
  {
    key: "llm_injection",
    name: "LLM injection classifier",
    blurb:
      "A Claude model reads the skill and rates prompt-injection risk. A triage signal, not the final gate.",
  },
] as const;
