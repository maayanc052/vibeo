import { FloatingNav } from "@/components/landing/FloatingNav";
import { Hero } from "@/components/landing/Hero";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <FloatingNav />
      <main>
        <Hero />
        <BentoGrid />
      </main>
      <Footer />
    </>
  );
}
