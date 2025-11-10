-- Add recurrence pattern columns to reminders table
-- This allows storing recurring schedules instead of single due dates

-- Add frequency column to store the recurrence type
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) 
CHECK (frequency IN ('specific_days', 'biweekly', 'multi_week', 'once'));

-- Add recurrence_data column to store the pattern details as JSON
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS recurrence_data JSONB;

-- Add comments for documentation
COMMENT ON COLUMN reminders.frequency IS 'Type of recurrence: specific_days, biweekly, multi_week, or once';
COMMENT ON COLUMN reminders.recurrence_data IS 'JSON data storing recurrence pattern - e.g. {"days": ["monday", "wednesday"]} or {"day": "monday", "interval": 2}';
COMMENT ON COLUMN reminders.description IS 'Human-readable schedule summary (e.g. "Every Mon, Wed") - kept for backward compatibility';

-- Optional: Set default frequency for existing rows
UPDATE reminders 
SET frequency = 'once' 
WHERE frequency IS NULL;

-- Optional: Migrate existing description data to recurrence_data
-- This attempts to parse "Every Mon, Tue, Wed" format
UPDATE reminders
SET recurrence_data = jsonb_build_object(
  'days', 
  ARRAY(
    SELECT LOWER(TRIM(day))
    FROM unnest(
      string_to_array(
        REPLACE(REPLACE(REPLACE(description, 'Every ', ''), ', ', ','), ' ', ''),
        ','
      )
    ) AS day
    WHERE day IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')
  )
)
WHERE frequency IS NULL 
  AND description LIKE 'Every %'
  AND recurrence_data IS NULL;

-- For rows that were migrated, update frequency
UPDATE reminders
SET frequency = 'specific_days'
WHERE frequency IS NULL 
  AND recurrence_data IS NOT NULL
  AND recurrence_data ? 'days';
