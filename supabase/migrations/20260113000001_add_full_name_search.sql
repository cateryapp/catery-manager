
-- Add a generated column for full name search
-- This concatenates first and last name, lowercases it, and stores it for indexing
alter table staff 
add column full_name_search text generated always as (
  lower(first_name || ' ' || coalesce(last_name, ''))
) stored;

-- Add an index for fast text matching
create index idx_staff_full_name_search on staff (full_name_search);
