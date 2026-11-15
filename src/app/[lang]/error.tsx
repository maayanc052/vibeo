"use client";

import { RotateCcw } from "lucide-react";
import { VibeoLogo } from "@/components/brand/VibeoLogo";

// דף שגיאה דו-לשוני — מוצג כשטעינת נתונים נכשלת (למשל תקלה זמנית במסד הנתונים)
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="aurora grid min-h-screen place-items-center px-4">
      <div className="max-w-md rounded-3xl border border-white/10 bg-black/40 p-10 text-center backdrop-blur-xl">
        <VibeoLogo size={40} />
        <h1 className="mt-6 text-2xl font-bold">משהו השתבש</h1>
        <p className="mt-2 text-muted">לא הצלחנו לטעון את הדף. נסו שוב בעוד רגע.</p>
        <div dir="ltr" className="mt-6 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted">We couldn&apos;t load this page. Please try again in a moment.</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-black hover:bg-white/90"
        >
          <RotateCcw className="size-4" />
          נסו שוב · Try again
        </button>
      </div>
    </main>
  );
}
