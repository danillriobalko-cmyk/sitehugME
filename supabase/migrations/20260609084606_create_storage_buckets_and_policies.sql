INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;

-- covers: public read, owner-only write
CREATE POLICY "covers_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "covers_owner_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.uid() IS NOT NULL);
CREATE POLICY "covers_owner_update" ON storage.objects FOR UPDATE USING (bucket_id = 'covers' AND auth.uid() IS NOT NULL);
CREATE POLICY "covers_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'covers' AND auth.uid() IS NOT NULL);

-- media: public read, owner-only write
CREATE POLICY "media_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media_owner_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);
CREATE POLICY "media_owner_update" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);
CREATE POLICY "media_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);
