-- ============================================================
-- SUPABASE SCHEMA: Professional CMS with Staging/Production
-- IDEMPOTENT — safe to re-run multiple times
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
-- 0. Helper functions
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid());
END; $$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role = 'superadmin');
END; $$;

-- ============================================================
-- 1. Admin profiles
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
-- 2. UNIFIED CONTENT STORE (key-value, draft/published)
-- ============================================================
-- Content types guide:
--   content_text  = plain text, used for: titles, descriptions, labels, short text
--   content_json  = JSON object, used for: arrays (sliders, FAQs), complex objects (contactInfo, socialLinks)
--   content_meta  = JSON for media URLs, timestamps, boolean flags (publishedAt, isActive, etc.)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,          -- e.g. 'global', 'hero', 'about', 'news', 'academics', 'footer', 'careers'
  content_key TEXT NOT NULL,      -- e.g. 'schoolName', 'slide_0_title', 'alert_active'
  locale TEXT NOT NULL DEFAULT 'en',
  content_text TEXT,              -- plain text value
  content_json JSONB DEFAULT '{}',  -- structured value (arrays, objects)
  content_meta JSONB DEFAULT '{}',  -- metadata: { publishedAt, isActive, mediaUrl, fileName, fileSize, mimeType }
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

DROP INDEX IF EXISTS idx_site_content_key;
CREATE INDEX idx_site_content_key ON site_content(section, content_key);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published" ON site_content;
CREATE POLICY "Public read published" ON site_content
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins read all" ON site_content;
CREATE POLICY "Admins read all" ON site_content
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins insert" ON site_content;
CREATE POLICY "Admins insert" ON site_content
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins update" ON site_content;
CREATE POLICY "Admins update" ON site_content
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins delete" ON site_content;
CREATE POLICY "Admins delete" ON site_content
  FOR DELETE USING (is_admin());

-- ============================================================
-- 3. Career Applications table
-- ============================================================
CREATE TABLE IF NOT EXISTS career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  dob TEXT,
  degree TEXT,
  university TEXT,
  experience_years INTEGER DEFAULT 0,
  current_position TEXT,
  subjects TEXT,
  grades TEXT,
  cv_url TEXT,
  photo_url TEXT,
  documents_url JSONB DEFAULT '[]',
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage applications" ON career_applications;
CREATE POLICY "Admins can manage applications" ON career_applications
  FOR ALL USING (is_admin());

-- ============================================================
-- 4. Media table
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

DROP POLICY IF EXISTS "Public read media" ON media;
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins insert media" ON media;
CREATE POLICY "Admins insert media" ON media FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins delete media" ON media;
CREATE POLICY "Admins delete media" ON media FOR DELETE USING (is_admin());

-- ============================================================
-- 5. Edit log
-- ============================================================
CREATE TABLE IF NOT EXISTS edit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE edit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read log" ON edit_log;
CREATE POLICY "Admins read log" ON edit_log FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins insert log" ON edit_log;
CREATE POLICY "Admins insert log" ON edit_log FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- 6. Storage bucket policies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
CREATE POLICY "Anyone can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
CREATE POLICY "Admins can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin());

DROP POLICY IF EXISTS "Admins can delete storage media" ON storage.objects;
CREATE POLICY "Admins can delete storage media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND is_admin());

-- ============================================================
-- 7. RPC: Publish all drafts
-- ============================================================
DROP FUNCTION IF EXISTS publish_all_drafts CASCADE;
CREATE FUNCTION publish_all_drafts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  WITH updated AS (
    UPDATE public.site_content SET status = 'published', content_meta = content_meta || ('{"publishedAt":"' || NOW()::text || '"}')::jsonb
    WHERE status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM updated;
  RETURN cnt;
END; $$;

-- ============================================================
-- 8. RPC: Discard all drafts
-- ============================================================
DROP FUNCTION IF EXISTS discard_all_drafts CASCADE;
CREATE FUNCTION discard_all_drafts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  WITH deleted AS (
    DELETE FROM public.site_content WHERE status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM deleted;
  RETURN cnt;
END; $$;

-- ============================================================
-- 9. RPC: Discard drafts in a section
-- ============================================================
DROP FUNCTION IF EXISTS discard_section_drafts CASCADE;
CREATE FUNCTION discard_section_drafts(p_section TEXT)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  WITH deleted AS (
    DELETE FROM public.site_content WHERE section = p_section AND status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM deleted;
  RETURN cnt;
END; $$;

-- ============================================================
-- 10. Auto-create admin profile trigger
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
CREATE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ BEGIN
  INSERT INTO public.admin_profiles (id, display_name, role) VALUES (NEW.id, NEW.email, 'editor');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 11. Create media storage bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 'media', true, 52428800,
  ARRAY['image/png','image/jpeg','image/gif','image/webp','image/svg+xml','application/pdf']
) ON CONFLICT (id) DO NOTHING;
