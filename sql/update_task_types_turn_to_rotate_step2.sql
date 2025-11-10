-- STEP 2 OF 2: Update data from 'turn' to 'rotate'
-- Run this AFTER running update_task_types_turn_to_rotate.sql

-- First, drop the CHECK constraints temporarily
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_task_type_check;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_entry_type_check;

-- Update existing reminders that use 'turn' to 'rotate'
UPDATE reminders 
SET task_type = 'rotate' 
WHERE task_type = 'turn';

-- Update existing journal entries that use 'turn' to 'rotate'
UPDATE journal_entries 
SET entry_type = 'rotate' 
WHERE entry_type = 'turn';

-- Update journal entries with 'task_completed' to use the actual task type from metadata
UPDATE journal_entries 
SET entry_type = metadata->>'task_type'
WHERE entry_type = 'task_completed' 
  AND metadata->>'task_type' IS NOT NULL;

-- Update any 'turn' references in metadata to 'rotate'
UPDATE journal_entries 
SET metadata = jsonb_set(metadata, '{task_type}', '"rotate"')
WHERE metadata->>'task_type' = 'turn';

-- Re-add the CHECK constraints with updated values
ALTER TABLE reminders 
ADD CONSTRAINT reminders_task_type_check 
CHECK (task_type IN ('water', 'fertilize', 'mist', 'rotate'));

ALTER TABLE journal_entries 
ADD CONSTRAINT journal_entries_entry_type_check 
CHECK (entry_type IN ('note', 'photo', 'water', 'fertilize', 'mist', 'rotate'));

-- Verify the changes
SELECT COUNT(*) as reminders_with_rotate 
FROM reminders 
WHERE task_type = 'rotate';

SELECT COUNT(*) as journal_entries_with_rotate 
FROM journal_entries 
WHERE entry_type = 'rotate';

-- Check if any 'turn' entries remain (should be 0)
SELECT COUNT(*) as remaining_turn_reminders 
FROM reminders 
WHERE task_type = 'turn';

SELECT COUNT(*) as remaining_turn_journal 
FROM journal_entries 
WHERE entry_type = 'turn';
