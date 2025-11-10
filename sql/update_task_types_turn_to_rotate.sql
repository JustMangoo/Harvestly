-- STEP 1 OF 2: Add 'rotate' to ENUM types
-- Run this first, then run update_task_types_turn_to_rotate_step2.sql

-- Add 'rotate' to the task_type ENUM
ALTER TYPE task_type ADD VALUE IF NOT EXISTS 'rotate';

-- Add 'rotate' to entry_type ENUM (for journal_entries)
DO $$ 
BEGIN
    -- Try to add 'rotate' to entry_type enum if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entry_type') THEN
        ALTER TYPE entry_type ADD VALUE IF NOT EXISTS 'rotate';
    END IF;
END $$;

-- IMPORTANT: After running this, you must run update_task_types_turn_to_rotate_step2.sql
-- to complete the migration (update the actual data)

