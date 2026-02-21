import { Feed } from "feed";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://openslop.ai";

export async function GET() {
  const posts = getAllPosts();

  const feed = new Feed({
    title: "OpenSlop Blog",
    description:
      "AI video creation guides, tool reviews, and pipeline breakdowns from the OpenSlop team.",
    id: SITE_URL,
    link: `${SITE_URL}/blog`,
    language: "en",
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} OpenSlop`,
    author: {
      name: "Umair Nadeem",
      email: "hi@openslop.ai",
      link: SITE_URL,
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.description,
      date: new Date(post.date),
      author: [{ name: post.author, email: "hi@openslop.ai" }],
      image: post.coverImage.startsWith("http")
        ? post.coverImage
        : `${SITE_URL}${post.coverImage}`,
      category: post.tags.map((tag) => ({ name: tag })),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
