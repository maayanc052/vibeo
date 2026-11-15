import Link from "next/link";
import { VibeoLogo } from "@/components/brand/VibeoLogo";
import { he } from "@/i18n/dictionaries/he";
import { en } from "@/i18n/dictionaries/en";

// דף 404 דו-לשוני (עמוד not-found לא מקבל params, לכן מציגים את שתי השפות)
export default function NotFound() {
  return (
    <main className="aurora grid min-h-screen place-items-center px-4">
      <div className="max-w-md rounded-3xl border border-white/10 bg-black/40 p-10 text-center backdrop-blur-xl">
        <VibeoLogo size={40} />
        <p className="mt-6 text-6xl font-black" dir="ltr">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold">{he.notFound.title}</h1>
        <p className="mt-2 text-muted">{he.notFound.body}</p>
        <div dir="ltr" className="mt-6 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold">{en.notFound.title}</h2>
          <p className="mt-1 text-sm text-muted">{en.notFound.body}</p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-white px-4 py-2 font-semibold text-black hover:bg-white/90">
            {he.common.backHome}
          </Link>
          <Link href="/en" className="rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10">
            {en.common.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
