import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import Footer from "@/app/components/landing/Footer";
import BlogCTA from "@/app/components/blog/BlogCTA";
import AiTubersCharts, {
  NicheLandscapeChart,
  AiMixChartBlock,
  SubscriberBucketsChart,
  RankCurveChart,
  CollectionTrendChart,
  SubDistributionChartBlock,
  NicheRankingChartBlock,
  NicheRecommendationsBlock,
  KeyStatsBlock,
  NicheLeaderboardBlock,
  AiHeadroomSection,
  Verdict,
  HeadlineFindingsBlock,
  NicheSharePieChart,
  NicheMarimekkoChart,
} from "@/app/components/blog/AiTubersCharts";
import AiTubersDataTable from "@/app/components/blog/AiTubersDataTable";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.coverImage],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}${post.coverImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "OpenSlop",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <div className="min-h-screen bg-[#1a1a21]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="font-[family-name:var(--font-urbanist)] text-zinc-300">
        {/* Cover image — fixed to top of page, fades into background */}
        <div
          className="relative z-10 max-h-[50vh] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 30%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 30%, transparent 100%)",
          }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1920}
            height={1080}
            className="-mt-[15%] w-full"
            priority
          />
        </div>

        {/* Header — overlaps the cover image */}
        <div className="relative z-10 mx-auto -mt-20 max-w-3xl px-6 sm:-mt-32 md:-mt-44 lg:-mt-52">
          <Link
            href="/blog"
            className="inline-block rounded-md bg-black/60 px-3 py-1 text-sm text-violet-400 backdrop-blur-sm transition-colors hover:text-violet-300"
          >
            &larr; All posts
          </Link>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            <span className="box-decoration-clone bg-black/70 px-3 py-1 backdrop-blur-sm">
              {post.title}
            </span>
          </h1>
        </div>

        {/* Article content */}
        <article className="relative mx-auto max-w-5xl px-2 pb-16 sm:px-4">
          <div className="-mt-6 rounded-2xl bg-black px-6 pt-16 pb-8 shadow-[0_0_120px_80px_rgba(0,0,0,0.95)] sm:px-6 md:px-8 lg:px-10">
            <div className="prose mx-auto">
              <div className="not-prose mb-8 flex items-center gap-3">
                <Image
                  src={post.authorAvatar}
                  alt={post.author}
                  width={36}
                  height={36}
                  className="rounded-full object-cover aspect-square"
                />
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="text-zinc-200">{post.author}</span>
                  <span>&middot;</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
              </div>
              <MDXRemote
                source={post.content}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                components={{
                  BlogCTA,
                  AiTubersCharts,
                  NicheLandscapeChart,
                  AiMixChartBlock,
                  SubscriberBucketsChart,
                  RankCurveChart,
                  CollectionTrendChart,
                  SubDistributionChartBlock,
                  NicheRankingChartBlock,
                  NicheRecommendationsBlock,
                  KeyStatsBlock,
                  NicheLeaderboardBlock,
                  AiHeadroomSection,
                  Verdict,
                  HeadlineFindingsBlock,
                  NicheSharePieChart,
                  NicheMarimekkoChart,
                  AiTubersDataTable,
                  hr: () => (
                    <hr
                      style={{
                        border: "none",
                        borderTop: "1px solid rgba(255,255,255,0.18)",
                        margin: "40px 0",
                      }}
                    />
                  ),
                  table: (props: React.ComponentProps<"table">) => (
                    <div className="table-wrapper">
                      <table {...props} />
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        </article>
        <Footer />
      </div>
    </div>
  );
}
