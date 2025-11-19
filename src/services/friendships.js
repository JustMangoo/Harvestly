import { supabase } from "../lib/supabaseClient";

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(friendId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("friendships")
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(friendshipId) {
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(friendshipId) {
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove/unfriend a user
 */
export async function removeFriend(friendshipId) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) throw error;
}

/**
 * Get friendship status between current user and another user
 * Returns: null (not friends), 'pending' (request sent/received), 'accepted' (friends)
 */
export async function getFriendshipStatus(otherUserId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if there's a friendship in either direction
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${user.id})`
    )
    .maybeSingle();

  if (error) throw error;

  if (!data) return { status: null, friendship: null, isSender: false };

  return {
    status: data.status,
    friendship: data,
    isSender: data.user_id === user.id,
  };
}

/**
 * Get all friends for a user (accepted friendships)
 */
export async function getFriends(userId) {
  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      user_id,
      friend_id,
      status,
      created_at,
      user:profiles!friendships_user_id_fkey(id, username, avatar_url),
      friend:profiles!friendships_friend_id_fkey(id, username, avatar_url)
    `
    )
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted");

  if (error) throw error;

  // Map to return the other user's profile
  return (data || []).map((friendship) => {
    const isUser = friendship.user_id === userId;
    return {
      ...friendship,
      profile: isUser ? friendship.friend : friendship.user,
    };
  });
}

/**
 * Get all friendships for current user (all statuses)
 */
export async function getAllFriendships() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("friendships")
    .select("id, user_id, friend_id, status")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

  if (error) throw error;
  return data || [];
}

/**
 * Get pending friend requests for current user
 */
export async function getPendingRequests() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      user_id,
      friend_id,
      status,
      created_at,
      sender:profiles!friendships_user_id_fkey(id, username, avatar_url)
    `
    )
    .eq("friend_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
