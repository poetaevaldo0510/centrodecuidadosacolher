-- Fix security issue: Require authentication to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_marketplace_items_title ON public.marketplace_items USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_marketplace_items_description ON public.marketplace_items USING gin(to_tsvector('portuguese', coalesce(description, '')));
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles USING gin(to_tsvector('portuguese', coalesce(display_name, '')));

-- Enable realtime for marketplace items (chat_messages already has realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_items;