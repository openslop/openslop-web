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
