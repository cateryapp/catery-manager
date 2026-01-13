
-- Add estimated_guests to events
alter table events 
add column estimated_guests integer;

comment on column events.estimated_guests is 'Number of guests expected at the event (PAX)';
