# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (flat config, ESLint v9)
- `npm run test` — Run tests in watch mode (Vitest)
- `npm run test:run` — Run tests once
- `npm run typecheck` — Type-check without emitting
- `npm run format:check` — Check formatting (Prettier)

## Coding style

- Follow DRY principles and prefer code reuse where possible and idiomatic (e.g. common components should be abstracted into a HOC or reusable component)
- Prefer code simplicity as much as possible
- Prefer smaller subcomponents and helper functions neatly organized in idiomatic folders as much as possible
- Prefer idiomatic NextJS, React, Tailwind conventions and best practices as much as possible
- After each change, run the checks from `.github/workflows/ci.yml` (lint, format, typecheck, tests) and fix all failures
- Only add comments when an explanation is warranted (e.g. a UI component with an unobvious purpose, intent that cannot be inferred from code, etc.)
- Avoid unnecessary variables, properties, logic, or functions as much as possible
- Keep the code compact, minimal, simple, and easily understandable and readable by humans
- Avoid common React/Typescript/NextJS anti-patterns such as barrel files, prop drilling, etc.
- Use the `@/*` path alias for imports that traverse 2+ directory levels (e.g. `@/lib/analytics/redditPixel`); keep single-level relative imports (`../`) as-is

## Architecture

**Next.js 16 App Router** marketing site (React 19, TypeScript, Tailwind CSS v4) with waitlist signup, blog, and interactive demo. Supabase backend for waitlist data.

### Key Pages

- `/` (`app/page.tsx`) — Landing page: animated tagline, hero section, script editor demo, waitlist form, logo marquee
- `/blog` (`app/blog/page.tsx`) — Blog listing with featured post + grid layout
- `/blog/[slug]` (`app/blog/[slug]/page.tsx`) — Blog post reader (MDX + embedded Recharts visualizations)
- `/about`, `/terms`, `/privacy` — Static info pages using shared `StaticPageLayout`
- `/api/waitlist` (`app/api/waitlist/route.ts`) — GET count, POST join (Supabase)
- `/feed.xml`, `/sitemap.xml`, `/robots.txt` — SEO/RSS metadata routes

### Key Components

- `app/demo/script-editor/ScriptEditorDemo.tsx` — Orchestrated 6-phase animation demo (client component)
- `app/components/blog/AiTubersCharts.tsx` — 8+ interactive Recharts visualizations for niche analysis post
- `app/components/blog/chartTheme.ts` — Shared chart colors, palettes, formatters

### Styling

- Tailwind CSS v4 via PostCSS plugin
- Dark mode via `color-scheme: dark` (not class-based)
- Element types are color-coded (violet for music, cyan for image, amber for narration, etc.)
- Fonts: Geist (next/font), Sentient + Satoshi (fontshare.com external stylesheet)
- `@/*` path alias maps to project root

### Static Assets

Demo media (videos, images, avatars) in `public/demo/`. Blog chart data in `public/data/`.

## Next.js gotchas

- `next/dynamic` with `ssr: false` is a **Client Component API only**. Never use it in Server Components. If you need to lazy-load a client-only component from a Server Component, create a thin Client Component wrapper that does the dynamic import, then use that wrapper in the Server Component.
