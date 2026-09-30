import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Timestamp-based countdown: stays accurate when the tab is backgrounded
 * because remaining time is derived from Date.now(), not decremented.
 */
export function useCountdown(durationMs: number, onComplete?: () => void) {
  const [remaining, setRemaining] = useState(durationMs);
  const [running, setRunning] = useState(false);
  const endAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const start = useCallback(
    (ms: number = durationMs) => {
      completedRef.current = false;
      endAtRef.current = Date.now() + ms;
      setRemaining(ms);
      setRunning(true);
    },
    [durationMs],
  );

  const pause = useCallback(() => {
    if (endAtRef.current === null) return;
    setRemaining(Math.max(0, endAtRef.current - Date.now()));
    endAtRef.current = null;
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    setRemaining((r) => {
      if (r <= 0) return r;
      endAtRef.current = Date.now() + r;
      setRunning(true);
      return r;
    });
  }, []);

  const toggle = useCallback(() => {
    if (running) pause();
    else resume();
  }, [running, pause, resume]);

  useEffect(() => {
    if (!running) return;
    let handle: ReturnType<typeof setTimeout>;
    const tick = () => {
      const endAt = endAtRef.current;
      if (endAt === null) return;
      const left = Math.max(0, endAt - Date.now());
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        endAtRef.current = null;
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }
      handle = setTimeout(tick, 250);
    };
    handle = setTimeout(tick, 250);
    return () => clearTimeout(handle);
  }, [running]);

  return { remaining, running, start, pause, resume, toggle };
}

export function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
