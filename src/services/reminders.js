// src/services/reminders.js
import { supabase } from "../lib/supabaseClient";

const REMINDER_TYPES = ["water", "fertilize", "mist", "turn"];
const TABLE = "reminders";

const REMINDER_TEMPLATES = {
  water: {
    title: (plantName) => `Water ${plantName}`,
    description: (plant) =>
      plant?.water_amount_ml ? `${plant.water_amount_ml}ml` : "Water as needed",
  },
  fertilize: {
    title: (plantName) => `Fertilize ${plantName}`,
    description: () => "Add fertilizer according to package instructions",
  },
  mist: {
    title: (plantName) => `Mist ${plantName}`,
    description: () => "Mist the foliage lightly",
  },
  turn: {
    title: (plantName) => `Turn ${plantName}`,
    description: () => "Rotate 90° for even growth",
  },
};

function resolvePlantName(plant) {
  return (
    plant?.nickname?.trim() || plant?.official_name?.trim() || "your plant"
  );
}

export function generateReminderContent(taskType, plant) {
  if (!REMINDER_TYPES.includes(taskType)) {
    throw new Error(
      `Unsupported reminder type "${taskType}". Expected one of: ${REMINDER_TYPES.join(
        ", "
      )}`
    );
  }

  const plantName = resolvePlantName(plant);
  const template = REMINDER_TEMPLATES[taskType];

  return {
    title: template.title(plantName),
    description: template.description(plant),
  };
}

export async function createReminder({
  userId,
  plantId,
  dueDate,
  taskType,
  description,
  completed = false,
}) {
  if (!userId) throw new Error("createReminder requires a userId.");
  if (!plantId) throw new Error("createReminder requires a plantId.");
  if (!dueDate) throw new Error("createReminder requires a dueDate.");
  if (!REMINDER_TYPES.includes(taskType)) {
    throw new Error(
      `Unsupported reminder type "${taskType}". Expected one of: ${REMINDER_TYPES.join(
        ", "
      )}`
    );
  }

  const payload = {
    user_id: userId,
    plant_id: plantId,
    due_date: dueDate,
    task_type: taskType,
    description,
    completed,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listRemindersByPlant({ userId, plantId }) {
  if (!userId) throw new Error("listRemindersByPlant requires a userId.");
  if (!plantId) throw new Error("listRemindersByPlant requires a plantId.");

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
        id,
        user_id,
        plant_id,
        due_date,
        task_type,
        title,
        description,
        completed,
        inserted_at,
        updated_at
      `
    )
    .eq("user_id", userId)
    .eq("plant_id", plantId)
    .order("task_type", { ascending: true });

  if (error) throw error;
  return data;
}

export async function listRemindersForUser(userId) {
  if (!userId) throw new Error("listRemindersForUser requires a userId.");

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      id,
      plant_id,
      task_type,
      due_date,
      description,
      plants!inner(
        nickname,
        official_name,
        water_amount_ml
      )
    `
    )
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .order("task_type", { ascending: true });

  if (error) throw error;

  // Transform to flat structure with plant data embedded
  return (data || []).map((row) => ({
    id: row.id,
    plant_id: row.plant_id,
    task_type: row.task_type,
    due_date: row.due_date,
    schedule_description: row.description,
    plant: row.plants,
  }));
}

export async function updateReminder(id, userId, updates) {
  if (!id) throw new Error("updateReminder requires an id.");
  if (!userId) throw new Error("updateReminder requires a userId.");

  const allowedUpdates = {};
  if (updates.dueDate) {
    allowedUpdates.due_date = updates.dueDate;
  }
  if (updates.description) {
    allowedUpdates.description = updates.description;
  }
  if (typeof updates.completed === "boolean") {
    allowedUpdates.completed = updates.completed;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error("No valid fields supplied to updateReminder.");
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(allowedUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReminder(id, userId) {
  if (!id) throw new Error("deleteReminder requires an id.");
  if (!userId) throw new Error("deleteReminder requires a userId.");

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
