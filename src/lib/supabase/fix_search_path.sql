-- ============================================================
-- FIX: search_path='' breaks unqualified table references
-- Run this in Supabase SQL Editor to fix all functions
-- ============================================================

-- 1. Fix helper functions (used by RLS policies)
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

-- 2. Fix publish RPC
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

-- 3. Fix discard all RPC
DROP FUNCTION IF EXISTS discard_all_drafts CASCADE;
CREATE FUNCTION discard_all_drafts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  WITH deleted AS (
    DELETE FROM public.site_content WHERE status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM deleted;
  RETURN cnt;
END; $$;

-- 4. Fix discard section RPC
DROP FUNCTION IF EXISTS discard_section_drafts CASCADE;
CREATE FUNCTION discard_section_drafts(p_section TEXT)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE cnt integer; BEGIN
  WITH deleted AS (
    DELETE FROM public.site_content WHERE section = p_section AND status = 'draft' RETURNING 1
  ) SELECT count(*) INTO cnt FROM deleted;
  RETURN cnt;
END; $$;

-- 5. Fix auto-create admin profile trigger
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
