import InlineMarkdown from "./InlineMarkdown";
import type { Doc } from "@/lib/content/types";

/** Renders a lib/content Doc with the shared static-page typography. */
export default function DocBody({ doc }: { doc: Doc }) {
  return (
    <>
      {doc.intro?.map((paragraph) => (
        <p key={paragraph} className="leading-relaxed">
          <InlineMarkdown text={paragraph} />
        </p>
      ))}

      {doc.sections.map((section) => (
        <div key={section.heading}>
          <h2 className="text-xl font-semibold text-white">
            {section.heading}
          </h2>
          {section.body?.map((paragraph) => (
            <p key={paragraph} className="mt-2 leading-relaxed">
              <InlineMarkdown text={paragraph} />
            </p>
          ))}
          {section.list && (
            <ul
              className={
                section.listStyle === "plain"
                  ? "mt-4 space-y-2"
                  : "mt-2 list-disc space-y-1 pl-6"
              }
            >
              {section.list.map((item) => (
                <li key={item}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}
