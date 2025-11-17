-- Forum schema for posts, comments, and replies
-- Run this in Supabase SQL Editor

-- Enable extension for UUIDs if not already
create extension if not exists "pgcrypto";

-- Posts
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  title text not null,
  body text not null,
  like_count integer not null default 0,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_posts_published_idx on public.forum_posts (published_at desc);

-- Comments
create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  body text not null,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists forum_comments_post_idx on public.forum_comments (post_id, created_at desc);

-- Replies
create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.forum_comments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  body text not null,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists forum_replies_comment_idx on public.forum_replies (comment_id, created_at asc);

-- Row Level Security
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_replies enable row level security;

-- Policies: allow read to everyone
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_posts' and policyname='forum_posts_read_all') then
    create policy forum_posts_read_all on public.forum_posts for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_comments' and policyname='forum_comments_read_all') then
    create policy forum_comments_read_all on public.forum_comments for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_replies' and policyname='forum_replies_read_all') then
    create policy forum_replies_read_all on public.forum_replies for select using (true);
  end if;
end $$;

-- Policies: allow authenticated users to insert
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_posts' and policyname='forum_posts_insert_auth') then
    create policy forum_posts_insert_auth on public.forum_posts for insert to authenticated with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_comments' and policyname='forum_comments_insert_auth') then
    create policy forum_comments_insert_auth on public.forum_comments for insert to authenticated with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_replies' and policyname='forum_replies_insert_auth') then
    create policy forum_replies_insert_auth on public.forum_replies for insert to authenticated with check (auth.uid() is not null);
  end if;
end $$;

-- Policies: allow authenticated users to update like_count
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_posts' and policyname='forum_posts_update_likes') then
    create policy forum_posts_update_likes on public.forum_posts for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_comments' and policyname='forum_comments_update_likes') then
    create policy forum_comments_update_likes on public.forum_comments for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='forum_replies' and policyname='forum_replies_update_likes') then
    create policy forum_replies_update_likes on public.forum_replies for update to authenticated using (true) with check (true);
  end if;
end $$;

-- Trigger to keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists forum_posts_set_updated_at on public.forum_posts;
create trigger forum_posts_set_updated_at before update on public.forum_posts
for each row execute function public.set_updated_at();

-- RPC helper to atomically increment like_count on a table by id
create or replace function public.increment_like_count(target_table text, target_id uuid, step int default 1)
returns void as $$
begin
  execute format('update public.%I set like_count = like_count + %s where id = %L', target_table, step, target_id);
end;
$$ language plpgsql security definer;

