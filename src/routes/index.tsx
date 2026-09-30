import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Tag } from "@/components/ui/chip";
import { concepts } from "@/data/concepts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ConceptDrop — One concept. Fifteen minutes. One minute to explain it." },
      {
        name: "description",
        content:
          "Get a random CS or AI/ML concept, learn it in 15 minutes, then explain it in 60 seconds like an interview candidate.",
      },
      { property: "og:title", content: "ConceptDrop — turn random concepts into interview answers" },
      {
        name: "og:description",
        content: "One concept. Fifteen minutes. One minute to explain it.",
      },
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
  { n: "01", t: "Drop", d: "Get a random technical concept, no warning and no choosing." },
  { n: "02", t: "Learn", d: "You have 15 minutes to understand it properly." },
  { n: "03", t: "Explain", d: "60 seconds to explain it like an interview candidate." },
  { n: "04", t: "Repeat", d: "Build breadth across the whole CS + AI/ML ecosystem." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden bg-hero-glow">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
          <p className="font-mono text-xs tracking-[0.35em] text-primary uppercase">
            Interview prep, on a timer
          </p>
          <h1 className="mt-6 font-mono text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">CONCEPTDROP</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-2xl leading-tight font-semibold sm:text-4xl">
            One concept.
            <br />
            Fifteen minutes.
            <br />
            <span className="text-primary">One minute to explain it.</span>
          </p>
          <p className="mx-auto mt-6 max-w-lg text-sm text-muted-foreground sm:text-base">
            Turn random technical concepts into interview-ready knowledge.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/drop"
              className="glow-primary w-full rounded-lg bg-primary px-7 py-3.5 font-mono text-sm font-bold tracking-[0.15em] text-primary-foreground transition-transform hover:scale-[1.02] sm:w-auto"
            >
              DROP A CONCEPT
            </Link>
            <Link
              to="/explore"
              className="w-full rounded-lg border border-border bg-secondary/40 px-7 py-3.5 font-mono text-sm font-semibold tracking-[0.15em] text-foreground transition-colors hover:border-primary/40 sm:w-auto"
            >
              EXPLORE TOPICS
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            {concepts.length} concepts in the bank
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
          ConceptDrop — you have 15 minutes. Master this.
        </p>
      </footer>
    </div>
  );
}
