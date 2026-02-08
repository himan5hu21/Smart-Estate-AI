-- Create saved_properties table
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_property_id ON saved_properties(property_id);

-- Enable RLS
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own saved properties
CREATE POLICY "Users can view their own saved properties"
  ON saved_properties FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save properties
CREATE POLICY "Users can save properties"
  ON saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave their properties
CREATE POLICY "Users can unsave properties"
  ON saved_properties FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON saved_properties TO authenticated;
GRANT ALL ON saved_properties TO service_role;
