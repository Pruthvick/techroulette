import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/journey", label: "Journey" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-primary/15 font-mono text-sm text-primary">
            ◆
          </span>
          <span className="font-mono text-sm font-semibold tracking-[0.22em] uppercase">
            Tech Roulette
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-2.5 py-1.5 font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/drop" search={{ spin: true }}
            className="ml-1 rounded-md bg-primary px-3 py-1.5 font-mono text-xs font-semibold tracking-wide text-primary-foreground transition-opacity hover:opacity-90 sm:text-sm"
          >
            SPIN
          </Link>
        </nav>
      </div>
    </header>
  );
}
