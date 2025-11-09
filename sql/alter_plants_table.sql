-- Add new columns to public.plants table
ALTER TABLE public.plants
ADD COLUMN humidity_level text,               -- e.g., 'high', 'moderate', 'low'
ADD COLUMN soil_temperature integer,          -- in degrees Celsius
ADD COLUMN water_amount_ml integer;           -- in milliliters

-- Migrate existing water_amount data if needed
-- You may want to run a data migration script here if you have existing data

-- Add comments to the new columns for better documentation
COMMENT ON COLUMN public.plants.humidity_level IS 'Required humidity level for the plant (high/moderate/low)';
COMMENT ON COLUMN public.plants.soil_temperature IS 'Optimal soil temperature in degrees Celsius';
COMMENT ON COLUMN public.plants.water_amount_ml IS 'Amount of water needed per watering in milliliters';

-- Optional: Add check constraints to ensure valid data
ALTER TABLE public.plants
ADD CONSTRAINT chk_humidity_level CHECK (humidity_level IN ('high', 'moderate', 'low')),
ADD CONSTRAINT chk_soil_temperature CHECK (soil_temperature BETWEEN 0 AND 40),
ADD CONSTRAINT chk_water_amount_ml CHECK (water_amount_ml > 0 AND water_amount_ml <= 2000);