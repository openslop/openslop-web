import { SITE_URL } from "@/lib/constants";

export const CONTACT_EMAIL = "hi@openslop.ai";

export const SOCIAL_PROFILES = [
  "https://github.com/openslop/openslop",
  "https://discord.gg/zeP5482ced",
];

export const ORGANIZATION_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "555 San Antonio Rd",
  addressLocality: "Mountain View",
  addressRegion: "CA",
  postalCode: "94040",
  addressCountry: "US",
} as const;

/** One-line form of ORGANIZATION_ADDRESS, for prose that must match the schema. */
export const ORGANIZATION_ADDRESS_LINE =
  "555 San Antonio Rd, Mountain View, CA 94040, United States";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
