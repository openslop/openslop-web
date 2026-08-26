import DocBody from "@/app/components/content/DocBody";
import StaticPageLayout from "@/app/components/StaticPageLayout";
import { privacyDoc } from "@/lib/content/pages";
import { docMetadata } from "@/lib/seo/metadata";

export const metadata = docMetadata(privacyDoc);

export default function PrivacyPolicy() {
  return (
    <StaticPageLayout
      title={privacyDoc.title}
      subtitle={
        privacyDoc.updated ? `Last updated: ${privacyDoc.updated}` : undefined
      }
    >
      <DocBody doc={privacyDoc} />
    </StaticPageLayout>
  );
}
