# AGENTS.md — KES School Website

## Project

Next.js 15 (App Router) + Supabase + Tailwind CSS v4. School website with 3 locales (en, ne, ja) and a built-in CMS.

## Commands

```bash
npm run dev       # Next dev on port 3000 (Turbopack)
npm run build     # Production build
npm run lint      # ESLint (next/core-web-vitals)
```

There is no `typecheck` script, no test framework, and no CI.

## Supabase & Database

- Single Supabase client in `src/lib/supabase/client.ts`. Import `{ supabase }` from there — never create a new client.
- Schema lives in `src/lib/supabase/schema.sql` using `CREATE TABLE IF NOT EXISTS`. **There is no migration system.**
- **When adding a new column to an existing table**, you MUST append an `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in the same file below the CREATE TABLE. Otherwise the column only exists in SQL and never hits the actual DB.
- Supabase is used for both content storage (`site_content` table) and admin auth (`supabase.auth`).
- Row-level security is enabled on all tables. INSERT policies for content are admin-only except `career_applications` (public insert) and `admissions` (public insert).

## Architecture

### Content system (`site_content` table)

All dynamic content is stored in `site_content` keyed by `(section, content_key, locale)`. Fields:
- `content_text` — plain text or JSON string
- `content_json` — structured JSON (takes priority over `content_text` for JSON lookups)
- `status` — `"draft"` or `"published"`

Admin reads both draft + published; public reads published only. The `AdminContext` (`src/context/AdminContext.tsx`) holds two Maps for draft/published content queried via React Query.

### Seed & fallback data

- `src/constants/siteConfig.ts` is the hardcoded fallback used when Supabase is empty. **All types of content** (hero, events, jobs, gallery, staff, etc.) have defaults there.
- `src/lib/seedContent.ts` generates `SeedRow[]` from `siteConfig`. The admin "Seed from siteConfig" button calls `seedAllContent()` → upserts into `site_content`.
- The `src/lib/supabase/content.ts` server utilities also fall back to `siteConfig` when Supabase returns empty results.

### Locale / i18n

- 3 locales: `"en"`, `"ne"`, `"ja"` (type `Locale` in `src/types/index.ts`).
- UI strings: `src/translations/index.ts` → `translations` map, consumed via `useLocale()` hook → `t` object.
- Multi-locale data objects use `LocaleContent` type (`{ en: string; ne: string; ja: string }`). Resolve with `resolveLocale()` or domain helpers (`resolveJob`, `resolveArticle`, etc.) from `src/lib/translate.ts`.
- Auto-translation calls MyMemory API (`src/lib/autoTranslate.ts`) with in-memory cache. Available in admin editing UI via `handleTranslate`.

### Admin / CMS

- Login at `/admin/login` via Supabase auth (email/password).
- Roles: `admin` and `superadmin` (stored in `admin_profiles.role`).
- Draft/publish workflow: edits save as `"draft"`, reviewed in Preview Mode (cookie `kes_preview=1`), then published via Admin sidebar or `/admin/publish`.
- Real-time subscription on `site_content` table refreshes React Query cache for logged-in admins.
- Content managers: each admin section in `src/app/admin/content/<section>/page.tsx`. Admin layout: `src/app/admin/layout.tsx`.

### Public pages

Nearly all pages are client components (`"use client"`). Pages fetch content via `useDynamicContent()` hook which merges published CMS data with `siteConfig` fallbacks.

### Middleware

`src/middleware.ts` sets CSP, HSTS, and security headers. CSP includes `'unsafe-eval'` for `script-src` (needed by Supabase SDK). If modifying CSP, keep this in mind.

## Key conventions

- **HTML sanitization**: Use `stripHtml()` from `src/lib/sanitize.ts` on all user input before storing (imported as part of `isomorphic-dompurify`).
- **Path alias**: `@/` maps to `src/`.
- **No `<img>` eslint rule**: Disabled (`@next/next/no-img-element: "off"`) — `next/image` is not required.
- **Components**: `src/components/ui/` for shared UI primitives, `src/components/sections/` for page sections, `src/components/layout/` for layout components (Navbar, Footer).
- **Config**: Tailwind v4 uses `@tailwindcss/postcss` plugin, not the v3 config file. All styling via Tailwind classes.
