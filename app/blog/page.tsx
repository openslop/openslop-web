import Link from "next/link";
import Image from "next/image";
import { getAllPosts, formatDate } from "@/lib/blog";
import Footer from "@/app/components/landing/Footer";
import type { Metadata } from "next";
import type { BlogPostMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Opinionated guides, tutorials, and hot takes on AI video creation.",
  openGraph: {
    title: "Blog",
    description:
      "Opinionated guides, tutorials, and hot takes on AI video creation.",
    url: "/blog",
    type: "website",
  },
  alternates: {
    canonical: "/blog",
  },
};

function FeaturedTile({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[16/9] lg:aspect-auto lg:h-[31rem] w-full overflow-hidden bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverGif || post.coverImage}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <h2 className="mt-4 text-2xl font-bold text-white transition-colors group-hover:text-violet-300 sm:text-3xl">
        {post.title}
      </h2>

      <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
        <span className="text-violet-400">{post.category}</span>
        <span>&middot;</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </div>
    </Link>
  );
}

function PostTile({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <h2 className="mt-3 text-lg text-white transition-colors group-hover:text-violet-300 sm:text-xl">
        {post.title}
      </h2>

      <div className="mt-1.5 flex items-center gap-3 text-sm text-zinc-500">
        <span className="text-violet-400">{post.category}</span>
        <span>&middot;</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </div>
    </Link>
  );
}

export default function BlogListingPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;
  const sidebarPosts = rest.slice(0, 2);
  const remainingPosts = rest.slice(2);

  return (
    <div className="min-h-screen bg-[#1a1a21]">
      <div className="mx-auto max-w-6xl px-6 py-16 font-[family-name:var(--font-urbanist)] text-zinc-300">
        <Link
          href="/"
          className="text-sm text-violet-400 transition-colors hover:text-violet-300"
        >
          &larr; Back to home
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-white sm:text-5xl">Blog</h1>
        <p className="mt-3 text-lg text-zinc-400">
          Things we learned the hard way.
        </p>

        {posts.length === 0 && (
          <p className="mt-12 text-center text-zinc-500">
            No posts yet. Check back soon.
          </p>
        )}

        {/* Featured row: 2 cols featured + 1 col sidebar */}
        {featured && (
          <div className="mt-12">
            {sidebarPosts.length > 0 ? (
              <div className="grid gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <FeaturedTile post={featured} />
                </div>
                <div className="flex flex-col gap-10">
                  {sidebarPosts.map((post) => (
                    <PostTile key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <FeaturedTile post={featured} />
            )}
          </div>
        )}

        {/* Remaining posts: 3-column grid */}
        {remainingPosts.length > 0 && (
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.map((post) => (
              <PostTile key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
