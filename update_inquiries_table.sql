-- ===================================================
-- UPDATE INQUIRIES TABLE TO SUPPORT RESPONSES
-- ===================================================

-- Add new columns to inquiries table
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
ADD COLUMN IF NOT EXISTS response text,
ADD COLUMN IF NOT EXISTS responded_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS responded_by uuid REFERENCES public.profiles(id);

-- Update existing inquiries to have 'new' status
UPDATE public.inquiries SET status = 'new' WHERE status IS NULL;

-- Update RLS policies for inquiries
DROP POLICY IF EXISTS "Users can insert their own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Owners and Admins can view inquiries" ON public.inquiries;

-- Allow anyone to submit inquiries
CREATE POLICY "Anyone can insert inquiries" 
  ON public.inquiries FOR INSERT 
  WITH CHECK (true);

-- Property owners, agents, and admins can view inquiries for their properties
CREATE POLICY "Property owners can view inquiries" 
  ON public.inquiries FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT posted_by FROM public.properties WHERE id = property_id
    ) OR 
    public.is_admin() = true OR
    auth.uid() = user_id
  );

-- Property owners and admins can update inquiries (to respond)
CREATE POLICY "Property owners can update inquiries" 
  ON public.inquiries FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT posted_by FROM public.properties WHERE id = property_id
    ) OR 
    public.is_admin() = true
  );

-- ===================================================
-- VERIFICATION
-- ===================================================
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'inquiries' 
AND table_schema = 'public'
ORDER BY ordinal_position;
