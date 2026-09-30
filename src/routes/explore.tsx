import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Chip, Tag } from "@/components/ui/chip";
import { categories, concepts, difficulties, type Concept } from "@/data/concepts";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore concepts — ConceptDrop" },
      {
        name: "description",
        content:
          "Browse and search every ConceptDrop concept across CS fundamentals, DSA, DBMS, system design, ML, deep learning and generative AI.",
      },
      { property: "og:title", content: "Explore the ConceptDrop concept bank" },
      {
        property: "og:description",
        content: "Search and filter hundreds of CS and AI/ML interview concepts by category and difficulty.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selected, setSelected] = useState<Concept | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return concepts.filter(
      (c) =>
        (!q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) &&
        (!category || c.category === category) &&
        (!difficulty || c.difficulty === difficulty),
    );
  }, [query, category, difficulty]);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">Explore concepts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {concepts.length} concepts. Browsing is useful — but the real work happens on a timer.
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search concepts…"
          className="mt-6 w-full rounded-lg border border-input bg-card px-4 py-3 font-mono text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => setCategory(null)}>
            All Topics
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip active={!difficulty} onClick={() => setDifficulty(null)}>
            Any level
          </Chip>
          {difficulties.map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d}
            </Chip>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="card-surface mt-10 rounded-xl p-10 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              No concepts match those filters.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory(null);
                setDifficulty(null);
              }}
              className="mt-4 rounded-md border border-border px-4 py-2 font-mono text-xs hover:border-primary/50"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="card-surface rounded-xl p-5 text-left transition-colors hover:border-primary/50"
              >
                <h3 className="font-mono text-base font-semibold">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.category}</p>
                <div className="mt-3">
                  <Tag>{c.difficulty}</Tag>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="card-surface animate-scale-in w-full max-w-md rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[0.7rem] tracking-[0.3em] text-primary uppercase">
              Concept preview
            </p>
            <h2 className="mt-3 font-mono text-2xl font-bold">{selected.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selected.category} · {selected.difficulty}
            </p>
            <p className="mt-5 rounded-lg border border-border bg-secondary/40 p-4 font-mono text-sm">
              “{selected.interviewQuestion}”
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Don't just read it. Take the 15-minute challenge and then explain it in 60 seconds.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/drop"
                search={{ concept: selected.id }}
                className="flex-1 rounded-lg bg-primary px-4 py-3 text-center font-mono text-xs font-bold tracking-[0.15em] text-primary-foreground"
              >
                DROP THIS CONCEPT
              </Link>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-border px-4 py-3 font-mono text-xs tracking-wide hover:border-primary/40"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
