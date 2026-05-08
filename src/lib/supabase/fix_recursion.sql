-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Create helper functions that bypass RLS
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

-- Step 2: Recreate ALL policies using the functions instead of direct table queries

-- admin_profiles
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON admin_profiles;
CREATE POLICY "Superadmins can manage all profiles" ON admin_profiles
  FOR ALL USING (is_superadmin());

-- site_content
DROP POLICY IF EXISTS "Admins can read all content" ON site_content;
CREATE POLICY "Admins can read all content" ON site_content FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert content" ON site_content;
CREATE POLICY "Admins can insert content" ON site_content FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update content" ON site_content;
CREATE POLICY "Admins can update content" ON site_content FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete content" ON site_content;
CREATE POLICY "Admins can delete content" ON site_content FOR DELETE USING (is_admin());

-- media
DROP POLICY IF EXISTS "Admins can insert media" ON media;
CREATE POLICY "Admins can insert media" ON media FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete media" ON media;
CREATE POLICY "Admins can delete media" ON media FOR DELETE USING (is_admin());

-- edit_log
DROP POLICY IF EXISTS "Admins can read edit log" ON edit_log;
CREATE POLICY "Admins can read edit log" ON edit_log FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert edit log" ON edit_log;
CREATE POLICY "Admins can insert edit log" ON edit_log FOR INSERT WITH CHECK (is_admin());

-- storage.objects
DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
CREATE POLICY "Admins can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin());

DROP POLICY IF EXISTS "Admins can delete storage media" ON storage.objects;
CREATE POLICY "Admins can delete storage media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND is_admin());
