-- Update CHECK constraints to use 'rotate' instead of 'turn'
-- Run this after updating the data

-- Drop and recreate CHECK constraint on reminders.task_type if it exists
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reminders_task_type_check'
    ) THEN
        ALTER TABLE reminders DROP CONSTRAINT reminders_task_type_check;
    END IF;
    
    -- Add updated constraint
    ALTER TABLE reminders 
    ADD CONSTRAINT reminders_task_type_check 
    CHECK (task_type IN ('water', 'fertilize', 'mist', 'rotate'));
END $$;

-- Drop and recreate CHECK constraint on journal_entries.entry_type if it exists
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'journal_entries_entry_type_check'
    ) THEN
        ALTER TABLE journal_entries DROP CONSTRAINT journal_entries_entry_type_check;
    END IF;
    
    -- Add updated constraint (allow all entry types)
    ALTER TABLE journal_entries 
    ADD CONSTRAINT journal_entries_entry_type_check 
    CHECK (entry_type IN ('note', 'photo', 'water', 'fertilize', 'mist', 'rotate'));
END $$;

-- Verify constraints are in place
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname IN ('reminders_task_type_check', 'journal_entries_entry_type_check');
