import { SITE_URL } from "@/lib/constants";
import { homeDoc } from "@/lib/content/pages";
import {
  CONTACT_EMAIL,
  ORGANIZATION_ADDRESS,
  ORGANIZATION_ID,
  SOCIAL_PROFILES,
  WEBSITE_ID,
} from "./organization";

const organization = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "OpenSlop",
  legalName: "OpenSlop",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/openslop-logo.svg`,
  image: `${SITE_URL}/og-image.png`,
  description: homeDoc.description,
  email: CONTACT_EMAIL,
  sameAs: SOCIAL_PROFILES,
  address: ORGANIZATION_ADDRESS,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      url: `${SITE_URL}/contact`,
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "technical support",
      email: CONTACT_EMAIL,
      url: `${SITE_URL}/developers`,
      availableLanguage: ["English"],
    },
  ],
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "OpenSlop",
  url: SITE_URL,
  description: homeDoc.description,
  inLanguage: "en-US",
  publisher: { "@id": ORGANIZATION_ID },
};

const application = {
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#software`,
  name: "OpenSlop",
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "AI video generation pipeline",
  operatingSystem: "macOS, Linux, Windows",
  url: SITE_URL,
  description: homeDoc.description,
  isAccessibleForFree: true,
  license: "https://github.com/openslop/openslop",
  downloadUrl: "https://github.com/openslop/openslop",
  softwareHelp: `${SITE_URL}/developers`,
  author: { "@id": ORGANIZATION_ID },
  publisher: { "@id": ORGANIZATION_ID },
  featureList: homeDoc.sections.map((section) => section.heading),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};

export const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [organization, website, application],
};

export function blogPostingSchema(post: {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  coverImage: string;
  tags: string[];
}) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en-US",
    image: post.coverImage.startsWith("http")
      ? post.coverImage
      : `${SITE_URL}${post.coverImage}`,
    keywords: post.tags.join(", "),
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}
