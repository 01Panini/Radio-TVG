
-- Table for streaming environments
CREATE TABLE public.stream_environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT DEFAULT '',
    stream_url TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stream_environments ENABLE ROW LEVEL SECURITY;

-- Anyone can read active environments
CREATE POLICY "Anyone can read active environments"
ON public.stream_environments
FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage environments"
ON public.stream_environments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed default environments
INSERT INTO public.stream_environments (slug, label, description, sort_order) VALUES
('sertanejo', 'Sertanejo', 'O melhor do sertanejo', 0),
('poprock', 'Pop/Rock', 'Hits e clássicos', 1),
('raiz', 'Raiz', 'Música de raiz brasileira', 2),
('gospel', 'Gospel', 'Louvor e adoração', 3);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_stream_environments_updated_at
BEFORE UPDATE ON public.stream_environments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
