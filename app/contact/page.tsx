import DocBody from "@/app/components/content/DocBody";
import StaticPageLayout from "@/app/components/StaticPageLayout";
import { contactDoc } from "@/lib/content/pages";
import { docMetadata } from "@/lib/seo/metadata";

export const metadata = docMetadata(contactDoc);

export default function Contact() {
  return (
    <StaticPageLayout
      title={contactDoc.title}
      subtitle={
        contactDoc.updated ? `Last updated: ${contactDoc.updated}` : undefined
      }
    >
      <DocBody doc={contactDoc} />
    </StaticPageLayout>
  );
}
