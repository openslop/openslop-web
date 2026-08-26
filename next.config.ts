import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // acceptmarkdown.com: HTML and Markdown share a URL, so caches must
        // key on Accept as well as Next's own router headers.
        source: "/:path*",
        headers: [
          {
            key: "Vary",
            value:
              "Accept, Accept-Encoding, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
