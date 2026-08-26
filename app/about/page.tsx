import DocBody from "@/app/components/content/DocBody";
import StaticPageLayout from "@/app/components/StaticPageLayout";
import { aboutDoc } from "@/lib/content/pages";
import { docMetadata } from "@/lib/seo/metadata";

export const metadata = docMetadata(aboutDoc);

export default function About() {
  return (
    <StaticPageLayout
      title={aboutDoc.title}
      subtitle={
        aboutDoc.updated ? `Last updated: ${aboutDoc.updated}` : undefined
      }
    >
      <DocBody doc={aboutDoc} />
    </StaticPageLayout>
  );
}
