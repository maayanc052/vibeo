import type { BrandColors } from "@/lib/data/organizations";

type Props = {
  name: string;
  logoUrl: string | null;
  colors: BrandColors;
  size?: number;
};

/** לוגו ארגון — תמונה אם הועלתה, אחרת ראשי תיבות על גרדיאנט בצבעי המותג */
export function OrgLogo({ name, logoUrl, colors, size = 44 }: Props) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- לוגו חיצוני שמועלה ע״י הארגון
    return <img src={logoUrl} alt={name} width={size} height={size} className="rounded-2xl object-cover" />;
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <span
      role="img"
      aria-label={name}
      className="grid shrink-0 place-items-center rounded-2xl font-black text-white shadow-lg"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      }}
    >
      {initials}
    </span>
  );
}
