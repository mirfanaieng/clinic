import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { TreatmentGrid } from "@/components/TreatmentGrid";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Boutique } from "@/components/sections/Boutique";
import { Reels } from "@/components/sections/Reels";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { Marquee } from "@/components/sections/Marquee";
import { BookingDrawer } from "@/components/BookingDrawer";
import { CartDrawer } from "@/components/sections/CartDrawer";

export default function Home() {
  return (
    <>
      <Nav />

      <main className="relative">
        <Hero />
        <Marquee />
        <TreatmentGrid />
        <BeforeAfter />
        <Boutique />
        <Reels />
        <Faq />
      </main>

      <Footer />

      {/* Overlays live outside <main> so they portal above everything. */}
      <BookingDrawer />
      <CartDrawer />
    </>
  );
}
