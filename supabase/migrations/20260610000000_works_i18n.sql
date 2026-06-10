/*
  # Двуязычные поля для works (EN-версии)

  Добавляет необязательные английские варианты названия и описания работы.
  Если поле пустое — на сайте показывается основной (русский) текст.
  Идемпотентно: ADD COLUMN IF NOT EXISTS.
*/

ALTER TABLE public.works ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS description_en text;
