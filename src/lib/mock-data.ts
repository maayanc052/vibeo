export type Workshop = {
  title: string;
  date: string;
  time: string;
  seatsLeft: number;
  price: number;
};

export const categories = [
  { key: "team", label: "ימי גיבוש", count: 24 },
  { key: "workshops", label: "סדנאות", count: 41 },
  { key: "community", label: "אירועי קהילה", count: 18 },
  { key: "conferences", label: "כנסים", count: 9 },
  { key: "volunteering", label: "התנדבות", count: 12 },
  { key: "outdoor", label: "פעילויות שטח", count: 15 },
];

export const packages = [
  { name: "בסיסי", people: "עד 30 משתתפים", price: "₪89", perks: ["הרשמה + OTP", "תזכורות במייל"] },
  { name: "צוות", people: "עד 120 משתתפים", price: "₪149", perks: ["טפסים דינמיים", "כרטיסי QR", "וואטסאפ"], featured: true },
  { name: "ארגון", people: "ללא הגבלה", price: "בהתאמה", perks: ["מיתוג מלא", "AI Generator", "סליקה"] },
];

export const workshops: Workshop[] = [
  { title: "סדנת בישול צוותית", date: "יום ג׳, 24.11", time: "18:00", seatsLeft: 6, price: 180 },
  { title: "ניווט לילה ביער בן שמן", date: "יום ה׳, 26.11", time: "19:30", seatsLeft: 14, price: 120 },
  { title: "סדנת אלתור ותקשורת", date: "יום א׳, 29.11", time: "10:00", seatsLeft: 3, price: 0 },
];

export const stats = [
  { value: "12K+", label: "משתתפים נרשמו" },
  { value: "98%", label: "אישורי הגעה" },
  { value: "2 דק׳", label: "להקמת אירוע" },
];
