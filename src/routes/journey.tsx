import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Tag } from "@/components/ui/chip";
import { useProgress, liveStreak } from "@/hooks/useProgress";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Your concept journey — Tech Roulette" },
      {
        name: "description",
        content:
          "Track concepts explored, categories covered, learning minutes, streak and confidence ratings across your Tech Roulette sessions.",
      },
      { property: "og:title", content: "Your Tech Roulette journey" },
      {
        property: "og:description",
        content: "Concepts explored, categories covered, learning time and your current streak.",
      },
    ],
  }),
  component: Journey,
});

function fmtMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function Journey() {
  const { progress } = useProgress();
  const streakNow = liveStreak(progress);
  const cats = new Set(progress.completed.map((c) => c.category));
  const confidences = progress.completed
    .map((c) => c.confidence)
    .filter((c): c is number => typeof c === "number");
  const avgConfidence =
    confidences.length > 0
      ? (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(1)
      : "—";

  const stats = [
    { value: String(progress.completed.length), label: "Concepts completed" },
    { value: String(cats.size), label: "Categories" },
    { value: fmtMinutes(progress.learningMinutes), label: "Learning time" },
    { value: `${streakNow}`, label: "Day streak" },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-mono text-2xl font-bold tracking-[0.05em] uppercase sm:text-3xl">
          Your concept journey
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saved on this device only — no account needed.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card-surface rounded-xl p-6">
              <p className="font-mono text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="card-surface rounded-xl p-5">
            <p className="font-mono text-xl font-semibold">{progress.attempted}</p>
            <p className="text-xs text-muted-foreground uppercase">Concepts attempted</p>
          </div>
          <div className="card-surface rounded-xl p-5">
            <p className="font-mono text-xl font-semibold">
              {fmtMinutes(progress.explainMinutes)}
            </p>
            <p className="text-xs text-muted-foreground uppercase">Explanation time</p>
          </div>
          <div className="card-surface rounded-xl p-5">
            <p className="font-mono text-xl font-semibold">{avgConfidence}</p>
            <p className="text-xs text-muted-foreground uppercase">Avg confidence</p>
          </div>
        </div>

        {streakNow > 0 && (
          <p className="mt-6 font-mono text-sm">🔥 {streakNow} day streak · longest {progress.longestStreak ?? 0} days</p>
        )}

        <h2 className="mt-12 font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Recent drops
        </h2>
        {progress.completed.length === 0 ? (
          <div className="card-surface mt-4 rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing here yet. Your first spin takes 16 minutes.
            </p>
            <Link
              to="/drop" search={{ spin: true }}
              className="mt-5 inline-block rounded-lg bg-primary px-6 py-3 font-mono text-xs font-bold tracking-[0.15em] text-primary-foreground"
            >
              SPIN
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {progress.completed.slice(0, 20).map((c) => (
              <li
                key={`${c.id}-${c.at}`}
                className="card-surface flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="font-mono text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.category} · {new Date(c.at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tag>{c.difficulty}</Tag>
                  {typeof c.confidence === "number" && <Tag>confidence {c.confidence}/5</Tag>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
