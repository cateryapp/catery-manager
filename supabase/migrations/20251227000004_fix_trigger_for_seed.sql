-- Update the trigger function to handle null auth.uid() (e.g. during seeding)
create or replace function public.add_creator_as_owner()
returns trigger as $$
begin
  -- Only attempt to add member if we have a valid logged-in user
  if auth.uid() is not null then
    insert into public.workspace_members (workspace_id, user_id, role)
    values (new.id, auth.uid(), 'owner');
  end if;
  return new;
end;
$$ language plpgsql security definer;
