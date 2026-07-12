import type { Finding, Severity } from "../types";
import { ALL_RULES } from "../rules/patterns";

/**
 * Layer 2 — dangerous-instruction pattern matching.
 *
 * Runs the deterministic rule tables over a piece of text. `isDescription`
 * escalates instruction-override hits, because the description is loaded into
 * the agent's system prompt for every session (highest-value attack surface).
 */

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") line++;
  }
  return line;
}

export function matchDangerousPatterns(
  text: string,
  filePath: string | null,
  opts: { isDescription?: boolean } = {},
): Finding[] {
  const findings: Finding[] = [];
  let n = 0;

  for (const rule of ALL_RULES) {
    // Reset lastIndex for safety (rules are declared without /g, but be defensive).
    const m = text.match(rule.re);
    if (!m) continue;

    const index = typeof m.index === "number" ? m.index : 0;

    let severity: Severity = rule.severity;
    // Escalate instruction-override when it appears in the always-loaded
    // description: it fires before the user ever invokes the skill.
    if (rule.category === "instruction_override" && opts.isDescription) {
      severity = "critical";
    }

    findings.push({
      id: `pattern_${rule.id}_${n++}`,
      layer: "dangerous_pattern",
      severity,
      category: rule.category,
      title: rule.title,
      description:
        rule.description +
        (opts.isDescription
          ? " Detected in the always-loaded description."
          : ""),
      filePath,
      location: { line: lineOf(text, index), offset: index },
      evidence: m[0].slice(0, 200),
      source: "deterministic",
    });
  }

  return findings;
}
