# OpenSlop

free open-source AI video pipeline. single prompt to finished video -- no GPU, no manual editing, no timeline dragging.

> waitlist + interactive demo at [openslop.ai](https://openslop.ai)

## what is this repo

this is the **marketing site** for OpenSlop -- a Next.js app with:

- landing page with interactive script editor demo
- waitlist signup (Supabase backend)
- blog with MDX posts and data visualizations

the actual video pipeline is a separate project.

## stack

| layer     | tech                                          |
| --------- | --------------------------------------------- |
| framework | Next.js 16 (App Router), React 19, TypeScript |
| styling   | Tailwind CSS v4, Framer Motion                |
| data      | Supabase (waitlist), MDX (blog)               |
| charts    | Recharts                                      |
| analytics | Vercel Analytics, Reddit Pixel                |
| deploy    | Vercel                                        |

## getting started

```bash
cp .env.local.example .env.local   # fill in Supabase keys
npm install
npm run dev                        # localhost:3000
```

## commands

```
npm run dev            # dev server
npm run build          # production build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run test           # vitest (watch mode)
npm run test:run       # vitest (single run)
npm run format:check   # prettier
```

## project structure

```
app/
  page.tsx                         # landing page
  blog/                            # blog listing + [slug] pages
  api/waitlist/                    # GET count, POST join
  components/
    landing/                       # hero, waitlist form, footer, etc.
    blog/                          # charts, data table, CTA
  demo/script-editor/              # interactive demo component
content/blog/                      # MDX blog posts
lib/                               # utils, supabase client, blog helpers
supabase/migrations/               # database schema
```
