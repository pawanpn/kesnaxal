-- ============================================================
-- SUPABASE SCHEMA: SuperAdmin Visual CMS
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Admin users table (auth handled by Supabase Auth)
-- Just a profile table to flag admin role
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('superadmin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Superadmins can manage all profiles" ON admin_profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- 2. Core content table (dual-state: draft / published)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,          -- e.g. 'hero', 'about', 'contact', 'footer', 'nav'
  content_key TEXT NOT NULL,      -- e.g. 'title', 'subtitle', 'description', 'slide_0'
  locale TEXT NOT NULL DEFAULT 'en',  -- 'en', 'ne', 'ja'
  content_text TEXT,              -- the actual text/content for this locale
  content_json JSONB DEFAULT '{}', -- full JSON for complex content (slides, events, jobs)
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(section, content_key, locale)
);

CREATE INDEX idx_site_content_status ON site_content(status);
CREATE INDEX idx_site_content_section ON site_content(section, locale);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public can only read published
CREATE POLICY "Anyone can read published content" ON site_content
  FOR SELECT USING (status = 'published');

-- Admins can read all (including drafts)
CREATE POLICY "Admins can read all content" ON site_content
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

-- Admins can insert/update/delete
CREATE POLICY "Admins can insert content" ON site_content
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update content" ON site_content
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete content" ON site_content
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

-- 3. Media table (for uploaded images/files)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  section TEXT,          -- which section this media belongs to
  content_key TEXT,      -- which content field
  mime_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read media" ON media FOR SELECT USING (true);
CREATE POLICY "Admins can insert media" ON media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can delete media" ON media FOR DELETE USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

-- 4. Recent edits log (for audit trail / publish list)
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
CREATE POLICY "Admins can read edit log" ON edit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can insert edit log" ON edit_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

-- 5. Storage bucket for media uploads
-- Run separately in Supabase Storage UI or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage RLS
CREATE POLICY "Anyone can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

-- 6. Helper function: publish all drafts
CREATE OR REPLACE FUNCTION publish_all_drafts()
RETURNS void AS $$
BEGIN
  UPDATE site_content SET status = 'published' WHERE status = 'draft';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger: auto-create admin profile on first signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO admin_profiles (id, display_name, role)
  VALUES (NEW.id, NEW.email, 'editor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
