import { cn } from "@/lib/utils";
import { TRUST_META, type TrustTier } from "@/lib/trust";

export function TrustBadge({
  tier,
  size = "sm",
  showBlurb = false,
  className,
}: {
  tier: TrustTier;
  size?: "sm" | "lg";
  showBlurb?: boolean;
  className?: string;
}) {
  const meta = TRUST_META[tier];
  const Icon = meta.icon;

  if (showBlurb) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg p-3",
          meta.surface,
          className,
        )}
      >
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold leading-none">{meta.label}</p>
          <p className="mt-1 text-xs opacity-80">{meta.blurb}</p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        meta.surface,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
      {meta.label}
    </span>
  );
}
