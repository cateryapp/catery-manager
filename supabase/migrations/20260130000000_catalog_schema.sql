-- Create ENUMs
create type product_type as enum ('single', 'bundle', 'service');
create type product_role as enum ('sellable', 'component', 'both');
create type product_visibility as enum ('internal', 'client', 'both');
create type pricing_mode as enum ('fixed', 'per_unit');
create type base_unit as enum ('guest', 'unit', 'hour', 'service');
create type quantity_source as enum ('guests', 'manual', 'hours');

create type pricing_behavior as enum ('included', 'surcharge');
create type component_visibility_mode as enum ('internal', 'client', 'both');

create type resource_type as enum ('ingredient', 'tableware', 'equipment');
create type resource_unit as enum ('unit', 'kg', 'g', 'l', 'ml', 'pack', 'hour');
create type resource_rule_type as enum ('per_product_unit', 'per_ratio', 'fixed_per_parent');
create type rounding_mode as enum ('ceil', 'floor', 'round', 'none');
create type resource_application_scope as enum ('all', 'selected_components_only', 'bundle_parent_only');


-- 1. Phase Types
create table phase_types (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table phase_types enable row level security;
create policy "Access phase_types in own workspaces" on phase_types
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 2. Product Categories
create table product_categories (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  parent_category_id uuid references product_categories(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table product_categories enable row level security;
create policy "Access product_categories in own workspaces" on product_categories
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 3. Products
create table products (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  sku text,
  category_id uuid references product_categories(id),
  product_type product_type default 'single',
  product_role product_role default 'sellable',
  is_active boolean default true,
  visibility product_visibility default 'both',
  base_unit base_unit default 'guest',
  pricing_mode pricing_mode default 'per_unit',
  base_price numeric(12,2) default 0,
  tax_rate numeric(5,2),
  default_quantity_source quantity_source default 'guests',
  image_url text,
  created_at timestamptz default now()
);

alter table products enable row level security;
create policy "Access products in own workspaces" on products
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 4. Compatibility (Product <-> Phase Type)
create table phase_type_products (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  phase_type_id uuid references phase_types(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  is_default boolean default false,
  sort_order int,
  created_at timestamptz default now(),
  unique(phase_type_id, product_id)
);

alter table phase_type_products enable row level security;
create policy "Access phase_type_products in own workspaces" on phase_type_products
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 5. Bundle Groups
create table bundle_groups (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  parent_product_id uuid references products(id) on delete cascade not null,
  name text not null,
  min_select int default 0,
  max_select int, -- null means unlimited
  pricing_behavior pricing_behavior default 'included',
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table bundle_groups enable row level security;
create policy "Access bundle_groups in own workspaces" on bundle_groups
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 6. Product Components (Bundle definitions)
create table product_components (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  parent_product_id uuid references products(id) on delete cascade not null,
  child_product_id uuid references products(id) on delete cascade not null,
  group_id uuid references bundle_groups(id) on delete set null,
  quantity numeric(12,3) default 1,
  is_optional boolean default false,
  default_selected boolean default true,
  visibility_mode component_visibility_mode default 'both',
  notes text,
  created_at timestamptz default now()
);

alter table product_components enable row level security;
create policy "Access product_components in own workspaces" on product_components
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 7. Resources
create table resources (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  resource_type resource_type default 'ingredient',
  unit resource_unit default 'unit',
  cost_per_unit numeric(12,4) default 0,
  is_reusable boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table resources enable row level security;
create policy "Access resources in own workspaces" on resources
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 8. Product Resources (Resource allocations)
create table product_resources (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  resource_id uuid references resources(id) on delete cascade not null,
  rule_type resource_rule_type default 'per_product_unit',
  quantity numeric(12,4) default 0,
  ratio_base numeric(12,4),
  rounding_mode rounding_mode default 'ceil',
  applies_to resource_application_scope default 'all',
  notes text,
  created_at timestamptz default now()
);

alter table product_resources enable row level security;
create policy "Access product_resources in own workspaces" on product_resources
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 9. Event Phases
create table event_phases (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  phase_type_id uuid references phase_types(id) on delete restrict not null, -- keep consistent history
  name_override text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- We need RLS on event linked tables. Since we don't store workspace_id directly here (it's on event), 
-- we can join or denormalize. Denormalizing is safer for RLS performance.
alter table event_phases add column workspace_id uuid references workspaces(id) on delete cascade;
-- Backfill workspace_id trigger or application logic needed. strict constraint might fail if no default. 
-- For new schema, we mandate workspace_id.
alter table event_phases alter column workspace_id set not null;

alter table event_phases enable row level security;
create policy "Access event_phases in own workspaces" on event_phases
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 10. Event Phase Items
create table event_phase_items (
  id uuid default gen_random_uuid() primary key,
  event_phase_id uuid references event_phases(id) on delete cascade not null,
  workspace_id uuid references workspaces(id) on delete cascade not null, 
  product_id uuid references products(id) on delete restrict not null,
  quantity numeric(12,3),
  quantity_source quantity_source default 'guests',
  unit_price_override numeric(12,2),
  pricing_mode_override pricing_mode,
  configuration_json jsonb,
  notes text,
  created_at timestamptz default now()
);

alter table event_phase_items enable row level security;
create policy "Access event_phase_items in own workspaces" on event_phase_items
  for all using (workspace_id = any(get_user_workspace_ids()));

-- 11. Event Phase Item Components (Detailed selections)
create table event_phase_item_components (
  id uuid default gen_random_uuid() primary key,
  event_phase_item_id uuid references event_phase_items(id) on delete cascade not null,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  component_product_id uuid references products(id) on delete restrict not null,
  group_id uuid references bundle_groups(id) on delete set null,
  quantity numeric(12,3),
  selected boolean default true,
  created_at timestamptz default now()
);

alter table event_phase_item_components enable row level security;
create policy "Access event_phase_item_components in own workspaces" on event_phase_item_components
  for all using (workspace_id = any(get_user_workspace_ids()));
