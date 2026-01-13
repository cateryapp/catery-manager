
-- Create workspace_configs table for storing flexible key-value settings
create table workspace_configs (
  workspace_id uuid references workspaces(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (workspace_id, key)
);

-- RLS
alter table workspace_configs enable row level security;
create policy "Access configs in own workspaces" on workspace_configs
  for all using (workspace_id = any(get_user_workspace_ids()));

-- Function to handle updates
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_workspace_configs_updated_at
    before update on workspace_configs
    for each row
    execute procedure update_updated_at_column();
