-- Supabase Storage bucket for slip images
-- Run this in your Supabase SQL editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slip-images',
  'slip-images',
  false,                    -- private bucket, served via signed URLs
  5242880,                  -- 5 MB max per image
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only access their own slip images
CREATE POLICY "Users upload own slip images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'slip-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own slip images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'slip-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own slip images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'slip-images' AND (storage.foldername(name))[1] = auth.uid()::text);
