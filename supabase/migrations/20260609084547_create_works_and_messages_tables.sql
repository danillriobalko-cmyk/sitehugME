CREATE TABLE works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('video', 'music', 'game', 'code', 'graphics', 'drawing')),
  description text,
  year int,
  media_type text NOT NULL CHECK (media_type IN ('video', 'audio', 'image', 'gallery', 'embed')),
  media_url text,
  cover_url text,
  gallery_urls text[],
  is_featured bool DEFAULT false,
  show_on_home bool DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  contact text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- works: public read, owner-only write
CREATE POLICY "works_public_select" ON works FOR SELECT USING (true);
CREATE POLICY "works_owner_insert" ON works FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "works_owner_update" ON works FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "works_owner_delete" ON works FOR DELETE USING (auth.uid() IS NOT NULL);

-- messages: public insert, owner-only read
CREATE POLICY "messages_public_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_owner_select" ON messages FOR SELECT USING (auth.uid() IS NOT NULL);
