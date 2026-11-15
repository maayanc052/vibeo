-- 1) הגנת תפוסה: חסימת הרשמה לאירוע מלא, כולל מצב של שתי הרשמות באותו רגע
--    (נעילת שורת האירוע עד סוף הטרנזקציה). שגיאה עם קוד ייעודי: event_full.
create function private.guard_event_capacity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  cap integer;
  taken integer;
begin
  -- רלוונטי רק להרשמה חדשה פעילה, או להחזרת הרשמה מבוטלת לפעילה
  if new.status = 'cancelled' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status <> 'cancelled' and old.event_id = new.event_id then
    return new;
  end if;

  select max_capacity into cap from public.events where id = new.event_id for update;
  select count(*) into taken from public.registrations
    where event_id = new.event_id and status <> 'cancelled' and id <> new.id;

  if taken >= cap then
    raise exception 'event_full' using errcode = 'P0001', hint = 'vibeo:event_full';
  end if;
  return new;
end;
$$;

create trigger registrations_guard_capacity
  before insert or update of status, event_id on public.registrations
  for each row execute function private.guard_event_capacity();

-- 2) שדות טופס דינמיים לאירועי ההדגמה
--    מבנה שדה: {id, type: text|textarea|select|checkbox|dietary, label: {he, en}, required, options?: [{value, label: {he, en}}]}
update public.events set custom_form_fields = '[
  {"id": "diet", "type": "dietary", "required": true,
   "label": {"he": "העדפה תזונתית", "en": "Dietary preference"}},
  {"id": "shuttle", "type": "checkbox", "required": false,
   "label": {"he": "אצטרך הסעה מהמשרד", "en": "I need a shuttle from the office"}},
  {"id": "shirt", "type": "select", "required": false,
   "label": {"he": "מידת חולצה לערכת המשתתף", "en": "T-shirt size for the participant kit"},
   "options": [
     {"value": "s", "label": {"he": "S", "en": "S"}},
     {"value": "m", "label": {"he": "M", "en": "M"}},
     {"value": "l", "label": {"he": "L", "en": "L"}},
     {"value": "xl", "label": {"he": "XL", "en": "XL"}}
   ]}
]'::jsonb
where category = 'team';

update public.events set custom_form_fields = '[
  {"id": "diet", "type": "dietary", "required": true,
   "label": {"he": "העדפה תזונתית", "en": "Dietary preference"}},
  {"id": "experience", "type": "select", "required": true,
   "label": {"he": "ניסיון בבישול", "en": "Cooking experience"},
   "options": [
     {"value": "beginner", "label": {"he": "מתחיל/ה", "en": "Beginner"}},
     {"value": "home", "label": {"he": "מבשל/ת בבית", "en": "Home cook"}},
     {"value": "pro", "label": {"he": "מנוסה מאוד", "en": "Very experienced"}}
   ]},
  {"id": "allergies", "type": "text", "required": false,
   "label": {"he": "אלרגיות (אם יש)", "en": "Allergies (if any)"}}
]'::jsonb
where category = 'workshops';

update public.events set custom_form_fields = '[
  {"id": "team", "type": "text", "required": true,
   "label": {"he": "צוות / מחלקה", "en": "Team / department"}},
  {"id": "questions", "type": "textarea", "required": false,
   "label": {"he": "שאלה לפאנל (אופציונלי)", "en": "A question for the panel (optional)"}}
]'::jsonb
where category = 'conferences';

update public.events set custom_form_fields = '[
  {"id": "diet", "type": "dietary", "required": false,
   "label": {"he": "העדפה תזונתית לפיקניק", "en": "Dietary preference for the picnic"}},
  {"id": "kids", "type": "checkbox", "required": false,
   "label": {"he": "אגיע עם ילדים", "en": "I am coming with kids"}}
]'::jsonb
where category in ('volunteering', 'community');
