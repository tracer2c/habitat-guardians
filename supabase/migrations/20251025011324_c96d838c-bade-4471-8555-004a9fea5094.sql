-- Make power column nullable to support Earth mode (where power is not applicable)
ALTER TABLE environmental_readings 
ALTER COLUMN power DROP NOT NULL;