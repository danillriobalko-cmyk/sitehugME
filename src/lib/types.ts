import type { Lang } from './i18n';

export type Category = 'video' | 'music' | 'game' | 'code' | 'graphics' | 'drawing';
export type MediaType = 'video' | 'audio' | 'image' | 'gallery' | 'embed';

export interface Work {
  id: string;
  title: string;
  title_en: string | null;
  category: Category;
  description: string | null;
  description_en: string | null;
  year: number | null;
  media_type: MediaType;
  media_url: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  is_featured: boolean;
  show_on_home: boolean;
  sort_order: number;
  created_at: string;
}

// Возвращает название работы на текущем языке.
// Если EN-версии нет — откатывается на основной (русский) текст.
export function workTitle(work: Work, lang: Lang): string {
  return lang === 'en' && work.title_en ? work.title_en : work.title;
}

// Возвращает описание работы на текущем языке (или русское как запасное).
export function workDescription(work: Work, lang: Lang): string | null {
  return lang === 'en' && work.description_en
    ? work.description_en
    : work.description ?? null;
}

export interface Message {
  id: string;
  name: string | null;
  contact: string | null;
  message: string;
  created_at: string;
}
