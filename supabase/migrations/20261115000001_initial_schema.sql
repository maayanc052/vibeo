-- =====================================================================
-- Vibeo — סכמה ראשונית
-- טבלאות לפי CLAUDE.md סעיף 3 + אבטחת RLS להפרדה מלאה בין ארגונים.
-- תוספות על האפיון (מסומנות ★): location, tagline, i18n (תרגומים), currency/gateway.
-- =====================================================================

-- ---------- סוגים (enums) ----------
create type public.user_role as enum ('super_admin', 'org_admin', 'user');
create type public.registration_status as enum ('pending_approval', 'approved', 'paid', 'cancelled');
create type public.rsvp_status as enum ('awaiting_rsvp', 'confirmed_attending', 'declined', 'checked_in');
create type public.event_category as enum ('team', 'workshops', 'community', 'conferences', 'volunteering', 'outdoor');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type public.notification_channel as enum ('email', 'whatsapp', 'sms');
create type public.idea_status as enum ('open', 'planned', 'done', 'rejected');

-- ---------- ארגונים ----------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('en', 'he', 'admin', 'api', 'rsvp')),
  tagline text,                                   -- ★
  logo_url text,
  brand_colors jsonb not null default '{"primary": "#8b5cf6", "secondary": "#22d3ee"}',
  i18n jsonb not null default '{}',               -- ★ {"en": {"name": "...", "tagline": "..."}}
  created_at timestamptz not null default now()
);

-- ---------- פרופילים (מקושר למשתמשי Supabase Auth) ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  organization_id uuid references public.organizations (id) on delete set null,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);
create index profiles_organization_id_idx on public.profiles (organization_id);

-- ---------- אירועים ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  category public.event_category not null default 'team',
  location text,                                  -- ★
  event_date timestamptz not null,
  max_capacity integer not null check (max_capacity > 0),
  price numeric(10, 2) not null default 0 check (price >= 0),
  cover_image_url text,
  is_active boolean not null default true,
  custom_form_fields jsonb not null default '[]',
  i18n jsonb not null default '{}',               -- ★ {"en": {"title": "...", "description": "...", "location": "..."}}
  created_at timestamptz not null default now()
);
create index events_org_date_idx on public.events (organization_id, event_date);

-- ---------- הרשמות ----------
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.registration_status not null default 'pending_approval',
  rsvp_status public.rsvp_status not null default 'awaiting_rsvp',
  rsvp_token uuid not null unique default gen_random_uuid(),
  qr_code_hash text unique,
  reminder_24h_sent boolean not null default false,
  reminder_2h_sent boolean not null default false,
  checked_in_at timestamptz,
  custom_answers jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
create index registrations_user_id_idx on public.registrations (user_id);

-- ---------- תשלומים ----------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'ILS',           -- ★
  gateway text not null default 'mock',           -- ★ mock | payplus | grow | meshulam
  gateway_transaction_id text unique,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index payments_registration_id_idx on public.payments (registration_id);

-- ---------- קיר רעיונות ----------
create table public.event_ideas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  category public.event_category,
  status public.idea_status not null default 'open',
  created_at timestamptz not null default now()
);
create index event_ideas_org_idx on public.event_ideas (organization_id);
create index event_ideas_created_by_idx on public.event_ideas (created_by);

create table public.idea_votes (
  idea_id uuid not null references public.event_ideas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);
create index idea_votes_user_id_idx on public.idea_votes (user_id);

-- ---------- יומן התראות ----------
create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete cascade,
  registration_id uuid references public.registrations (id) on delete cascade,
  channel public.notification_channel not null,
  notification_type text not null,               -- למשל: otp, approval, reminder_24h, reminder_2h
  sent_at timestamptz not null default now()
);
create index notification_logs_event_idx on public.notification_logs (event_id);
create index notification_logs_registration_idx on public.notification_logs (registration_id);

-- =====================================================================
-- פונקציות עזר לאבטחה — בסכמה פרטית (לא חשופה דרך ה-API)
-- =====================================================================
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create function private.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'super_admin'
  );
$$;

-- האם המשתמש הנוכחי מנהל של הארגון (או מנהל-על)
create function private.is_org_admin(org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and (role = 'super_admin' or (role = 'org_admin' and organization_id = org))
  );
$$;

create function private.event_org(e uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select organization_id from public.events where id = e;
$$;

grant execute on function private.is_super_admin(), private.is_org_admin(uuid), private.event_org(uuid)
  to anon, authenticated;

-- יצירת פרופיל אוטומטית לכל משתמש חדש ב-Auth
create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- מספר המקומות התפוסים באירועים פעילים — ציבורי, מחזיר מספרים בלבד (ללא פרטי נרשמים)
create function public.event_seats_taken(event_ids uuid[])
returns table (event_id uuid, taken bigint)
language sql stable security definer set search_path = '' as $$
  select r.event_id, count(*)::bigint
  from public.registrations r
  join public.events e on e.id = r.event_id
  where r.event_id = any (event_ids)
    and r.status <> 'cancelled'
    and e.is_active
  group by r.event_id;
$$;
revoke execute on function public.event_seats_taken(uuid[]) from public;
grant execute on function public.event_seats_taken(uuid[]) to anon, authenticated;

-- =====================================================================
-- RLS — הפעלה על כל הטבלאות
-- =====================================================================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;
alter table public.event_ideas enable row level security;
alter table public.idea_votes enable row level security;
alter table public.notification_logs enable row level security;

-- ---------- organizations: ציבורי לקריאה, ניהול למנהלי הארגון ----------
create policy "organizations: public read" on public.organizations
  for select to anon, authenticated using (true);
create policy "organizations: super admin insert" on public.organizations
  for insert to authenticated with check ((select private.is_super_admin()));
create policy "organizations: admins update" on public.organizations
  for update to authenticated
  using ((select private.is_org_admin(id))) with check ((select private.is_org_admin(id)));
create policy "organizations: super admin delete" on public.organizations
  for delete to authenticated using ((select private.is_super_admin()));

-- ---------- profiles: המשתמש רואה את עצמו; מנהל רואה את חברי הארגון ----------
create policy "profiles: read own or as org admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_org_admin(organization_id)));
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- מניעת הסלמת הרשאות: משתמש יכול לעדכן רק את שמו (לא role / organization_id)
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---------- events: אירועים פעילים ציבוריים; ניהול למנהלי הארגון ----------
create policy "events: public read active" on public.events
  for select to anon, authenticated
  using (is_active or (select private.is_org_admin(organization_id)));
create policy "events: admins insert" on public.events
  for insert to authenticated with check ((select private.is_org_admin(organization_id)));
create policy "events: admins update" on public.events
  for update to authenticated
  using ((select private.is_org_admin(organization_id)))
  with check ((select private.is_org_admin(organization_id)));
create policy "events: admins delete" on public.events
  for delete to authenticated using ((select private.is_org_admin(organization_id)));

-- ---------- registrations: המשתמש רואה ונרשם לעצמו; מנהל הארגון מאשר ----------
create policy "registrations: read own or as org admin" on public.registrations
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_org_admin(private.event_org(event_id))));
create policy "registrations: register self to active event" on public.registrations
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.events e where e.id = event_id and e.is_active)
  );
create policy "registrations: org admin update" on public.registrations
  for update to authenticated
  using ((select private.is_org_admin(private.event_org(event_id))))
  with check ((select private.is_org_admin(private.event_org(event_id))));
-- בהרשמה המשתמש קובע רק אירוע + תשובות לטופס; סטטוס/טוקן/QR נקבעים ע״י המערכת
revoke insert on public.registrations from authenticated;
grant insert (event_id, user_id, custom_answers) on public.registrations to authenticated;

-- ---------- payments: קריאה בלבד (כתיבה רק מהשרת עם service role) ----------
create policy "payments: read own or as org admin" on public.payments
  for select to authenticated
  using (
    exists (
      select 1 from public.registrations r
      where r.id = registration_id
        and (r.user_id = (select auth.uid()) or (select private.is_org_admin(private.event_org(r.event_id))))
    )
  );

-- ---------- event_ideas ----------
create policy "event_ideas: public read" on public.event_ideas
  for select to anon, authenticated using (true);
create policy "event_ideas: create own" on public.event_ideas
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "event_ideas: creator or admin update" on public.event_ideas
  for update to authenticated
  using (created_by = (select auth.uid()) or (select private.is_org_admin(organization_id)))
  with check (created_by = (select auth.uid()) or (select private.is_org_admin(organization_id)));
create policy "event_ideas: creator or admin delete" on public.event_ideas
  for delete to authenticated
  using (created_by = (select auth.uid()) or (select private.is_org_admin(organization_id)));
-- משתמש רגיל לא קובע סטטוס לרעיון (רק מנהל, דרך עדכון)
revoke insert on public.event_ideas from authenticated;
grant insert (organization_id, created_by, title, description, category) on public.event_ideas to authenticated;

-- ---------- idea_votes ----------
create policy "idea_votes: public read" on public.idea_votes
  for select to anon, authenticated using (true);
create policy "idea_votes: vote as self" on public.idea_votes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "idea_votes: unvote own" on public.idea_votes
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------- notification_logs: קריאה למנהלי הארגון בלבד ----------
create policy "notification_logs: org admin read" on public.notification_logs
  for select to authenticated
  using ((select private.is_org_admin(private.event_org(event_id))));
