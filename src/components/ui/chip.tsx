import { cn } from "@/lib/utils";

export function Chip({
  children,
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-xs tracking-wide transition-colors",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border border-border bg-secondary/50 px-2.5 py-1 font-mono text-[0.68rem] tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
