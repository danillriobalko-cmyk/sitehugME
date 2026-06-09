/*
  # Admin-only RLS + profiles

  Ужесточает доступ: запись в works, чтение messages и запись в storage
  (covers/media) разрешены ТОЛЬКО администраторам. Публичное чтение works,
  публичная вставка messages и публичное чтение storage не меняются.

  1. Таблица public.profiles (id -> auth.users, is_admin) + RLS (self-select).
  2. Функция public.is_admin() (SECURITY DEFINER, STABLE) — без рекурсии RLS.
  3. works: дроп owner-политик insert/update/delete -> admin-only.
  4. messages: дроп owner-select -> admin-only select.
  5. storage covers/media: дроп owner-политик записи -> admin-only.
  6. Триггер на auth.users (after insert) -> строка profiles с is_admin=false.

  RLS остаётся включённым на works, messages, profiles.
  Файл идемпотентен (IF EXISTS / IF NOT EXISTS / OR REPLACE) — повторное
  применение безопасно.
*/

-- 1. profiles -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean NOT NULL DEFAULT false
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
CREATE POLICY "profiles_self_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. is_admin() ---------------------------------------------------------------
-- SECURITY DEFINER: читает profiles в обход RLS, поэтому политики, вызывающие
-- is_admin(), не приводят к рекурсии RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- 3. works: запись только админам ---------------------------------------------
DROP POLICY IF EXISTS "works_owner_insert" ON public.works;
DROP POLICY IF EXISTS "works_owner_update" ON public.works;
DROP POLICY IF EXISTS "works_owner_delete" ON public.works;

DROP POLICY IF EXISTS "works_admin_insert" ON public.works;
DROP POLICY IF EXISTS "works_admin_update" ON public.works;
DROP POLICY IF EXISTS "works_admin_delete" ON public.works;

CREATE POLICY "works_admin_insert" ON public.works
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "works_admin_update" ON public.works
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "works_admin_delete" ON public.works
  FOR DELETE USING (public.is_admin());

-- works_public_select НЕ трогаем.

-- 4. messages: чтение только админам ------------------------------------------
DROP POLICY IF EXISTS "messages_owner_select" ON public.messages;

DROP POLICY IF EXISTS "messages_admin_select" ON public.messages;
CREATE POLICY "messages_admin_select" ON public.messages
  FOR SELECT USING (public.is_admin());

-- messages_public_insert НЕ трогаем.

-- 5. storage covers/media: запись только админам ------------------------------
DROP POLICY IF EXISTS "covers_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "covers_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "covers_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "media_owner_insert"  ON storage.objects;
DROP POLICY IF EXISTS "media_owner_update"  ON storage.objects;
DROP POLICY IF EXISTS "media_owner_delete"  ON storage.objects;

DROP POLICY IF EXISTS "covers_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "covers_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "covers_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "media_admin_insert"  ON storage.objects;
DROP POLICY IF EXISTS "media_admin_update"  ON storage.objects;
DROP POLICY IF EXISTS "media_admin_delete"  ON storage.objects;

CREATE POLICY "covers_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND public.is_admin());
CREATE POLICY "covers_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND public.is_admin())
  WITH CHECK (bucket_id = 'covers' AND public.is_admin());
CREATE POLICY "covers_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers' AND public.is_admin());

CREATE POLICY "media_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND public.is_admin());

-- covers_public_select / media_public_select НЕ трогаем.

-- 6. авто-создание profiles при регистрации -----------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin)
  VALUES (NEW.id, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
