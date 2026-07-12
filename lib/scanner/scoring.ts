import { createHash } from "node:crypto";

import type {
  Finding,
  ParsedSkillBundle,
  Severity,
  TrustTier,
} from "./types";

/**
 * Scoring, trust-tier computation, and the canonical content hash. All the
 * tunable thresholds live here as named constants so behavior is easy to audit.
 */

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 1000, // effectively a hard block via the tier rule below
  high: 25,
  medium: 10,
  low: 3,
  info: 0,
};

export const CAUTION_SCORE_THRESHOLD = 40;

export function computeRiskScore(findings: Finding[]): number {
  const raw = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return Math.min(100, raw);
}

export function computeTrustTier(findings: Finding[]): TrustTier {
  const hasCritical = findings.some((f) => f.severity === "critical");
  if (hasCritical) return "blocked";

  const hasHigh = findings.some((f) => f.severity === "high");
  const score = computeRiskScore(findings);
  if (hasHigh || score >= CAUTION_SCORE_THRESHOLD) return "caution";

  return "verified_safe";
}

export function summarize(findings: Finding[]) {
  const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) summary[f.severity]++;
  return summary;
}

/**
 * Canonical content hash: sha256 over frontmatter + body + each file
 * (path-sorted, NUL-delimited). Deterministic and order-independent, so the
 * same bundle always yields the same version identity.
 */
export function canonicalHash(bundle: ParsedSkillBundle): string {
  const hash = createHash("sha256");
  hash.update("name\0" + bundle.skillMd.frontmatter.name + "\0");
  hash.update("description\0" + bundle.skillMd.frontmatter.description + "\0");
  hash.update("body\0" + bundle.skillMd.body + "\0");

  const sorted = [...bundle.files].sort((a, b) => a.path.localeCompare(b.path));
  for (const f of sorted) {
    hash.update(f.path + "\0" + f.content + "\0");
  }
  return hash.digest("hex");
}
