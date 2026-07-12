"use client";

import { useState } from "react";
import { Check, Copy, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The install command. In the free beta the CLI + auth-gated download is not
 * live yet, so the command is shown for shape and copy, with a clear beta note.
 * When the CLI ships, this is the surface that requires an authenticated,
 * entitlement-checked token.
 */
export function InstallCommand({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const command = `npx vetted add @vetted/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard may be unavailable; no-op
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background/70 p-1 pl-3">
        <span className="select-none font-mono text-sm text-muted-foreground">
          $
        </span>
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-foreground">
          {command}
        </code>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            copied
              ? "text-safe"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
          aria-label="Copy install command"
        >
          {copied ? (
            <>
              <Check className="size-3.5" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3" aria-hidden />
        The authenticated CLI arrives after beta. Downloads will require your
        account token.
      </p>
    </div>
  );
}
