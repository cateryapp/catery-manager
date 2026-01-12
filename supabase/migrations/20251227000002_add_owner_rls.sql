-- Add owner_id to workspaces
alter table workspaces add column owner_id uuid references auth.users(id) default auth.uid();

-- Drop old policies to update them cleanly
drop policy if exists "Users can view workspaces they are members of" on workspaces;
drop policy if exists "Users can insert workspaces" on workspaces;

-- Update RLS
-- Select: Member OR Owner
create policy "Users can view workspaces" on workspaces
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspaces.id
      and user_id = auth.uid()
    )
    or
    owner_id = auth.uid()
  );

-- Insert: Authenticated users can insert (owner_id auto-set)
create policy "Users can insert workspaces" on workspaces
  for insert with check (auth.role() = 'authenticated');

-- Update: Owner only (for now) or Admins (via members)
create policy "Owners can update workspaces" on workspaces
  for update using (owner_id = auth.uid());
