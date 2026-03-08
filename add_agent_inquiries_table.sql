-- ===================================================
-- AGENT INQUIRIES TABLE (Messages sent from /agents/[id])
-- ===================================================

CREATE TABLE IF NOT EXISTS public.agent_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  response text,
  responded_at timestamp with time zone,
  responded_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_inquiries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_agent_inquiries_agent_id ON public.agent_inquiries(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_inquiries_user_id ON public.agent_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_inquiries_status ON public.agent_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_agent_inquiries_created_at ON public.agent_inquiries(created_at DESC);

DROP POLICY IF EXISTS "Authenticated users can insert agent inquiries" ON public.agent_inquiries;
DROP POLICY IF EXISTS "Users/agents/admin can view agent inquiries" ON public.agent_inquiries;
DROP POLICY IF EXISTS "Agents/admin can update agent inquiries" ON public.agent_inquiries;

CREATE POLICY "Authenticated users can insert agent inquiries"
  ON public.agent_inquiries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users/agents/admin can view agent inquiries"
  ON public.agent_inquiries FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = agent_id
    OR public.is_admin() = true
  );

CREATE POLICY "Agents/admin can update agent inquiries"
  ON public.agent_inquiries FOR UPDATE
  USING (
    auth.uid() = agent_id
    OR public.is_admin() = true
  );
