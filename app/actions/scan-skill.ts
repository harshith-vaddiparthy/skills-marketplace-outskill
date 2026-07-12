"use server";

import Anthropic from "@anthropic-ai/sdk";

import { scanSkill } from "@/lib/scanner";
import type { AnthropicLike, ScanResult } from "@/lib/scanner";
import { parseSkill, SkillParseError } from "@/lib/skills/parse";

export type ScanActionResult =
  | { ok: true; result: ScanResult }
  | { ok: false; error: string; issues?: string[] };

/**
 * Server action: parse a pasted SKILL.md and run the REAL scanner against it.
 * The LLM layer is wired in only when ANTHROPIC_API_KEY is present; otherwise
 * the deterministic layers (1-3) still run and the scan completes.
 *
 * This is the same scanSkill() the publish pipeline and future CLI use — the
 * publish page calls it so a pasted malicious skill is genuinely blocked.
 */
export async function scanPastedSkill(
  skillMdRaw: string,
): Promise<ScanActionResult> {
  if (!skillMdRaw || skillMdRaw.trim().length === 0) {
    return { ok: false, error: "Paste a SKILL.md to scan." };
  }

  let bundle;
  try {
    bundle = parseSkill(skillMdRaw);
  } catch (err) {
    if (err instanceof SkillParseError) {
      return { ok: false, error: err.message, issues: err.issues };
    }
    return { ok: false, error: "Could not parse the skill." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // The SDK client satisfies the scanner's minimal AnthropicLike shape.
  const anthropic: AnthropicLike | undefined = apiKey
    ? (new Anthropic({ apiKey }) as unknown as AnthropicLike)
    : undefined;

  try {
    const result = await scanSkill(bundle, { anthropic, timeoutMs: 12_000 });
    return { ok: true, result };
  } catch {
    return { ok: false, error: "The scan failed to run. Please try again." };
  }
}
