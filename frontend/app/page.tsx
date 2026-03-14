import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">PrivyLens</h1>
        <p className="text-muted text-lg">
          Privacy-preserving analytics with differential privacy. Analyze user activity without exposing individual data.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
