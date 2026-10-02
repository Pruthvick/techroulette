import { useEffect, useRef, useState } from "react";
import type { Concept } from "@/data/concepts";

const ITEM_H = 88;
const SPIN_MS = 2800;

type Props = {
  pool: Concept[];
  /** Increment to trigger a spin. */
  spinKey: number;
  onLanded: (c: Concept) => void;
};

/** Slot-machine reel that scrolls through real concepts and eases to a stop. */
export function Roulette({ pool, spinKey, onLanded }: Props) {
  const [reel, setReel] = useState<Concept[]>([]);
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [landed, setLanded] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (spinKey === 0 || pool.length === 0) return;
    const items: Concept[] = [];
    for (let i = 0; i < 44; i++) items.push(pool[Math.floor(Math.random() * pool.length)]!);
    setLanded(false);
    setAnimating(false);
    setOffset(0);
    setReel(items);
    doneRef.current = false;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimating(true);
        setOffset((items.length - 2) * ITEM_H);
      }),
    );
    const t = globalThis.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      setLanded(true);
      onLanded(items[items.length - 2]!);
    }, SPIN_MS + 80);
    return () => {
      cancelAnimationFrame(raf);
      globalThis.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey]);

  const winner = landed ? reel.length - 2 : -1;

  return (
    <div
      className={`card-surface relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl transition-shadow duration-500 ${landed ? "glow-primary" : ""}`}
      style={{ height: ITEM_H * 3 }}
    >
      {reel.length === 0 ? (
        <div className="grid h-full place-items-center font-mono text-7xl font-bold text-muted-foreground">
          ?
        </div>
      ) : (
        <div
          style={{
            transform: `translateY(${-offset + ITEM_H}px)`,
            transition: animating ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.18, 1)` : "none",
            filter: animating && !landed ? undefined : "none",
          }}
        >
          {reel.map((c, i) => (
            <div
              key={i}
              className={`flex items-center justify-center px-4 text-center font-mono font-bold transition-all duration-500 ${
                i === winner ? "scale-110 text-2xl text-primary sm:text-3xl" : "text-xl text-muted-foreground/70 sm:text-2xl"
              }`}
              style={{ height: ITEM_H }}
            >
              <span className="truncate">{c.name}</span>
            </div>
          ))}
        </div>
      )}
      {/* selection window + fades */}
      <div
        className="pointer-events-none absolute inset-x-3 rounded-xl border-2 border-primary/50"
        style={{ top: ITEM_H, height: ITEM_H }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}
