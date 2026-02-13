# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (flat config, ESLint v9)

No test framework is configured.

## Architecture

This is a **Next.js 16 App Router** project (React 19, TypeScript, Tailwind CSS v4) serving as a frontend-only waitlist with a UI demo.

### Key Pages

- `/` (`app/page.tsx`) — Default landing page (stock Next.js template)

### Styling

- Tailwind CSS v4 via PostCSS plugin
- Dark mode via `prefers-color-scheme` CSS media query
- Element types are color-coded (violet for music, cyan for image, amber for narration, etc.)
- Geist font family loaded via `next/font`
- `@/*` path alias maps to project root

### Static Assets

Demo media files live in `public/*`.
