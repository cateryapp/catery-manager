-- Create a function to automatically add the creator as a member
create or replace function public.add_creator_as_owner()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, auth.uid(), 'owner');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function after a workspace is inserted
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute procedure public.add_creator_as_owner();
