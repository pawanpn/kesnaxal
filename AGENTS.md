# AGENTS.md — KES School Website

## Project

Next.js 15 (App Router) + Supabase + Tailwind CSS v4. School website with 3 locales (en, ne, ja) and a built-in CMS.

## Commands

```bash
npm run dev       # Next dev on port 3000 (Turbopack)
npm run build     # Production build
npm run lint      # ESLint (next/core-web-vitals)
```

No `typecheck` script, no test framework, no CI.

## Env vars

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional, defaults to `https://kes.edu.np`)

## Supabase & Database

- Single Supabase client: `src/lib/supabase/client.ts`. Import `{ supabase }` from there only.
- Schema: `src/lib/supabase/schema.sql`. **There is no migration system.** Schema uses `CREATE TABLE IF NOT EXISTS` — safe to re-run.
- **When adding a column**, append `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in the same file below the CREATE TABLE. Otherwise it never reaches the DB.
- Supabase serves both content storage (`site_content` table) and admin auth.

### Table policies (public insert)

These 3 tables allow public anonymous INSERT:
- `career_applications`
- `contact_messages`
- `admission_inquiries`

All other tables are admin-only for INSERT/UPDATE/DELETE. All tables allow admin read via `is_admin()` function.

### is_admin() check

The `is_admin()` Postgres function checks `EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())`. Any user in `admin_profiles` is an admin — regardless of role. Role only matters for `is_superadmin()`.

## Architecture

### Content system (`site_content`)

Keyed by `(section, content_key, locale)` UNIQUE. Three value columns:
- `content_text` — plain text or JSON string
- `content_json` — structured JSONB (takes priority over `content_text` for JSON queries)
- `content_meta` — JSONB metadata (publishedAt, isActive, mediaUrl, fileName, mimeType, etc.)
- `status` — `"draft"` or `"published"`

Public reads `"published"` only. Admins read all. `AdminContext` holds separate Maps for draft/published rows via React Query.

### Seed & fallback

- `src/constants/siteConfig.ts` — hardcoded defaults for **all content types** (hero, events, jobs, gallery, staff, etc.).
- `src/lib/seedContent.ts` — generates `SeedRow[]` from `siteConfig`. Admin "Seed from siteConfig" button calls `seedAllContent()` → upserts into `site_content`.
- `src/lib/supabase/content.ts` — server utilities fall back to `siteConfig` when Supabase returns empty.

### Locale / i18n

- Locale type: `"en" | "ne" | "ja"` (`Locale` in `src/types/index.ts`).
- UI strings: `src/translations/index.ts` → `translations` map, consumed via `useLocale()` hook.
- Multi-locale data: `LocaleContent` = `{ en: string; ne: string; ja: string }`. Resolve with `resolveLocale()` or domain helpers (`resolveJob`, `resolveArticle`, etc.) from `src/lib/translate.ts`.
- Auto-translation (MyMemory API) via `src/lib/autoTranslate.ts`. In-memory cache. Used in admin editing UI via `handleTranslate`.

### Admin / CMS

- Login: `/admin/login` via `supabase.auth.signInWithPassword`.
- Roles: `'editor'` (default for new users) and `'superadmin'`. Both can edit content (they pass `is_admin()`). Only `'superadmin'` can manage `admin_profiles`.
- `AdminProvider` in `src/context/AdminContext.tsx` exposes: `isAdmin` (has session) and `isSuperadmin` (role check).
- Draft/publish workflow: edits save as `"draft"`, preview with cookie `kes_preview=1`, publish via admin sidebar or `/admin/publish`.
- Real-time subscription on `site_content` refreshes React Query cache for admins.
- Content managers: each admin section lives in `src/app/admin/content/<section>/page.tsx`.

### Public pages

Nearly all pages are `"use client"`. Pages fetch via `useDynamicContent()` hook which merges published CMS data with `siteConfig` fallbacks.

### Middleware

`src/middleware.ts` sets CSP (with `'unsafe-eval'` for Supabase SDK), HSTS, and security headers. Modifying CSP requires `'unsafe-eval'` in `script-src` to remain.

## Key conventions

- **Sanitization**: `stripHtml()` removes all tags; `sanitizeHtml()` allows a safe subset. Both in `src/lib/sanitize.ts` (uses `dompurify` directly, NOT `isomorphic-dompurify`).
- **Path alias**: `@/` → `src/`.
- **No `<img>` eslint rule**: disabled — `next/image` is not required.
- **Components**: `src/components/ui/` (primitives), `src/components/sections/` (page sections), `src/components/layout/` (Navbar, Footer).
- **Tailwind v4**: uses `@tailwindcss/postcss` plugin in `postcss.config.mjs`. No `tailwind.config.*`.
