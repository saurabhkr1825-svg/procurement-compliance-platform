-- 003_storage.sql

-- Insert buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('tender-documents', 'tender-documents', false),
('bidder-documents', 'bidder-documents', false),
('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- tender-documents policies
CREATE POLICY "Users can access their tender documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'tender-documents' AND 
  (storage.foldername(name))[2] IN (
    SELECT id::text FROM public.tenders WHERE created_by = auth.uid()
  )
);

-- bidder-documents policies
CREATE POLICY "Users can access their bidder documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'bidder-documents' AND 
  (storage.foldername(name))[2] IN (
    SELECT id::text FROM public.bidders WHERE tender_id IN (
      SELECT id FROM public.tenders WHERE created_by = auth.uid()
    )
  )
);

-- reports policies
CREATE POLICY "Users can access their reports"
ON storage.objects FOR ALL
USING (
  bucket_id = 'reports' AND 
  (storage.foldername(name))[2] IN (
    SELECT id::text FROM public.tenders WHERE created_by = auth.uid()
  )
);
