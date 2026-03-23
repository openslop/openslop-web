import Link from "next/link";

export default function StaticPageLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-6 py-16 text-zinc-300">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-violet-400 transition-colors hover:text-violet-300"
        >
          &larr; Back to home
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-white font-sentient">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}

        <section className="mt-10 space-y-8">{children}</section>
      </div>
    </div>
  );
}
