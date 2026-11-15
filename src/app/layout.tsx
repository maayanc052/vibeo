import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vibeo · וַיְבֶאוֹ — אירועים, גיבוש וקהילה",
  description:
    "פלטפורמה לניהול אירועים, ימי גיבוש וסדנאות לארגונים: הרשמה מאובטחת, אישורי הגעה בלחיצה ותזכורות אוטומטיות.",
};

export const viewport: Viewport = {
  themeColor: "#07060d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground font-sans">{children}</body>
    </html>
  );
}
