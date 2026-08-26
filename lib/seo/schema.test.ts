import { describe, expect, it } from "vitest";
import { blogPostingSchema, siteSchema } from "./schema";

function nodeOfType(type: string): Record<string, unknown> {
  return siteSchema["@graph"].find(
    (node) => node["@type"] === type,
  ) as unknown as Record<string, unknown>;
}

describe("siteSchema", () => {
  it("identifies the organization, site, and product", () => {
    expect(siteSchema["@graph"].map((node) => node["@type"])).toEqual([
      "Organization",
      "WebSite",
      "SoftwareApplication",
    ]);
  });

  it("gives the organization a contactPoint and a postal address", () => {
    const organization = nodeOfType("Organization");
    const contactPoints = organization.contactPoint as {
      email: string;
      contactType: string;
    }[];

    expect(contactPoints.length).toBeGreaterThan(0);
    for (const point of contactPoints) {
      expect(point.email).toBe("hi@openslop.ai");
      expect(point.contactType).toBeTruthy();
    }
    expect(organization.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "555 San Antonio Rd",
      addressLocality: "Mountain View",
      addressRegion: "CA",
      postalCode: "94040",
      addressCountry: "US",
    });
    expect(organization.sameAs).toBeTruthy();
  });

  it("prices the application as free", () => {
    const application = nodeOfType("SoftwareApplication");
    expect(application.offers).toMatchObject({ price: "0" });
    expect(application.isAccessibleForFree).toBe(true);
  });
});

describe("blogPostingSchema", () => {
  it("builds an absolute, attributed article node", () => {
    const schema = blogPostingSchema({
      slug: "hello",
      title: "Hello",
      description: "A post",
      date: "2026-01-01",
      author: "Umair Nadeem",
      coverImage: "/blog/covers/hello.webp",
      tags: ["ai", "video"],
    });

    expect(schema.url).toBe("https://openslop.ai/blog/hello");
    expect(schema.image).toBe("https://openslop.ai/blog/covers/hello.webp");
    expect(schema.keywords).toBe("ai, video");
    expect(schema.author).toMatchObject({ name: "Umair Nadeem" });
  });
});
