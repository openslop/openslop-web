import DocBody from "@/app/components/content/DocBody";
import StaticPageLayout from "@/app/components/StaticPageLayout";
import { termsDoc } from "@/lib/content/pages";
import { docMetadata } from "@/lib/seo/metadata";

export const metadata = docMetadata(termsDoc);

export default function TermsOfService() {
  return (
    <StaticPageLayout
      title={termsDoc.title}
      subtitle={
        termsDoc.updated ? `Last updated: ${termsDoc.updated}` : undefined
      }
    >
      <DocBody doc={termsDoc} />
    </StaticPageLayout>
  );
}
