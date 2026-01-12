-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- PROFILES (mirrors auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- WORKSPACES
create table workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  join_code text unique, -- simple invite mechanism for now
  created_at timestamptz default now()
);

-- WORKSPACE MEMBERS
create type workspace_role as enum ('owner', 'admin', 'member', 'viewer');

create table workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role workspace_role default 'member',
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- HELPER FOR RLS
-- Returns the list of workspace IDs the current user belongs to.
create or replace function get_user_workspace_ids()
returns uuid[]
language sql
security definer
stable
as $$
  select array_agg(workspace_id)
  from workspace_members
  where user_id = auth.uid();
$$;

-- RLS POLICIES
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

alter table workspaces enable row level security;
create policy "Users can view workspaces they are members of" on workspaces
  for select using (id = any(get_user_workspace_ids()));
create policy "Users can insert workspaces" on workspaces for insert with check (true);
-- Note: Insert policy needs to automatically add creator as member (handled via trigger or app logic). 
-- For MVP app logic is easier, but trigger is safer.

alter table workspace_members enable row level security;
create policy "Users can view members of their workspaces" on workspace_members
  for select using (workspace_id = any(get_user_workspace_ids()));

-- EVENTS
create type event_status as enum ('draft', 'confirmed', 'done', 'cancelled');

create table events (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  status event_status default 'draft',
  created_at timestamptz default now()
);

alter table events enable row level security;
create policy "Access events in own workspaces" on events
  for all using (workspace_id = any(get_user_workspace_ids()));

-- STAFF
create table staff (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  first_name text not null,
  last_name text,
  email text,
  phone text,
  attributes jsonb default '{}'::jsonb, -- role, skills, etc
  created_at timestamptz default now()
);

alter table staff enable row level security;
create policy "Access staff in own workspaces" on staff
  for all using (workspace_id = any(get_user_workspace_ids()));

-- ASSIGNMENTS
create type assignment_status as enum ('pending', 'confirmed', 'completed', 'disputed');

create table assignments (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null, -- denormalized for RLS perm efficiency
  event_id uuid references events(id) on delete cascade not null,
  staff_id uuid references staff(id) on delete cascade not null,
  role text, -- e.g. "Waiter", "Chef"
  start_at timestamptz,
  end_at timestamptz,
  hours_worked numeric(10,2),
  net_amount numeric(10,2), -- The "Payroll Result"
  status assignment_status default 'pending',
  created_at timestamptz default now()
);

alter table assignments enable row level security;
create policy "Access assignments in own workspaces" on assignments
  for all using (workspace_id = any(get_user_workspace_ids()));

-- PROVIDERS
create table providers (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  category text, -- 'transport', 'food', etc
  contact_info text,
  created_at timestamptz default now()
);

alter table providers enable row level security;
create policy "Access providers in own workspaces" on providers
  for all using (workspace_id = any(get_user_workspace_ids()));

-- COSTS
create table event_costs (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null, 
  event_id uuid references events(id) on delete cascade not null,
  provider_id uuid references providers(id), -- optional, ad-hoc costs possible
  description text not null,
  amount numeric(10,2) not null,
  created_at timestamptz default now()
);

alter table event_costs enable row level security;
create policy "Access costs in own workspaces" on event_costs
  for all using (workspace_id = any(get_user_workspace_ids()));

-- TRIGGER for User Creation -> Profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
