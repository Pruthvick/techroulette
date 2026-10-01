import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Tag } from "@/components/ui/chip";
import { concepts } from "@/data/concepts";
import { useProgress, liveStreak } from "@/hooks/useProgress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tech Roulette — Your daily dose of technical randomness." },
      {
        name: "description",
        content:
          "Spin for a random CS or AI/ML concept, learn it in 15 minutes, then explain it in 60 seconds. Build a daily streak.",
      },
      { property: "og:title", content: "Tech Roulette — Your daily dose of technical randomness." },
      {
        property: "og:description",
        content: "Spin a random tech concept. 15 minutes to learn, 60 seconds to explain.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const chips = [
  "DSA",
  "Python",
  "OOP",
  "DBMS",
  "OS",
  "Networks",
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "Cloud",
  "System Design",
];

const steps = [
  { n: "01", t: "Spin", d: "Get a random technical concept, no warning and no choosing." },
  { n: "02", t: "Learn", d: "You have 15 minutes to understand it properly." },
  { n: "03", t: "Explain", d: "60 seconds to explain it out loud in your own words." },
  { n: "04", t: "Repeat", d: "Come back daily and keep your streak alive." },
];

function Landing() {
  const { progress } = useProgress();
  const streak = liveStreak(progress);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden bg-hero-glow">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
          <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">TECH ROULETTE</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-tight font-semibold sm:text-3xl">
            Your daily dose of technical randomness.
          </p>

          <div className="mt-8 flex flex-col items-center">
            <p className="font-mono text-2xl font-bold">🔥 {streak}</p>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
              Day streak
            </p>
            <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
              Longest streak: {progress.longestStreak ?? 0} days
            </p>
          </div>

          <Link
            to="/drop"
            aria-label="Spin"
            className="group glow-primary relative mt-10 grid size-40 place-items-center rounded-full bg-primary font-mono text-2xl font-bold tracking-[0.25em] text-primary-foreground transition-transform duration-300 hover:scale-105 sm:size-44"
          >
            <span className="pointer-events-none absolute inset-2 rounded-full border-2 border-dashed border-primary-foreground/30 transition-transform duration-700 group-hover:rotate-180" />
            <span className="relative pl-[0.25em]">SPIN</span>
          </Link>

          <p className="mt-8 text-sm text-muted-foreground">Never know what you'll learn next.</p>

          <Link
            to="/explore"
            className="mt-4 font-mono text-xs tracking-[0.15em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            EXPLORE TOPICS
          </Link>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            {concepts.length} concepts on the wheel
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          How it works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card-surface rounded-xl p-6">
              <span className="font-mono text-sm text-primary">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70 py-8 text-center">
        <p className="font-mono text-xs text-muted-foreground">
          Tech Roulette — your daily dose of technical randomness.
        </p>
      </footer>
    </div>
  );
}
