import { ArrowLeft } from "lucide-react";

/** חץ "קדימה" שמתהפך לפי כיוון השפה: שמאלה ב-RTL, ימינה ב-LTR */
export function ForwardArrow({ className = "size-4" }: { className?: string }) {
  return <ArrowLeft aria-hidden className={`ltr:rotate-180 ${className}`} />;
}
