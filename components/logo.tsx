import { cn } from "@/lib/utils";

/**
 * Wordmark + shield-check mark. The shield ties the brand to the product's
 * job (vetting) and the emerald tick is the same "verified-safe" signal used
 * on every skill badge.
 */
export function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 24 24"
        className="size-6 text-primary"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 2.5 20 5.4v6.1c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V5.4L12 2.5Z"
          className="fill-primary/15 stroke-primary"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="m8.6 12.1 2.3 2.3 4.5-4.7"
          className="stroke-primary"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Vetted
          <span className="text-muted-foreground"> · Skills</span>
        </span>
      )}
    </span>
  );
}
