ALTER TABLE public.florist_requests DROP CONSTRAINT IF EXISTS florist_requests_status_check;
UPDATE public.florist_requests SET status = 'assembling' WHERE status = 'processing';
UPDATE public.florist_requests SET status = 'delivered' WHERE status = 'done';
ALTER TABLE public.florist_requests ADD CONSTRAINT florist_requests_status_check CHECK (status IN ('new','confirmed','paid','assembling','shipping','delivered','cancelled'));
ALTER TABLE public.florist_requests ADD COLUMN IF NOT EXISTS admin_note text CHECK (admin_note IS NULL OR length(admin_note) <= 4000);

CREATE TABLE public.request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.florist_requests(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid
);
CREATE INDEX request_status_history_request_idx ON public.request_status_history(request_id, changed_at);
GRANT SELECT ON public.request_status_history TO authenticated;
GRANT ALL ON public.request_status_history TO service_role;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY history_admin_read ON public.request_status_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_request_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_history(request_id, status, changed_by) VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.log_request_status() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER florist_requests_status_log AFTER INSERT OR UPDATE OF status ON public.florist_requests FOR EACH ROW EXECUTE FUNCTION public.log_request_status();