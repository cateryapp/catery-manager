-- Add user_id to staff table to link with global profiles
ALTER TABLE public.staff 
ADD COLUMN user_id uuid REFERENCES public.profiles(id);

-- Create staff_invitations table for deep linking
CREATE TABLE public.staff_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspaces(id) NOT NULL,
  staff_id uuid REFERENCES public.staff(id) NOT NULL,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '7 days'
);

-- Enable RLS
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Workspace owners/members can view/create invitations for their workspace
CREATE POLICY "Access invitations in own workspaces" ON public.staff_invitations
  FOR ALL USING (workspace_id = ANY(get_user_workspace_ids()));

-- Public access for token validation (needed for the Portal App to check token validity without auth initially?)
-- Actually, the Portal App might be logged in or not. 
-- If we want to validate a token, we might need a function or a public policy on select if we query by token.
-- For security, it's better to expose this via a secure function (RPC) rather than direct table access for anon.
-- But for now, let's keep RLS tight and maybe add a specific policy if needed later.
-- We will use a Server Action (which bypasses RLS if using service role, or uses user context) for generation.
-- For consumption (Portal), we likely need an Edge Function or public RPC.
