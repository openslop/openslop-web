import DocBody from "@/app/components/content/DocBody";
import StaticPageLayout from "@/app/components/StaticPageLayout";
import { developersDoc } from "@/lib/content/pages";
import { docMetadata } from "@/lib/seo/metadata";

export const metadata = docMetadata(developersDoc);

export default function Developers() {
  return (
    <StaticPageLayout
      title={developersDoc.title}
      subtitle={
        developersDoc.updated
          ? `Last updated: ${developersDoc.updated}`
          : undefined
      }
    >
      <DocBody doc={developersDoc} />
    </StaticPageLayout>
  );
}
