import { supabase } from "../lib/supabaseClient";

const PROFILE_FIELDS = "id, username, avatar_url, location, updated_at";

export async function getUserProfile(userId) {
  if (!userId) throw new Error("getUserProfile requires a userId.");

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId, fields) {
  if (!userId) throw new Error("updateUserProfile requires a userId.");
  if (!fields || typeof fields !== "object") {
    throw new Error("updateUserProfile requires a fields object.");
  }

  const payload = {
    id: userId,
    ...fields,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload)
    .select(PROFILE_FIELDS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUsername(userId, username) {
  return updateUserProfile(userId, { username });
}

export async function updateLocation(userId, location) {
  return updateUserProfile(userId, { location });
}

/**
 * Search profiles by username (case-insensitive, partial match)
 */
export async function searchProfiles(query, { limit = 20 } = {}) {
  const q = (query || "").trim();
  if (!q) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .ilike("username", `%${q}%`)
    .order("username", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
