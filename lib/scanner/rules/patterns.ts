import type { Severity } from "../types";

/**
 * Deterministic rule tables. Kept in one place so they're easy to audit and
 * tune. Each rule matches raw text; the layer decides final severity using
 * context (e.g. a hit in the always-loaded description is escalated).
 */

export interface Rule {
  id: string;
  category: string;
  /** base severity; the description field escalates instruction-override hits */
  severity: Severity;
  title: string;
  description: string;
  re: RegExp;
}

// Instruction-override / social-engineering of the agent.
export const INSTRUCTION_RULES: Rule[] = [
  {
    id: "override_ignore",
    category: "instruction_override",
    severity: "high",
    title: "Prompt-override phrasing",
    description:
      "Language that tries to override prior instructions is a classic prompt-injection tell.",
    re: /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|earlier|above)\s+(instructions?|prompts?|messages?)\b/i,
  },
  {
    id: "override_conceal",
    category: "instruction_override",
    severity: "high",
    title: "Instruction to hide actions from the user",
    description:
      "Asking the agent to conceal what it's doing from the user indicates malicious intent.",
    re: /\b(do not|don't|never)\s+(tell|inform|mention|reveal|show)\s+(the\s+)?(user|human|them)\b/i,
  },
  {
    id: "override_roleplay",
    category: "instruction_override",
    severity: "medium",
    title: "Attempt to change the agent's role or system prompt",
    description:
      "Text that redefines the agent's identity or system prompt can subvert its guardrails.",
    re: /\b(you are now|from now on you are|new system prompt|act as (an? )?(unrestricted|jailbroken))\b/i,
  },
];

// Secret / credential reads.
export const SECRET_RULES: Rule[] = [
  {
    id: "secret_ssh",
    category: "secret_read",
    severity: "high",
    title: "Reference to private SSH key material",
    description:
      "Reading ~/.ssh or id_rsa is a common credential-exfiltration step. Skills should never need this.",
    re: /(~\/\.ssh|id_rsa|id_ed25519|authorized_keys)/i,
  },
  {
    id: "secret_dotenv",
    category: "secret_read",
    severity: "medium",
    title: "Reference to environment/secret files",
    description:
      "Access to .env, .npmrc, or credential files can leak API keys and tokens.",
    re: /(\.env(\.[a-z]+)?\b|\.npmrc|\.aws\/credentials|\.netrc|\.git-credentials)/i,
  },
  {
    id: "secret_cloud",
    category: "secret_read",
    severity: "medium",
    title: "Reference to cloud credential material",
    description:
      "Mentions of cloud access keys or service-account material are worth reviewing.",
    re: /\b(AWS_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID|AKIA[0-9A-Z]{8,}|GOOGLE_APPLICATION_CREDENTIALS|service_account\.json|PRIVATE KEY)\b/,
  },
];

// Network egress.
export const NETWORK_RULES: Rule[] = [
  {
    id: "net_ip_literal",
    category: "network_egress",
    severity: "low",
    title: "Raw IP address literal",
    description:
      "Hard-coded IP addresses can be an exfiltration endpoint that bypasses domain review.",
    re: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/,
  },
  {
    id: "net_fetch",
    category: "network_egress",
    severity: "low",
    title: "Outbound network call in instructions",
    description:
      "Instructions that fetch external content can pull in untrusted, injectable data.",
    re: /\b(curl|wget|fetch\(|https?:\/\/[^\s)]+|nc\s+-)/i,
  },
];

export const ALL_RULES: Rule[] = [
  ...INSTRUCTION_RULES,
  ...SECRET_RULES,
  ...NETWORK_RULES,
];
