import { supabase } from "../lib/supabaseClient";

export async function listJournalByPlant({ userId, plantId, limit = 50 }) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createJournalEntry({ userId, plantId, entry }) {
  const payload = {
    user_id: userId,
    plant_id: plantId,
    entry_type: entry.entry_type || "note",
    title: entry.title || null,
    body: entry.body || null,
    photos: entry.photos || [],
    metadata: entry.metadata || {},
  };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJournalEntry({ userId, id }) {
  const { data, error } = await supabase
    .from("journal_entries")
    .delete()
    .match({ id, user_id: userId });
  if (error) throw error;
  return data;
}

export async function uploadJournalPhoto({
  bucket = "journal-photos",
  path,
  file,
}) {
  // file is a File object in browser environment
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;
  return data; // returns { Key, etc }
}

export async function getPublicUrl({ bucket = "journal-photos", path }) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  if (error) throw error;
  return data;
}

export async function createSignedUrls({
  bucket = "journal-photos",
  paths = [],
  expires = 60,
}) {
  // returns array of { path, signedUrl }
  const results = [];
  for (const path of paths) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expires);
    if (error) throw error;
    results.push({ path, signedUrl: data.signedURL });
  }
  return results;
}
