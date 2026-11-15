import { VibeoLogo } from "@/components/brand/VibeoLogo";

export function Footer({ rights }: { rights: string }) {
  return (
    <footer id="start" className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <VibeoLogo size={28} />
        <p className="text-sm text-muted">© 2026 Vibeo · וַיְבֶאוֹ — {rights}</p>
      </div>
    </footer>
  );
}
