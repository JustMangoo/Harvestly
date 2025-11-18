import { supabase } from "../lib/supabaseClient";

// Util: format time ago string from a date
export function timeAgo(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "w", secs: 604800 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count}${label}`;
  }
  return `${Math.max(1, seconds)}s`;
}

// POSTS
export async function createPost({ title, text, userId, publishedAt }) {
  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      title,
      body: text,
      user_id: userId ?? null,
      published_at: publishedAt ?? new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listPosts({ limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id, title, body, like_count, published_at, created_at, user_id,
      profiles:profiles!forum_posts_user_id_fkey (username, avatar_url)
    `
    )
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

export async function listPostsByUser({ userId, limit = 20, offset = 0 } = {}) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id, title, body, like_count, published_at, created_at, user_id,
      profiles:profiles!forum_posts_user_id_fkey (username, avatar_url)
    `
    )
    .eq("user_id", userId)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

export async function getPostById(id) {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id, title, body, like_count, published_at, created_at, user_id,
      profiles:profiles!forum_posts_user_id_fkey (username, avatar_url)
    `
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function likePost(id, delta = 1) {
  const { data, error } = await supabase.rpc("increment_like_count", {
    target_table: "forum_posts",
    target_id: id,
    step: delta,
  });
  if (error) throw error;
  return data;
}

// COMMENTS
export async function listComments(postId) {
  const { data, error } = await supabase
    .from("forum_comments")
    .select(
      `
      id, body, like_count, created_at, user_id,
      profiles:profiles!forum_comments_user_id_fkey (username, avatar_url)
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createComment({ postId, text, userId }) {
  const { data, error } = await supabase
    .from("forum_comments")
    .insert({
      post_id: postId,
      body: text,
      user_id: userId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function likeComment(id, delta = 1) {
  const { data, error } = await supabase.rpc("increment_like_count", {
    target_table: "forum_comments",
    target_id: id,
    step: delta,
  });
  if (error) throw error;
  return data;
}

// REPLIES
export async function listReplies(commentId) {
  const { data, error } = await supabase
    .from("forum_replies")
    .select(
      `
      id, body, like_count, created_at, user_id,
      profiles:profiles!forum_replies_user_id_fkey (username, avatar_url)
    `
    )
    .eq("comment_id", commentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createReply({ commentId, text, userId }) {
  const { data, error } = await supabase
    .from("forum_replies")
    .insert({
      comment_id: commentId,
      body: text,
      user_id: userId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function likeReply(id, delta = 1) {
  const { data, error } = await supabase.rpc("increment_like_count", {
    target_table: "forum_replies",
    target_id: id,
    step: delta,
  });
  if (error) throw error;
  return data;
}

// Optional: define the RPC used above when not present
export async function ensureIncrementFunction() {
  const sql = `
    create or replace function public.increment_like_count(target_table text, target_id uuid, step int default 1)
    returns void as $$
    begin
      execute format('update public.%I set like_count = like_count + %s where id = %L', target_table, step, target_id);
    end;
    $$ language plpgsql security definer;
  `;
  // Not executable from client; kept for documentation only.
  return sql;
}
