import { detectHiddenText, extractDecodedHiddenText } from "./layers/hidden-text";
import { matchDangerousPatterns } from "./layers/dangerous-patterns";
import { analyzeScripts } from "./layers/script-analysis";
import { classifyInjection } from "./layers/llm-classifier";
import { canonicalHash, computeRiskScore, computeTrustTier, summarize } from "./scoring";
import {
  SCANNER_VERSION,
  type Finding,
  type LayerStatus,
  type ParsedSkillBundle,
  type ScanLayer,
  type ScanOptions,
  type ScanResult,
} from "./types";

export * from "./types";
export { computeTrustTier, computeRiskScore, canonicalHash } from "./scoring";

/**
 * The single scanner entrypoint. Framework- and DB-free: hand it a parsed
 * bundle, get back a structured ScanResult. Deterministic layers (1-3) always
 * run; the LLM layer (4) is best-effort and never blocks completion.
 */
export async function scanSkill(
  bundle: ParsedSkillBundle,
  opts: ScanOptions = {},
): Promise<ScanResult> {
  const now = opts.now ?? (() => new Date());
  const startedAt = now();

  const layerStatus: Record<ScanLayer, LayerStatus> = {
    hidden_text: "ok",
    dangerous_pattern: "ok",
    script_analysis: "ok",
    llm_injection: "skipped",
  };

  const findings: Finding[] = [];

  // ---- Layer 1: hidden text (description, body, and every reference file) ----
  const description = bundle.skillMd.frontmatter.description;
  findings.push(...detectHiddenText(description, null));
  findings.push(...detectHiddenText(bundle.skillMd.body, null));
  for (const f of bundle.files) {
    if (f.path === "SKILL.md") continue;
    findings.push(...detectHiddenText(f.content, f.path));
  }

  // ---- Layer 2: dangerous instruction patterns ----
  // Scan the visible description AND any text decoded out of a hidden Unicode
  // payload — the smuggled instruction is exactly where the real attack lives.
  const decodedDescription = extractDecodedHiddenText(description);
  findings.push(
    ...matchDangerousPatterns(description + "\n" + decodedDescription, null, {
      isDescription: true,
    }),
  );
  findings.push(...matchDangerousPatterns(bundle.skillMd.body, null));
  for (const f of bundle.files) {
    if (f.path === "SKILL.md" || f.isScript) continue;
    findings.push(...matchDangerousPatterns(f.content, f.path));
  }

  // ---- Layer 3: static script analysis ----
  findings.push(...analyzeScripts(bundle.files));

  // ---- Layer 4: LLM classifier (best-effort) ----
  const llm = await classifyInjection(bundle, opts.anthropic, {
    timeoutMs: opts.timeoutMs,
    nowIso: startedAt.toISOString(),
  });
  layerStatus.llm_injection = llm.status;
  findings.push(...llm.findings);

  // ---- Score, tier, hash, assemble ----
  const riskScore = computeRiskScore(findings);
  const trustTier = computeTrustTier(findings);
  const contentHash = canonicalHash(bundle);
  const finishedAt = now();

  return {
    contentHash,
    scannerVersion: SCANNER_VERSION,
    trustTier,
    riskScore,
    findings,
    layerStatus,
    llm: llm.verdict,
    summary: summarize(findings),
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
  };
}
