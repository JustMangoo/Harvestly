-- Friendships table
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Prevent duplicate friendships
  unique(user_id, friend_id),
  
  -- Prevent self-friending
  check (user_id != friend_id)
);

-- Indexes for performance
create index if not exists idx_friendships_user_id on public.friendships(user_id);
create index if not exists idx_friendships_friend_id on public.friendships(friend_id);
create index if not exists idx_friendships_status on public.friendships(status);

-- RLS Policies
alter table public.friendships enable row level security;

-- Users can see their own friendship requests (sent and received)
create policy friendships_select_own
  on public.friendships for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Users can create friendship requests
create policy friendships_insert_own
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update friendship status for requests sent to them
create policy friendships_update_received
  on public.friendships for update
  to authenticated
  using (auth.uid() = friend_id);

-- Users can delete their own friendship requests
create policy friendships_delete_own
  on public.friendships for delete
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);
