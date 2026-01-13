
-- Add is_available column to assignments table
alter table assignments 
add column is_available boolean default false;

-- Add comment to explain usage
comment on column assignments.is_available is 'Indicates if a staff member is available for this event, even if not assigned yet. Used for sorting candidates.';
