-- נתוני הדגמה: שני ארגונים וחמישה אירועים (עברית ראשית + תרגום אנגלי ב-i18n)
insert into public.organizations (name, slug, tagline, brand_colors, i18n) values
  ('נובה לאבס', 'nova-labs', 'הצוות שלנו, החוויות שלנו',
   '{"primary": "#8b5cf6", "secondary": "#22d3ee"}',
   '{"en": {"name": "Nova Labs", "tagline": "Our team, our experiences"}}'),
  ('קהילת השקד', 'kehilat-hashaked', 'נפגשים, יוצרים, מתנדבים — ביחד',
   '{"primary": "#10b981", "secondary": "#f59e0b"}',
   '{"en": {"name": "Almond Community", "tagline": "Meet, create, volunteer — together"}}');

insert into public.events
  (organization_id, title, description, category, location, event_date, max_capacity, price, i18n)
select o.id, v.title, v.description, v.category::public.event_category, v.location,
       v.event_date::timestamptz, v.max_capacity, v.price, v.i18n::jsonb
from (values
  ('nova-labs', 'יום גיבוש בגליל העליון',
   'קיאקים בירדן, ארוחת צהריים כשרה ומשחק צוותי בשטח. הסעות מהמשרד.',
   'team', 'כפר בלום', '2026-12-03T08:00:00+02:00', 80, 0,
   '{"en": {"title": "Team day in the Upper Galilee", "description": "Kayaking on the Jordan, a kosher lunch and an outdoor team game. Shuttles from the office.", "location": "Kfar Blum"}}'),
  ('nova-labs', 'סדנת בישול צוותית',
   'שפים מובילים, תחנות עבודה בקבוצות וארוחה משותפת בסוף הערב.',
   'workshops', 'תל אביב', '2026-11-24T18:00:00+02:00', 24, 180,
   '{"en": {"title": "Team cooking workshop", "description": "Leading chefs, group cooking stations and a shared dinner at the end.", "location": "Tel Aviv"}}'),
  ('nova-labs', 'כנס חדשנות שנתי',
   'הרצאות, דמו של צוותי המוצר ופאנל על עתיד העבודה.',
   'conferences', 'מרכז הכנסים, חיפה', '2027-01-14T09:30:00+02:00', 300, 0,
   '{"en": {"title": "Annual innovation summit", "description": "Talks, product team demos and a panel on the future of work.", "location": "Convention Center, Haifa"}}'),
  ('kehilat-hashaked', 'יום התנדבות בחווה החקלאית',
   'קטיף, אריזת סלי מזון למשפחות ופיקניק משותף.',
   'volunteering', 'עמק חפר', '2026-11-27T08:30:00+02:00', 50, 0,
   '{"en": {"title": "Volunteering day at the farm", "description": "Harvesting, packing food baskets for families and a shared picnic.", "location": "Hefer Valley"}}'),
  ('kehilat-hashaked', 'ערב קהילה: מוזיקה מסביב למדורה',
   'שירה בציבור, כיבוד קל ומפגש שכנים חדשים.',
   'community', 'הגבעה המרכזית', '2026-12-10T19:00:00+02:00', 120, 25,
   '{"en": {"title": "Community night: music by the bonfire", "description": "Sing-along, light refreshments and meeting new neighbors.", "location": "The central hill"}}')
) as v(slug, title, description, category, location, event_date, max_capacity, price, i18n)
join public.organizations o on o.slug = v.slug;
