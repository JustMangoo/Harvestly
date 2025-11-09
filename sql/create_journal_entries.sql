-- create_journal_entries.sql
-- Run this in your Supabase SQL editor (ensure the pgcrypto extension is enabled for gen_random_uuid())

-- Optional: enable pgcrypto for gen_random_uuid
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id uuid NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  entry_type text NOT NULL DEFAULT 'note', -- 'note'|'photo'|'water'|'custom'
  title text,
  body text,
  photos jsonb DEFAULT '[]'::jsonb, -- array of storage paths
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_journal_plant_created_at ON public.journal_entries (plant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user_created_at ON public.journal_entries (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies: owners can CRUD their records
CREATE POLICY "journal_insert_owner" ON public.journal_entries
  FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "journal_select_owner" ON public.journal_entries
  FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "journal_update_owner" ON public.journal_entries
  FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "journal_delete_owner" ON public.journal_entries
  FOR DELETE
  USING ( auth.uid() = user_id );

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.journal_entries;
CREATE TRIGGER trg_set_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Notes:
-- - photos should store storage paths (e.g. "journal-photos/{userId}/{plantId}/{filename}.jpg").
-- - Use Supabase Storage APIs to upload images and create signed URLs for display if the bucket is private.
