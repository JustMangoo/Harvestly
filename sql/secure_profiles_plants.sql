-- Secure profiles and plants tables by enabling RLS and adding least-privilege policies
-- Run this in the Supabase SQL Editor for your project

-- Enable Row Level Security (RLS)
alter table if exists public.profiles enable row level security;
alter table if exists public.plants enable row level security;

-- PROFILES POLICIES ---------------------------------------------------------
-- Assumptions:
--   profiles.id is the same UUID as auth.users.id (standard Supabase pattern)
--   Client code only reads and writes the current user's own profile

do $$ begin
  -- Read own profile
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_read_own'
  ) then
    create policy profiles_read_own
      on public.profiles for select
      to authenticated
      using ( id = auth.uid() );
  end if;

  -- Insert own profile (for upsert cases)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_own'
  ) then
    create policy profiles_insert_own
      on public.profiles for insert
      to authenticated
      with check ( id = auth.uid() );
  end if;

  -- Update own profile
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own'
  ) then
    create policy profiles_update_own
      on public.profiles for update
      to authenticated
      using ( id = auth.uid() )
      with check ( id = auth.uid() );
  end if;

  -- (Optional) Delete own profile. Usually not needed; omit if you don't want users deleting profiles
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_delete_own'
  ) then
    create policy profiles_delete_own
      on public.profiles for delete
      to authenticated
      using ( id = auth.uid() );
  end if;
end $$;

-- PLANTS POLICIES -----------------------------------------------------------
-- Assumptions:
--   plants.user_id references auth.users(id)
--   Client code should only see and mutate its own plants

do $$ begin
  -- Read own plants
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='plants' and policyname='plants_read_own'
  ) then
    create policy plants_read_own
      on public.plants for select
      to authenticated
      using ( user_id = auth.uid() );
  end if;

  -- Insert own plants
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='plants' and policyname='plants_insert_own'
  ) then
    create policy plants_insert_own
      on public.plants for insert
      to authenticated
      with check ( user_id = auth.uid() );
  end if;

  -- Update own plants
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='plants' and policyname='plants_update_own'
  ) then
    create policy plants_update_own
      on public.plants for update
      to authenticated
      using ( user_id = auth.uid() )
      with check ( user_id = auth.uid() );
  end if;

  -- Delete own plants
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='plants' and policyname='plants_delete_own'
  ) then
    create policy plants_delete_own
      on public.plants for delete
      to authenticated
      using ( user_id = auth.uid() );
  end if;
end $$;

-- Notes:
-- 1) After running this, Supabase UI should no longer show "Unrestricted" for these tables.
-- 2) If you need public read access to profiles (e.g., showing other users' public info),
--    add another SELECT policy with a whitelist of safe fields using a view or add USING (true)
--    but prefer exposing only a view of public columns.
-- 3) Ensure your client code sets plants.user_id to auth user id on insert (already done in PlantCreatePage).
