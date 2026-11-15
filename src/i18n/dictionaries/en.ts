// מילון אנגלית — חייב להתאים למבנה המילון העברי (נבדק ע״י TypeScript)
import type { Dictionary } from "./he";

export const en: Dictionary = {
  meta: {
    title: "Vibeo — Events, Team-Building & Community",
    description:
      "The platform for company events, team-building days and workshops: secure registration, 1-click RSVP and automated reminders.",
  },
  common: {
    languageSwitch: "מעבר לעברית",
    free: "Free",
    currency: "₪",
    perPerson: "per person",
    seatsLeft: (n: number) => `${n} seats left`,
    soldOut: "Sold out",
    poweredBy: "Powered by",
    rights: "All rights reserved",
    backHome: "Back to home",
  },
  nav: {
    home: "Vibeo — Home",
    links: [
      { href: "#events", label: "Events" },
      { href: "#team-building", label: "Team-Building" },
      { href: "#workshops", label: "Workshops" },
      { href: "#ideas", label: "Ideas" },
    ],
    login: "Log in",
    cta: "Get started",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    badge: "The event platform for companies & communities",
    titleStart: "Your team's next experience",
    titleHighlight: "starts here",
    subtitle:
      "Team-building days, workshops and community events — with frictionless sign-up, 1-click RSVP, a digital QR pass and reminders that send themselves.",
    primaryCta: "Create your workspace",
    secondaryCta: "Explore events",
    highlights: ["Email OTP verification", "Automated reminders", "AI event generator"],
  },
  bento: {
    eyebrow: "All in one place",
    title: "From idea to door check-in",
    subtitle: "Categories, team-building packages and upcoming workshops — every organization gets its own branded space.",
    categories: {
      title: "Event categories",
      body: "Pick the experience — get a tailored sign-up form, capacity limits and built-in payments.",
      activeEvents: (n: number) => `${n} active events`,
      items: {
        team: "Team-building",
        workshops: "Workshops",
        community: "Community",
        conferences: "Conferences",
        volunteering: "Volunteering",
        outdoor: "Outdoor",
      },
    },
    ai: {
      title: "Smart event generator",
      body: "Write one sentence — get a full draft: title, schedule, pricing and a sign-up form.",
      prompt: "A team day for 40 employees up north with a kosher meal",
    },
    rsvp: {
      title: "1-click RSVP + QR pass",
      body: "No passwords. Mobile scan at the door and reminders 24h and 2h before.",
      stats: [
        { value: "12K+", label: "Participants" },
        { value: "98%", label: "RSVP rate" },
        { value: "2 min", label: "To launch an event" },
      ],
    },
    packages: {
      prefix: "",
      popular: "Most popular",
      items: [
        { name: "Basic", people: "Up to 30 people", price: "₪89", perks: ["Sign-up + OTP", "Email reminders"] },
        {
          name: "Team",
          people: "Up to 120 people",
          price: "₪149",
          perks: ["Dynamic forms", "QR passes", "WhatsApp"],
          featured: true,
        },
        { name: "Enterprise", people: "Unlimited", price: "Custom", perks: ["Full branding", "AI Generator", "Payments"] },
      ],
    },
    workshops: {
      title: "Upcoming workshops — live",
      all: "All workshops",
      items: [
        { title: "Team cooking workshop", date: "Tue, Nov 24", time: "18:00", seatsLeft: 6, price: 180 },
        { title: "Night navigation, Ben Shemen forest", date: "Thu, Nov 26", time: "19:30", seatsLeft: 14, price: 120 },
        { title: "Improv & communication workshop", date: "Sun, Nov 29", time: "10:00", seatsLeft: 3, price: 0 },
      ],
    },
    ideas: {
      title: "Ideas wall",
      body: "Employees suggest, everyone votes — the next event picks itself.",
      items: [
        { title: "Sunrise hike at Masada", votes: 87 },
        { title: "Social-impact hackathon", votes: 54 },
      ],
    },
  },
  tenant: {
    upcoming: "Upcoming events",
    upcomingSub: (n: number) => `${n} events open for registration`,
    register: "Register",
    registrationSoon: "Registration opens soon",
    capacity: (taken: number, max: number) => `${taken} of ${max} registered`,
    empty: "No open events right now. Check back soon!",
    categories: {
      team: "Team day",
      workshops: "Workshop",
      community: "Community",
      conferences: "Conference",
      volunteering: "Volunteering",
      outdoor: "Outdoor",
    },
  },
  notFound: {
    title: "Page not found",
    body: "The link may be wrong, or this organization workspace doesn't exist.",
  },
};
