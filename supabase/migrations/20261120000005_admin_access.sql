-- גישות נוספות ללוח הניהול

-- 1) מנהל ארגון רואה את הפרופיל (שם + מייל) של מי שנרשם לאירועי הארגון שלו
create policy "profiles: org admin reads registrants" on public.profiles
  for select to authenticated
  using (
    exists (
      select 1
      from public.registrations r
      join public.events e on e.id = r.event_id
      where r.user_id = profiles.id
        and (select private.is_org_admin(e.organization_id))
    )
  );

-- 2) מנהל ארגון רושם ביומן ההתראות הודעות שנשלחו לנרשמים של הארגון שלו
create policy "notification_logs: org admin insert" on public.notification_logs
  for insert to authenticated
  with check ((select private.is_org_admin(private.event_org(event_id))));
