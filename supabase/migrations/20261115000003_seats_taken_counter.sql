-- מונה מקומות תפוסים על טבלת האירועים (במקום פונקציה ציבורית עם הרשאות מוגברות).
-- מתעדכן אוטומטית בכל שינוי בהרשמות; הרשמות מבוטלות לא נספרות.
drop function public.event_seats_taken(uuid[]);

alter table public.events add column seats_taken integer not null default 0 check (seats_taken >= 0);

create function private.refresh_event_seats_taken()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  affected uuid[];
begin
  affected := array_remove(array[
    case when tg_op in ('INSERT', 'UPDATE') then new.event_id end,
    case when tg_op in ('UPDATE', 'DELETE') then old.event_id end
  ], null);

  update public.events e
  set seats_taken = (
    select count(*) from public.registrations r
    where r.event_id = e.id and r.status <> 'cancelled'
  )
  where e.id = any (affected);

  return null;
end;
$$;

create trigger registrations_refresh_seats_taken
  after insert or update of status, event_id or delete on public.registrations
  for each row execute function private.refresh_event_seats_taken();
