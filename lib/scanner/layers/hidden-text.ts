import type { Finding, Severity } from "../types";

/**
 * Layer 1 — hidden / obfuscated text.
 *
 * Attackers hide instructions where a human reviewer can't see them but the
 * model still reads them: Unicode Tag characters (U+E0000..U+E007F) that render
 * invisibly, bidi overrides, zero-width characters, and instruction-like HTML
 * comments. We decode the payload and surface it as evidence.
 *
 * IMPORTANT: this must run on the RAW string before any Unicode normalization,
 * or the very characters we're hunting get stripped first.
 */

const TAG_START = 0xe0000;
const TAG_END = 0xe007f;

// Bidi controls + zero-width / invisible formatting characters.
const BIDI = new Set([
  0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069,
  0x200e, 0x200f,
]);
const ZERO_WIDTH = new Set([0x200b, 0x200c, 0x200d, 0x2060, 0xfeff]);

/** Decode a Unicode Tag run back to its ASCII meaning. */
function decodeTag(codepoint: number): string {
  // Tag chars map to ASCII 0x20..0x7E by subtracting 0xE0000.
  const ascii = codepoint - TAG_START;
  if (ascii >= 0x20 && ascii <= 0x7e) return String.fromCharCode(ascii);
  return "";
}

function mkId(prefix: string, n: number): string {
  return `${prefix}_${n}`;
}

/**
 * Extract the decoded text of any Unicode Tag run in `text`. The pipeline feeds
 * this back through the dangerous-pattern rules, because a hidden payload is
 * exactly where the malicious instruction lives (it's invisible to L2's raw
 * scan otherwise).
 */
export function extractDecodedHiddenText(text: string): string {
  let decoded = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp >= TAG_START && cp <= TAG_END) decoded += decodeTag(cp);
  }
  return decoded;
}

export function detectHiddenText(
  text: string,
  filePath: string | null,
): Finding[] {
  const findings: Finding[] = [];
  let n = 0;

  // 1) Unicode Tag payloads (the big one). Collect contiguous tag runs.
  let tagBuffer = "";
  let tagCount = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp >= TAG_START && cp <= TAG_END) {
      tagBuffer += decodeTag(cp);
      tagCount++;
    }
  }
  if (tagCount > 0) {
    // In the always-loaded description a hidden payload is critical (it enters
    // the system prompt every session); elsewhere it's still high.
    const severity: Severity = filePath === null ? "critical" : "high";
    findings.push({
      id: mkId("hidden_tag", n++),
      layer: "hidden_text",
      severity,
      category: "hidden_unicode",
      title: "Hidden instructions smuggled via invisible Unicode Tag characters",
      description:
        `Found ${tagCount} invisible Unicode Tag characters (U+E0000..U+E007F). ` +
        "These render as nothing to a human but are read by the model. Decoded, " +
        "they contain the text shown as evidence." +
        (filePath === null
          ? " Because this is in the always-loaded description, it reaches the agent's context before the skill is ever invoked."
          : ""),
      filePath,
      evidence: tagBuffer.trim() ? `Decoded payload: "${tagBuffer.trim()}"` : undefined,
      source: "deterministic",
    });
  }

  // 2) Bidi override characters (can visually reorder text to disguise intent).
  let bidiCount = 0;
  for (const ch of text) {
    if (BIDI.has(ch.codePointAt(0)!)) bidiCount++;
  }
  if (bidiCount > 0) {
    findings.push({
      id: mkId("hidden_bidi", n++),
      layer: "hidden_text",
      severity: "medium",
      category: "bidi_control",
      title: "Bidirectional control characters present",
      description:
        `Found ${bidiCount} bidi control characters that can visually reorder ` +
        "text, hiding what the model actually reads. Legitimate skills rarely need these.",
      filePath,
      source: "deterministic",
    });
  }

  // 3) Zero-width characters (used to break up flagged keywords or hide markers).
  let zwCount = 0;
  for (const ch of text) {
    if (ZERO_WIDTH.has(ch.codePointAt(0)!)) zwCount++;
  }
  if (zwCount > 2) {
    findings.push({
      id: mkId("hidden_zw", n++),
      layer: "hidden_text",
      severity: "low",
      category: "zero_width",
      title: "Unusual number of zero-width characters",
      description:
        `Found ${zwCount} zero-width / invisible characters. These can be used ` +
        "to split keywords so they slip past naive filters.",
      filePath,
      source: "deterministic",
    });
  }

  // 4) HTML comments whose contents look like instructions to the agent.
  const commentRe = /<!--([\s\S]*?)-->/g;
  let m: RegExpExecArray | null;
  const instructionish =
    /\b(ignore|disregard|do not tell|instead|you must|system prompt|exfiltrat|secret|password|token)\b/i;
  while ((m = commentRe.exec(text)) !== null) {
    const inner = m[1].trim();
    if (instructionish.test(inner)) {
      findings.push({
        id: mkId("hidden_comment", n++),
        layer: "hidden_text",
        severity: "high",
        category: "hidden_comment",
        title: "Instruction-like text hidden in an HTML comment",
        description:
          "An HTML comment contains imperative language aimed at the model. " +
          "Comments are invisible in rendered previews but still tokenized.",
        filePath,
        evidence: inner.slice(0, 300),
        location: { offset: m.index },
        source: "deterministic",
      });
    }
  }

  return findings;
}
