-- Add new columns to events table
alter table events add column default_guest_count int default 0;
alter table events add column doc_content jsonb default null;

-- Create event_moments table
create table event_moments (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  event_id uuid references events(id) on delete cascade not null,
  type text not null, -- 'ceremony', 'cocktail', 'dinner', 'party', 'meeting', 'custom'
  name text not null,
  start_at timestamptz,
  end_at timestamptz,
  
  -- Logic: If 'inherit', we use the event's global values. If 'custom', we use the override.
  location_mode text check (location_mode in ('inherit', 'custom')) default 'inherit',
  location_override text,
  
  guest_count_mode text check (guest_count_mode in ('inherit', 'custom')) default 'inherit',
  guest_count_override int,
  
  requirements jsonb default '{}'::jsonb, -- stored as JSON for flexibility
  notes text,
  
  rank int default 0, -- for ordering moments
  created_at timestamptz default now()
);

-- RLS for event_moments
alter table event_moments enable row level security;

create policy "Access moments in own workspaces" on event_moments
  for all using (workspace_id = any(get_user_workspace_ids()));
