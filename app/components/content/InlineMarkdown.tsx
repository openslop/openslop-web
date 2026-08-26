import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const TOKEN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

function link(label: string, href: string, key: number): ReactNode {
  const className = "text-violet-400 transition-colors hover:text-violet-300";
  return href.startsWith("/") ? (
    <Link key={key} href={href} className={className}>
      {label}
    </Link>
  ) : (
    <a
      key={key}
      href={href}
      className={className}
      {...(href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {label}
    </a>
  );
}

/** Renders the `**bold**` and `[label](href)` subset used by lib/content copy. */
export default function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(TOKEN)) {
    const [token, bold, label, href] = match;
    if (match.index > cursor)
      nodes.push(
        <Fragment key={cursor}>{text.slice(cursor, match.index)}</Fragment>,
      );
    nodes.push(
      bold ? (
        <strong key={match.index} className="text-white">
          {bold}
        </strong>
      ) : (
        link(label, href, match.index)
      ),
    );
    cursor = match.index + token.length;
  }

  nodes.push(<Fragment key={cursor}>{text.slice(cursor)}</Fragment>);
  return <>{nodes}</>;
}
