
-- Add staffing_requirements to events
-- Stored as JSONB: { "waiter": 4, "chef": 2, "coordinator": 1 }
alter table events 
add column staffing_requirements jsonb default '{}'::jsonb;

-- Optional: Add a comment
comment on column events.staffing_requirements is 'Stores required counts for each role, e.g., {"waiter": 10}';
