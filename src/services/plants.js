// src/services/plants.js
import { supabase } from "../lib/supabaseClient";

export async function createPlant(plant) {
  const { data, error } = await supabase
    .from("plants")
    .insert([{ ...plant }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listPlants(userId) {
  let query = supabase
    .from("plants")
    .select("*")
    .order("inserted_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPlantById({ plantId, userId }) {
  if (!plantId) throw new Error("getPlantById requires a plantId.");
  let query = supabase.from("plants").select("*").eq("id", plantId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();
  if (error) throw error;
  return data;
}

// add update/delete as needed
