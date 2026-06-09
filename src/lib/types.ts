export type Category = 'video' | 'music' | 'game' | 'code' | 'graphics' | 'drawing';
export type MediaType = 'video' | 'audio' | 'image' | 'gallery' | 'embed';

export interface Work {
  id: string;
  title: string;
  category: Category;
  description: string | null;
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

export interface Message {
  id: string;
  name: string | null;
  contact: string | null;
  message: string;
  created_at: string;
}
