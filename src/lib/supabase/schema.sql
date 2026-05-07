-- ============================================================
-- SUPABASE SCHEMA: SuperAdmin Visual CMS
-- IDEMPOTENT — safe to re-run multiple times
-- Run this in Supabase SQL Editor
-- ============================================================
--
-- SETUP STEPS:
-- 1. Go to https://supabase.com/dashboard -> Your Project -> SQL Editor
-- 2. Paste and run this entire script (safe to re-run anytime)
-- 3. Auth -> Users -> Add User to create your admin account
-- 4. After first login, set role to 'superadmin':
--    UPDATE admin_profiles SET role = 'superadmin' WHERE id = '<your-user-id>';
-- 5. Login at /admin/login, then click "Seed from siteConfig"
-- ============================================================

-- ============================================================
-- 0. Helper functions (SECURITY DEFINER to bypass RLS recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'superadmin');
END;
$$;

-- ============================================================
-- 1. Admin profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('superadmin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read own profile" ON admin_profiles;
CREATE POLICY "Admins can read own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON admin_profiles;
CREATE POLICY "Superadmins can manage all profiles" ON admin_profiles
  FOR ALL USING (is_superadmin());

-- ============================================================
-- 2. Core content table (dual-state: draft / published)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  content_text TEXT,
  content_json JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, content_key, locale)
);

DROP INDEX IF EXISTS idx_site_content_status;
CREATE INDEX idx_site_content_status ON site_content(status);

DROP INDEX IF EXISTS idx_site_content_section;
CREATE INDEX idx_site_content_section ON site_content(section, locale);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published content" ON site_content;
CREATE POLICY "Anyone can read published content" ON site_content
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can read all content" ON site_content;
CREATE POLICY "Admins can read all content" ON site_content
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert content" ON site_content;
CREATE POLICY "Admins can insert content" ON site_content
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update content" ON site_content;
CREATE POLICY "Admins can update content" ON site_content
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete content" ON site_content;
CREATE POLICY "Admins can delete content" ON site_content
  FOR DELETE USING (is_admin());

-- ============================================================
-- 3. Media table
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  section TEXT,
  content_key TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read media" ON media;
CREATE POLICY "Anyone can read media" ON media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert media" ON media;
CREATE POLICY "Admins can insert media" ON media FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete media" ON media;
CREATE POLICY "Admins can delete media" ON media FOR DELETE USING (is_admin());

-- ============================================================
-- 4. Edit log table
-- ============================================================
CREATE TABLE IF NOT EXISTS edit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE edit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read edit log" ON edit_log;
CREATE POLICY "Admins can read edit log" ON edit_log FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert edit log" ON edit_log;
CREATE POLICY "Admins can insert edit log" ON edit_log FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- 5. Storage bucket policies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
CREATE POLICY "Anyone can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
CREATE POLICY "Admins can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete storage media" ON storage.objects;
CREATE POLICY "Admins can delete storage media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND is_admin()
  );

-- ============================================================
-- 6. Publish all drafts function
-- ============================================================
DROP FUNCTION IF EXISTS publish_all_drafts CASCADE;
CREATE FUNCTION publish_all_drafts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE site_content SET status = 'published' WHERE status = 'draft';
END;
$$;

-- ============================================================
-- 7. Auto-create admin profile on signup
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

CREATE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO admin_profiles (id, display_name, role)
  VALUES (NEW.id, NEW.email, 'editor');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 8. Create media storage bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;
