import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { TimerRing } from "@/components/TimerRing";
import { Roulette } from "@/components/Roulette";
import { Chip, Tag } from "@/components/ui/chip";
import { formatClock, useCountdown } from "@/hooks/useCountdown";
import { useProgress, readRecentIds, dayKey } from "@/hooks/useProgress";
import { playChime } from "@/lib/chime";
import {
  categories,
  concepts,
  difficulties,
  pickRandomConcept,
  type Concept,
  type Difficulty,
} from "@/data/concepts";

const LEARN_MS = 15 * 60 * 1000;
const EXPLAIN_MS = 60 * 1000;

type Phase = "setup" | "learning" | "explain" | "complete";

export const Route = createFileRoute("/drop")({
  validateSearch: (search: Record<string, unknown>): { concept?: string; spin?: boolean } => {
    const raw = search["concept"];
    const out: { concept?: string; spin?: boolean } = {};
    if (typeof raw === "string") out.concept = raw;
    if (search["spin"] === true || search["spin"] === "1" || search["spin"] === 1) out.spin = true;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Spin a concept — Tech Roulette" },
      {
        name: "description",
        content:
          "Spin the roulette for a random concept, learn it for 15 minutes, then explain it out loud in 60 seconds.",
      },
      { property: "og:title", content: "Tech Roulette — 15 minutes on the clock" },
      {
        property: "og:description",
        content: "A random CS or AI/ML concept, a 15-minute learning timer and a 60-second explanation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DropPage,
});

function DropPage() {
  const { concept: presetId, spin: autoSpin } = Route.useSearch();
  const navigate = useNavigate();
  const { progress, markAttempt, markComplete, annotateLatest, toggleSound } = useProgress();

  const [phase, setPhase] = useState<Phase>("setup");
  const [firstToday, setFirstToday] = useState(false);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [explanation, setExplanation] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [struggle, setStruggle] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [revealed, setRevealed] = useState<Concept | null>(null);

  const soundOn = progress.soundOn;

  const explain = useCountdown(EXPLAIN_MS, () => {
    playChime(soundOn);
    setPhase("complete");
  });

  const learn = useCountdown(LEARN_MS, () => {
    playChime(soundOn);
    setPhase("explain");
    explain.start(EXPLAIN_MS);
  });

  const beginDrop = useCallback(
    (picked?: Concept | null) => {
      const next =
        picked ?? pickRandomConcept({ category, difficulty, exclude: readRecentIds().slice(0, 12) });
      if (!next) {
        setError("No concepts match those filters. Try widening the category or difficulty.");
        return;
      }
      setError(null);
      setConcept(next);
      setExplanation("");
      setConfidence(null);
      setStruggle("");
      setPhase("learning");
      markAttempt(next.id);
      learn.start(LEARN_MS);
    },
    [category, difficulty, learn, markAttempt],
  );

  // Deep link from Explore: drop a specific concept immediately.
  useEffect(() => {
    if (!presetId) return;
    const found = concepts.find((c) => c.id === presetId);
    if (found) beginDrop(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId]);

  // Record completion once the explain timer finishes.
  useEffect(() => {
    if (phase !== "complete" || !concept) return;
    setFirstToday(progress.lastDay !== dayKey());
    markComplete(
      {
        id: concept.id,
        name: concept.name,
        category: concept.category,
        difficulty: concept.difficulty,
      },
      LEARN_MS,
      EXPLAIN_MS,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const active = phase === "learning" ? learn : phase === "explain" ? explain : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea/i.test(target.tagName)) return;
      if (e.code === "Space" && active) {
        e.preventDefault();
        active.toggle();
      } else if (e.key.toLowerCase() === "n") {
        if (!spinning) {
          setPhase("setup");
          startSpin();
        }
      } else if (e.key === "Escape") {
        void navigate({ to: "/" });
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [active, beginDrop, navigate]);

  const pool = useMemo(
    () =>
      concepts.filter(
        (c) => (!category || c.category === category) && (!difficulty || c.difficulty === difficulty),
      ),
    [category, difficulty],
  );

  function startSpin() {
    if (spinning) return;
    if (pool.length === 0) {
      setError("No concepts match those filters. Try widening the category or difficulty.");
      return;
    }
    setError(null);
    setShowFilters(false);
    setSpinning(true);
    setSpinKey((k) => k + 1);
  }

  // Auto-spin when arriving from the home SPIN button.
  useEffect(() => {
    if (autoSpin && !presetId) startSpin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`min-h-screen ${phase === "explain" ? "bg-urgent-glow" : "bg-hero-glow"} transition-colors`}
    >
      <SiteNav />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {phase === "setup" && (
          <div className="animate-fade-in flex flex-col items-center text-center">
            <h1 className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-gradient">TECH ROULETTE</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {revealed ? "" : spinning ? "Spinning…" : "What will you learn today?"}
            </p>
            <p className="mt-4 font-mono text-[0.7rem] tracking-[0.15em] text-muted-foreground uppercase">
              Topic: {category ?? "All"} · Difficulty: {difficulty ?? "Random"}
            </p>

            <div className="mt-6 w-full">
              <Roulette
                pool={pool}
                spinKey={spinKey}
                onLanded={(c) => {
                  setRevealed(c);
                  playChime(soundOn);
                  globalThis.setTimeout(() => {
                    setSpinning(false);
                    setRevealed(null);
                    beginDrop(c);
                  }, 1800);
                }}
              />
            </div>

            {revealed && (
              <div className="animate-scale-in mt-6">
                <p className="font-mono text-[0.7rem] tracking-[0.35em] text-primary uppercase">
                  🎰 You got
                </p>
                <p className="mt-2 font-mono text-3xl font-bold uppercase sm:text-4xl">
                  {revealed.name}
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Tag>{revealed.category}</Tag>
                  <Tag>{revealed.difficulty}</Tag>
                </div>
              </div>
            )}

            {error && <p className="mt-3 font-mono text-xs text-destructive">{error}</p>}

            {!revealed && (
              <button
                onClick={startSpin}
                disabled={spinning}
                className="glow-primary mt-8 rounded-full bg-primary px-14 py-4 font-mono text-lg font-bold tracking-[0.25em] text-primary-foreground transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
              >
                {spinning ? "SPINNING..." : "SPIN"}
              </button>
            )}

            {!spinning && (
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="mt-5 font-mono text-xs tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                {showFilters ? "HIDE FILTERS" : "FILTERS"}
              </button>
            )}

            {showFilters && !spinning && (
              <div className="card-surface animate-fade-in mt-4 w-full rounded-xl p-5 text-left">
                <p className="font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground uppercase">
                  Topic
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip active={!category} onClick={() => setCategory(null)}>
                    All Topics
                  </Chip>
                  {categories.map((c) => (
                    <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
                <p className="mt-6 font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground uppercase">
                  Difficulty
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip active={!difficulty} onClick={() => setDifficulty(null)}>
                    Random
                  </Chip>
                  {difficulties.map((d) => (
                    <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                      {d}
                    </Chip>
                  ))}
                </div>
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  {pool.length} concepts on the wheel
                </p>
              </div>
            )}
          </div>
        )}

        {phase === "learning" && concept && (
          <div className="animate-fade-in flex flex-col items-center text-center">
            <p className="font-mono text-[0.7rem] tracking-[0.35em] text-primary uppercase">
              Your spin
            </p>
            <div className="card-surface glow-primary mt-5 w-full rounded-2xl px-6 py-10">
              <h1 className="font-mono text-3xl font-bold break-words sm:text-5xl">
                {concept.name}
              </h1>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Tag>{concept.category}</Tag>
                <Tag>{concept.difficulty}</Tag>
              </div>
              <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Your challenge: </span>
                understand it well enough to explain it without looking at your notes.
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <TimerRing
                remaining={learn.remaining}
                total={LEARN_MS}
                label="Learning phase"
                tone="primary"
              />
              <p className="mt-6 font-mono text-sm leading-relaxed text-muted-foreground">
                Understand it.
                <br />
                Break it down.
                <br />
                Make it yours.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <ControlButton onClick={learn.toggle}>
                {learn.running ? "PAUSE" : "RESUME"}
              </ControlButton>
              <ControlButton onClick={() => learn.start(LEARN_MS)}>RESTART</ControlButton>
              <ControlButton onClick={() => beginDrop()}>NEW CONCEPT</ControlButton>
              <ControlButton
                onClick={() => {
                  setPhase("explain");
                  explain.start(EXPLAIN_MS);
                }}
              >
                SKIP TO EXPLAIN
              </ControlButton>
            </div>
          </div>
        )}

        {phase === "explain" && concept && (
          <div className="animate-fade-in flex flex-col items-center text-center">
            <h1 className="font-mono text-2xl font-bold tracking-[0.1em] text-urgent uppercase sm:text-4xl">
              Time to explain.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Imagine someone just asked you:
            </p>
            <p className="card-surface glow-urgent mt-4 w-full rounded-xl px-6 py-6 font-mono text-xl sm:text-2xl">
              “{concept.interviewQuestion}”
            </p>

            <div className="mt-8">
              <TimerRing
                remaining={explain.remaining}
                total={EXPLAIN_MS}
                label="Explain mode"
                tone="urgent"
                size={200}
              />
            </div>
            <p className="mt-4 font-mono text-sm font-semibold text-urgent">
              You have 60 seconds.
            </p>

            <div className="mt-6 w-full text-left">
              <p className="font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground uppercase">
                Try to cover
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["What is it?", "Why is it used?", "How does it work?", "One example", "One limitation"].map(
                  (p) => (
                    <Tag key={p}>{p}</Tag>
                  ),
                )}
              </div>

              <label className="mt-6 block font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Your explanation
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={6}
                placeholder="Explain this concept in your own words…"
                className="mt-2 w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-urgent/60"
              />
              <SpeechButton onText={(t) => setExplanation((prev) => (prev ? prev + " " + t : t))} />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <ControlButton onClick={explain.toggle}>
                {explain.running ? "PAUSE" : "RESUME"}
              </ControlButton>
              <ControlButton onClick={() => setPhase("complete")}>FINISH NOW</ControlButton>
            </div>
          </div>
        )}

        {phase === "complete" && concept && (
          <div className="animate-fade-in">
            <h1 className="font-mono text-2xl font-bold tracking-[0.15em] text-primary uppercase sm:text-3xl">
              Session complete
            </h1>
            {firstToday && (
              <div className="animate-scale-in card-surface glow-urgent mt-5 inline-block rounded-xl px-5 py-3">
                <p className="font-mono text-sm font-bold tracking-[0.15em] text-urgent">
                  <span className="inline-block animate-bounce">🔥</span> STREAK CONTINUED!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {progress.streak} {progress.streak === 1 ? "day" : "days"} and counting.
                </p>
              </div>
            )}
            <p className="mt-4 text-lg">
              You just spent 16 minutes with{" "}
              <span className="font-mono font-bold text-foreground">{concept.name}</span>.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Tag>Learning time: 15 min</Tag>
              <Tag>Explanation time: 1 min</Tag>
              {progress.streak > 0 && <Tag>🔥 {progress.streak} day streak</Tag>}
            </div>

            <div className="card-surface mt-8 rounded-xl p-6">
              <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
                Reflection
              </h2>
              <p className="mt-3 text-sm">How confident are you explaining this concept now?</p>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setConfidence(n);
                      annotateLatest({ confidence: n });
                    }}
                    className={`size-11 rounded-lg border font-mono text-sm transition-colors ${
                      confidence === n
                        ? "border-primary/60 bg-primary/20 text-primary"
                        : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <label className="mt-6 block font-mono text-xs tracking-wide text-muted-foreground uppercase">
                What did you struggle with?
              </label>
              <textarea
                value={struggle}
                onChange={(e) => setStruggle(e.target.value)}
                onBlur={() => annotateLatest({ struggle })}
                rows={3}
                placeholder="Optional"
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  annotateLatest({ struggle });
                  beginDrop();
                }}
                className="glow-primary flex-1 rounded-lg bg-primary px-6 py-3.5 font-mono text-sm font-bold tracking-[0.15em] text-primary-foreground"
              >
                DROP ANOTHER
              </button>
              <Link
                to="/"
                className="flex-1 rounded-lg border border-border px-6 py-3.5 text-center font-mono text-sm tracking-[0.15em] hover:border-primary/40"
              >
                BACK TO HOME
              </Link>
            </div>
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
          <button
            onClick={() => setShowShortcuts((s) => !s)}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            ⌨ Keyboard shortcuts
          </button>
          <button
            onClick={toggleSound}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            {soundOn ? "🔔 Sound on" : "🔇 Sound off"}
          </button>
        </div>
        {showShortcuts && (
          <div className="card-surface animate-fade-in mt-3 rounded-xl p-5 font-mono text-xs text-muted-foreground">
            <p>
              <span className="text-foreground">Space</span> — pause / resume timer
            </p>
            <p className="mt-1.5">
              <span className="text-foreground">N</span> — new concept
            </p>
            <p className="mt-1.5">
              <span className="text-foreground">Esc</span> — back to home
            </p>
          </div>
        )}
        {active && (
          <p className="mt-4 font-mono text-[0.7rem] text-muted-foreground">
            {active.running ? "Timer running" : "Timer paused"} · {formatClock(active.remaining)} left
          </p>
        )}
      </div>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border bg-secondary/40 px-4 py-2.5 font-mono text-[0.7rem] tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      {children}
    </button>
  );
}

type RecognitionLike = {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function SpeechButton({ onText }: { onText: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  const start = () => {
    const w = globalThis as unknown as {
      SpeechRecognition?: new () => RecognitionLike;
      webkitSpeechRecognition?: new () => RecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setUnsupported(true);
      return;
    }
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (e) => {
        const last = e.results[e.results.length - 1];
        const text = last?.[0]?.transcript;
        if (text) onText(text.trim());
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => {
        setListening(false);
        setUnsupported(true);
      };
      rec.start();
      setListening(true);
      globalThis.setTimeout(() => rec.stop(), 60000);
    } catch {
      setUnsupported(true);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={start}
        disabled={listening}
        className="rounded-lg border border-border bg-secondary/40 px-4 py-2.5 font-mono text-[0.7rem] tracking-[0.15em] text-muted-foreground transition-colors hover:border-urgent/50 hover:text-foreground disabled:opacity-60"
      >
        {listening ? "🎙 LISTENING…" : "🎙 EXPLAIN ALOUD"}
      </button>
      {unsupported && (
        <p className="mt-2 font-mono text-[0.7rem] text-muted-foreground">
          Speech input isn't available in this browser — type your explanation instead.
        </p>
      )}
    </div>
  );
}
