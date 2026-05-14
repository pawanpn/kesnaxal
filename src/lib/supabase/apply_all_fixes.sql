-- ============================================================
-- UNIFIED FIX: Run this in Supabase SQL Editor
-- Fixes: RLS recursion, function search_path, gallery caching
-- ============================================================

-- 1. Helper functions (bypass RLS for policy checks)
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

-- 2. Fix all site_content RLS policies (prevent recursion)
DROP POLICY IF EXISTS "Public read published" ON site_content;
DROP POLICY IF EXISTS "Admins read all" ON site_content;
DROP POLICY IF EXISTS "Admins insert" ON site_content;
DROP POLICY IF EXISTS "Admins update" ON site_content;
DROP POLICY IF EXISTS "Admins delete" ON site_content;
DROP POLICY IF EXISTS "Admins can read all content" ON site_content;
DROP POLICY IF EXISTS "Admins can insert content" ON site_content;
DROP POLICY IF EXISTS "Admins can update content" ON site_content;
DROP POLICY IF EXISTS "Admins can delete content" ON site_content;

CREATE POLICY "Public read published" ON site_content
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can read all content" ON site_content
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert content" ON site_content
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update content" ON site_content
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete content" ON site_content
  FOR DELETE USING (is_admin());

-- 3. Fix media table RLS
DROP POLICY IF EXISTS "Admins can insert media" ON media;
DROP POLICY IF EXISTS "Admins can delete media" ON media;

CREATE POLICY "Admins can insert media" ON media
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete media" ON media
  FOR DELETE USING (is_admin());

-- 4. Fix storage RLS
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete storage media" ON storage.objects;

CREATE POLICY "Public can read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin());

CREATE POLICY "Admins can delete storage media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND is_admin());

-- 5. Fix RPC functions (add auth check + search_path)
DROP FUNCTION IF EXISTS publish_all_drafts CASCADE;
CREATE FUNCTION publish_all_drafts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Permission denied: admin role required'; END IF;
  WITH updated AS (
    UPDATE public.site_content SET status = 'published', updated_at = NOW()
    WHERE status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM updated;
  RETURN cnt;
END; $$;

DROP FUNCTION IF EXISTS discard_all_drafts CASCADE;
CREATE FUNCTION discard_all_drafts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Permission denied: admin role required'; END IF;
  WITH deleted AS (
    DELETE FROM public.site_content WHERE status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM deleted;
  RETURN cnt;
END; $$;

DROP FUNCTION IF EXISTS discard_section_drafts CASCADE;
CREATE FUNCTION discard_section_drafts(p_section TEXT)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Permission denied: admin role required'; END IF;
  WITH deleted AS (
    DELETE FROM public.site_content WHERE section = p_section AND status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM deleted;
  RETURN cnt;
END; $$;

-- 6. Fix edit_log RLS
DROP POLICY IF EXISTS "Admins can read edit log" ON edit_log;
DROP POLICY IF EXISTS "Admins can insert edit log" ON edit_log;

CREATE POLICY "Admins can read edit log" ON edit_log
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert edit log" ON edit_log
  FOR INSERT WITH CHECK (is_admin());

-- Done.
SELECT 'All fixes applied. Content should now work on Vercel.' AS result;
