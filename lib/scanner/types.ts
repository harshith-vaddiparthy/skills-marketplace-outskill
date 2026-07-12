/**
 * Scanner contract. This module is framework- and DB-free on purpose: it takes
 * a parsed skill bundle and returns a structured ScanResult. The web app, the
 * publish action, and (later) the CLI all import the same scanSkill().
 */

export type TrustTier = "verified_safe" | "caution" | "blocked";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type ScanLayer =
  | "hidden_text"
  | "dangerous_pattern"
  | "script_analysis"
  | "llm_injection";

export type FindingSource = "deterministic" | "llm";

export interface Finding {
  /** Stable within a single scan. */
  id: string;
  layer: ScanLayer;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  /** null => the finding is in the SKILL.md description/body itself. */
  filePath: string | null;
  location?: { line?: number; column?: number; offset?: number };
  /** Matched snippet OR the DECODED hidden payload. */
  evidence?: string;
  /** 0..1, LLM layer only. */
  confidence?: number;
  source: FindingSource;
}

export interface ParsedSkillFile {
  path: string;
  content: string;
  contentType: string;
  isScript: boolean;
  sizeBytes: number;
}

export interface ParsedSkillBundle {
  skillMd: {
    frontmatter: { name: string; description: string; [k: string]: unknown };
    body: string;
  };
  files: ParsedSkillFile[];
  meta: { source: "upload" | "github"; sourceUrl?: string };
}

export interface LlmVerdict {
  model: string;
  isInjection: boolean;
  confidence: number;
  categories: string[];
  explanation: string;
  ranAt: string;
  error?: string;
}

export type LayerStatus = "ok" | "skipped" | "error";

export interface ScanResult {
  /** sha256 hex of the canonical bundle — immutable version identity. */
  contentHash: string;
  /** semver of the pipeline + ruleset, stored for reproducibility. */
  scannerVersion: string;
  trustTier: TrustTier;
  /** 0..100 */
  riskScore: number;
  findings: Finding[];
  layerStatus: Record<ScanLayer, LayerStatus>;
  llm?: LlmVerdict;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

/** Minimal shape the LLM layer needs, so a mock can be injected in tests. */
export interface AnthropicLike {
  messages: {
    create: (args: unknown) => Promise<unknown>;
  };
}

export interface ScanOptions {
  anthropic?: AnthropicLike;
  /** Overall LLM-layer timeout. Deterministic layers always run. */
  timeoutMs?: number;
  /** Deterministic timestamp for tests. */
  now?: () => Date;
}

export const SCANNER_VERSION = "scanner@0.1.0";
