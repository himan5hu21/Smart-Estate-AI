-- Add pincode field to properties table
-- This allows users to specify the 6-digit postal code for the property

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS pincode TEXT;

-- Add a comment to explain the field
COMMENT ON COLUMN properties.pincode IS '6-digit postal/zip code for the property location';

-- Optional: Add a check constraint to ensure it's 6 digits (if you want strict validation)
-- ALTER TABLE properties 
-- ADD CONSTRAINT pincode_format CHECK (pincode IS NULL OR pincode ~ '^\d{6}$');
