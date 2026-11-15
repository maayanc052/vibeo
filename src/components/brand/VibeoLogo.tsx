import { useId } from "react";

type VibeoLogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

/** לוגו Vibeo — סימן "V" בצורת גל קול/דופק, SVG מקורי */
export function VibeoLogo({ size = 36, withWordmark = true, className }: VibeoLogoProps) {
  const id = useId().replace(/:/g, "");
  const grad = `vibeo-grad-${id}`;
  const glow = `vibeo-glow-${id}`;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`} dir="ltr">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="Vibeo"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={grad} x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.55" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
          <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="1" y="1" width="46" height="46" rx="14" fill="#0f0c1d" stroke={`url(#${grad})`} strokeOpacity="0.5" />
        <path
          d="M9 15 L16 15 L24 35 L32 15 L39 15"
          fill="none"
          stroke={`url(#${grad})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glow})`}
        />
        <circle cx="24" cy="11" r="2.6" fill="#f472b6" />
      </svg>
      {withWordmark && (
        <span className="text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-pink-300 bg-clip-text text-transparent">
            Vibeo
          </span>
        </span>
      )}
    </span>
  );
}

export default VibeoLogo;
