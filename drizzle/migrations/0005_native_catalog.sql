CREATE TABLE public.bouquets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE CHECK (length(handle) BETWEEN 1 AND 200),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED')),
  details jsonb NOT NULL CHECK (jsonb_typeof(details) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE public.bouquet_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 80)
);
--> statement-breakpoint
ALTER TABLE public.bouquets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bouquet_collections ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.bouquets, public.bouquet_collections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bouquets, public.bouquet_collections TO authenticated;
CREATE POLICY "Read published bouquets" ON public.bouquets FOR SELECT TO anon, authenticated USING (status = 'ACTIVE');
CREATE POLICY "Admin manage bouquets" ON public.bouquets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Read collections" ON public.bouquet_collections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage collections" ON public.bouquet_collections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
--> statement-breakpoint
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bouquet-images', 'bouquet-images', true, 6000000, ARRAY['image/jpeg', 'image/png', 'image/webp']);
CREATE POLICY "Read bouquet photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'bouquet-images');
CREATE POLICY "Admin manage bouquet photos" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'bouquet-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'bouquet-images' AND public.has_role(auth.uid(), 'admin'));
--> statement-breakpoint
COMMENT ON COLUMN public.florist_requests.order_lines IS 'Unpaid delivery request snapshot validated against the native catalog; payment is separate.';
