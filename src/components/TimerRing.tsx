import { formatClock } from "@/hooks/useCountdown";

type Props = {
  remaining: number;
  total: number;
  label: string;
  tone?: "primary" | "urgent";
  size?: number;
};

export function TimerRing({ remaining, total, label, tone = "primary", size = 260 }: Props) {
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const stroke = tone === "urgent" ? "var(--color-urgent)" : "var(--color-primary)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 300ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground uppercase">
          {label}
        </span>
        <span
          className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl"
          style={{ color: stroke }}
        >
          {formatClock(remaining)}
        </span>
      </div>
    </div>
  );
}
