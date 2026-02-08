-- ===================================================
-- REMOVE VIEW TRACKING FEATURE
-- Run this script to remove the view tracking functionality
-- ===================================================

-- 1. Drop the increment_property_views function
DROP FUNCTION IF EXISTS increment_property_views(BIGINT);
DROP FUNCTION IF EXISTS increment_property_views(UUID);

-- 2. Remove the views column from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS views;

-- ===================================================
-- VERIFICATION
-- ===================================================

-- Check if function is removed
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'increment_property_views';
-- Should return no rows

-- Check if views column is removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'properties' 
AND column_name = 'views';
-- Should return no rows

-- ===================================================
-- CLEANUP COMPLETE
-- ===================================================
