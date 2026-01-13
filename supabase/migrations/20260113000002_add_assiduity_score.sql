
-- 1. Add assiduity_score column
alter table staff 
add column assiduity_score integer default 0;

-- Index for sorting
create index idx_staff_assiduity on staff (assiduity_score desc);

-- 2. Create Calculation Function
create or replace function calculate_staff_assiduity()
returns void
language plpgsql
security definer
as $$
begin
  -- Update scores based on confirmed/completed assignments in the last 2 months
  with scores as (
    select 
      staff_id, 
      count(*) as score
    from assignments
    where 
      (status = 'confirmed' or status = 'completed') 
      and end_at > (now() - interval '2 months')
    group by staff_id
  )
  update staff s
  set assiduity_score = coalesce(sc.score, 0)
  from scores sc
  where s.id = sc.staff_id;

  -- Reset scores to 0 for those not in the list (optional, assuming we want to decay old scores)
  -- A more complex query could do this in one go, but for MVP this ensures accuracy.
  update staff 
  set assiduity_score = 0 
  where id not in (
    select staff_id from assignments 
    where (status = 'confirmed' or status = 'completed') 
    and end_at > (now() - interval '2 months')
  );
end;
$$;

-- 3. Schedule it (Requires pg_cron extension enabled on Supabase Dashboard)
-- select cron.schedule('nightly-assiduity', '0 3 * * *', 'select calculate_staff_assiduity()');
