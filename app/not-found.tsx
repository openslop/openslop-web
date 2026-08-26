import Link from "next/link";
import StaticPageLayout from "./components/StaticPageLayout";
import { RECOVERY_LINKS } from "@/lib/content/notFound";

export const metadata = {
  title: { absolute: "404 - Page not found - OpenSlop" },
  description:
    "That URL does not exist on openslop.ai. Start from the sitemap, llms.txt, or the developer resources index.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <StaticPageLayout
      title="404 - Page not found"
      subtitle="No document exists at this URL."
    >
      <div>
        <h2 className="text-xl font-semibold text-white">Where to look next</h2>
        <ul className="mt-4 space-y-2">
          {RECOVERY_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-violet-400 transition-colors hover:text-violet-300"
              >
                {link.label}
              </Link>{" "}
              <span className="text-zinc-500">- {link.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 leading-relaxed">
          Every page above is also available as Markdown: append{" "}
          <code className="text-zinc-200">.md</code> to the path, or send{" "}
          <code className="text-zinc-200">Accept: text/markdown</code>.
        </p>
      </div>
    </StaticPageLayout>
  );
}
