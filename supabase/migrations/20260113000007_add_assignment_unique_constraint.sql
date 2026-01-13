
-- Add unique constraint to assignments table to enable upsert
-- We first clean up potential duplicates to avoid errors (keeping the latest one)
delete from assignments a
using assignments b
where a.id < b.id
  and a.event_id = b.event_id
  and a.staff_id = b.staff_id;

alter table assignments
add constraint assignments_event_id_staff_id_key unique (event_id, staff_id);
