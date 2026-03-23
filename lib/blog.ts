import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  coverGif?: string;
  category: string;
  tags: string[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMeta(slug: string, data: Record<string, any>): BlogPostMeta {
  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    author: data.author,
    authorAvatar: data.authorAvatar,
    coverImage: data.coverImage,
    coverGif: data.coverGif ?? undefined,
    category: data.category ?? "",
    tags: data.tags ?? [],
  };
}

let cachedPosts: BlogPostMeta[] | null = null;

export function getAllPosts(): BlogPostMeta[] {
  if (cachedPosts) return cachedPosts;

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data } = matter(raw);
    return parseMeta(slug, data);
  });

  cachedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return cachedPosts;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const postCache = new Map<string, BlogPost>();

export function getPostBySlug(slug: string): BlogPost | null {
  const cached = postCache.get(slug);
  if (cached) return cached;

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const post = { ...parseMeta(slug, data), content };
  postCache.set(slug, post);
  return post;
}
