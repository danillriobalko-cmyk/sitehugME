/*
  # Разрешить media_type = 'code'

  Таблица works имеет CHECK-ограничение на список допустимых media_type.
  Добавляем в него значение 'code' (ссылка/файл с кодом или программой).
  Пересоздаём ограничение под стандартным именем works_media_type_check.
*/

ALTER TABLE public.works DROP CONSTRAINT IF EXISTS works_media_type_check;

ALTER TABLE public.works
  ADD CONSTRAINT works_media_type_check
  CHECK (media_type IN ('video', 'audio', 'image', 'gallery', 'embed', 'code'));
