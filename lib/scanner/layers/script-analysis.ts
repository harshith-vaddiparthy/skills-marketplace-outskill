import type { Finding, ParsedSkillFile, Severity } from "../types";

/**
 * Layer 3 — static analysis of bundled scripts. We NEVER execute a submitted
 * script; we read it. Heuristics are language-agnostic and intentionally
 * conservative, and every finding is labeled as heuristic.
 *
 * The most dangerous pattern is remote-code-fetch (curl | bash), which is
 * arbitrary code execution at install/invocation time.
 */

interface ScriptRule {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  re: RegExp;
}

const SCRIPT_RULES: ScriptRule[] = [
  {
    id: "remote_code_fetch",
    category: "remote_code_fetch",
    severity: "critical",
    title: "Downloads and executes remote code",
    description:
      "The script pipes downloaded content straight into a shell or interpreter. This is arbitrary remote code execution on the user's machine.",
    // curl/wget ... | bash|sh|python, or eval of a fetched string
    re: /(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba)?sh\b|(curl|wget)\b[^\n|]*\|\s*python\d?\b/i,
  },
  {
    id: "subprocess_exec",
    category: "code_execution",
    severity: "medium",
    title: "Spawns subprocesses or evaluates dynamic code",
    description:
      "Use of exec/eval/subprocess/child_process lets the script run arbitrary commands. Review what it runs.",
    re: /\b(os\.system|subprocess\.(Popen|call|run)|child_process|execSync|spawnSync|eval\(|exec\()/,
  },
  {
    id: "script_network",
    category: "network_egress",
    severity: "medium",
    title: "Makes outbound network requests",
    description:
      "The script contacts an external host at runtime. Outbound requests can leak context or pull in untrusted content.",
    re: /\b(requests\.(get|post)|urllib|http\.client|fetch\(|axios|socket\.|nc\s+-)/i,
  },
  {
    id: "script_secret_read",
    category: "secret_read",
    severity: "high",
    title: "Reads credential material",
    description:
      "The script references SSH keys, dotenv, or cloud credentials. Bundled scripts should not need secrets.",
    re: /(~\/\.ssh|id_rsa|\.env\b|\.aws\/credentials|\.npmrc|AWS_SECRET_ACCESS_KEY)/i,
  },
  {
    id: "script_obfuscation",
    category: "obfuscation",
    severity: "high",
    title: "Obfuscated / encoded payload",
    description:
      "Base64/hex decoding piped into execution is a common way to hide a malicious payload from static review.",
    re: /(base64\s+-d|b64decode|atob\()[^\n]*\|\s*(ba)?sh|eval\([^)]*(atob|Buffer\.from)/i,
  },
];

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") line++;
  }
  return line;
}

export function analyzeScripts(files: ParsedSkillFile[]): Finding[] {
  const findings: Finding[] = [];
  let n = 0;

  for (const file of files) {
    if (!file.isScript) continue;
    for (const rule of SCRIPT_RULES) {
      const m = file.content.match(rule.re);
      if (!m) continue;
      const index = typeof m.index === "number" ? m.index : 0;
      findings.push({
        id: `script_${rule.id}_${n++}`,
        layer: "script_analysis",
        severity: rule.severity,
        category: rule.category,
        title: rule.title,
        description: rule.description + " (heuristic; script was not executed)",
        filePath: file.path,
        location: { line: lineOf(file.content, index), offset: index },
        evidence: m[0].slice(0, 200),
        source: "deterministic",
      });
    }
  }

  return findings;
}
