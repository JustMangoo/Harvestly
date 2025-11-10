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
  frequency,
  recurrenceData,
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
    frequency: frequency || "once",
    recurrence_data: recurrenceData || null,
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
        frequency,
        recurrence_data,
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
      frequency,
      recurrence_data,
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
    frequency: row.frequency,
    recurrence_data: row.recurrence_data,
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
  if (updates.frequency) {
    allowedUpdates.frequency = updates.frequency;
  }
  if (updates.recurrenceData !== undefined) {
    allowedUpdates.recurrence_data = updates.recurrenceData;
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

// Utility to format date as yyyy-mm-dd in local timezone
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Expand a reminder into actual occurrence dates within a date range
export function expandReminderToDates(reminder, startDate, endDate) {
  const dates = [];

  if (!reminder.frequency || reminder.frequency === "once") {
    // Single occurrence - just use due_date
    if (reminder.due_date) {
      dates.push(reminder.due_date);
    }
    return dates;
  }

  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  if (reminder.frequency === "specific_days") {
    const targetDays = reminder.recurrence_data?.days || [];
    const targetDayNumbers = targetDays
      .map((day) => dayMap[day.toLowerCase()])
      .filter((num) => num !== undefined);

    if (targetDayNumbers.length === 0) return dates;

    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      if (targetDayNumbers.includes(current.getDay())) {
        dates.push(formatLocalDate(current));
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (reminder.frequency === "biweekly") {
    const targetDay = reminder.recurrence_data?.day?.toLowerCase();
    const targetDayNumber = dayMap[targetDay];
    const referenceDate = reminder.recurrence_data?.start_date
      ? new Date(reminder.recurrence_data.start_date)
      : new Date(reminder.due_date);

    if (targetDayNumber === undefined) return dates;

    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      if (current.getDay() === targetDayNumber) {
        // Check if this week is on the biweekly schedule
        const daysDiff = Math.floor(
          (current - referenceDate) / (1000 * 60 * 60 * 24)
        );
        const weeksDiff = Math.floor(daysDiff / 7);
        if (weeksDiff % 2 === 0) {
          dates.push(formatLocalDate(current));
        }
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (reminder.frequency === "multi_week") {
    // For multi_week, we'll need a smarter algorithm to distribute N times per week
    // For now, just return the due_date as a placeholder
    if (reminder.due_date) {
      dates.push(reminder.due_date);
    }
  }

  return dates;
}
