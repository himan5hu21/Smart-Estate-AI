-- Add unit_number field to properties table
-- This allows users to specify apartment/flat/unit numbers separately from the main address

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS unit_number TEXT;

-- Add a comment to explain the field
COMMENT ON COLUMN properties.unit_number IS 'Unit, flat, or apartment number (e.g., 4B, 201, Suite 305)';
