import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-app">
      <header className="border-b border-border-subtle/80 bg-surface-elevated/60 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight text-foreground">PrivyLens</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="font-semibold text-foreground">
              Home
            </Link>
            <Link href="/dashboard" className="font-medium text-muted transition hover:text-accent">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 inline-flex items-center rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-foreground-soft shadow-card backdrop-blur-sm">
            Differential privacy · Production analytics
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Analytics without exposing individuals
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted md:text-lg">
            PrivyLens aggregates user activity with formal privacy guarantees. Tune epsilon, compare
            noisy and true metrics, and stay within your privacy budget.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-surface shadow-glow transition hover:bg-accent-deep hover:brightness-105"
            >
              Open dashboard
            </Link>
            <a
              href="https://en.wikipedia.org/wiki/Differential_privacy"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card/50 px-8 text-sm font-medium text-foreground-soft transition hover:border-accent/40 hover:bg-card-hover"
              rel="noreferrer"
              target="_blank"
            >
              Learn about ε
            </a>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              title: "Privacy budget",
              body: "Cap query cost so releases stay within your ε envelope.",
            },
            {
              title: "Live aggregates",
              body: "Page views and event rates refresh on a steady cadence.",
            },
            {
              title: "Noisy vs true",
              body: "Toggle differential noise to see impact on reported numbers.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border-subtle bg-card/40 p-5 text-left shadow-card backdrop-blur-sm transition hover:border-border hover:bg-card/70"
            >
              <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
