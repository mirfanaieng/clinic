"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LUXE_EASE } from "@/lib/motion";
import { useBoutique } from "@/lib/store";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

const LINKS = [
  { label: "Protocols", href: "#treatments" },
  { label: "Results", href: "#results" },
  { label: "Boutique", href: "#boutique" },
  { label: "Voices", href: "#voices" },
  { label: "Questions", href: "#faq" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setCartOpen, openBooking } = useBoutique();
  const lenis = useLenis();

  useMotionValueEvent(scrollY, "change", (v) => setCondensed(v > 40));

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const go = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    // Lenis owns the scroll, so route anchor jumps through it.
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -90, duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: LUXE_EASE, delay: 0.3 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 transition-all duration-700 ease-luxe lg:px-10",
            condensed ? "py-3" : "py-6",
          )}
        >
          <button
            onClick={() => lenis?.scrollTo(0, { duration: 1.6 })}
            data-cursor="link"
            className="flex items-center gap-3 text-left"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-champagne/55">
              <span className="absolute inset-0 rounded-full bg-champagne/14 blur-md" />
              <span className="font-display text-[15px] italic text-champagne-deep">V</span>
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[17px] tracking-wide text-ink">VESSANTE</span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.34em] text-ink-muted">
                Aesthetic Institute
              </span>
            </span>
          </button>

          <nav
            className={cn(
              "hidden items-center gap-1 rounded-full px-2 py-2 transition-all duration-700 ease-luxe lg:flex",
              condensed && "glass glass-edge rounded-full",
            )}
          >
            {LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => go(link.href)}
                data-cursor="link"
                data-cursor-magnet="0.4"
                className="relative rounded-full px-4 py-2 text-[13px] text-ink-soft transition-colors duration-500 hover:text-ink"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              data-cursor="link"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
              className="glass glass-edge relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors duration-500 hover:text-champagne-deep"
            >
              <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.4} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: LUXE_EASE }}
                  className="absolute -right-1 -top-1 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-ink"
                >
                  {count}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => openBooking()}
              data-cursor="link"
              className="hidden rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-canvas shadow-lift transition-colors duration-500 hover:bg-champagne-deep sm:block"
            >
              Book Consultation
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              data-cursor="link"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="glass glass-edge grid h-11 w-11 place-items-center rounded-full text-ink lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-[17px] w-[17px]" strokeWidth={1.4} />
              ) : (
                <Menu className="h-[17px] w-[17px]" strokeWidth={1.4} />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile sheet */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
        transition={{ duration: 0.5, ease: LUXE_EASE }}
        className="fixed inset-0 z-40 bg-canvas/96 backdrop-blur-2xl lg:hidden"
      >
        <nav className="flex h-full flex-col items-start justify-center gap-2 px-10">
          {LINKS.map((link, i) => (
            <motion.button
              key={link.href}
              animate={mobileOpen ? { y: 0, opacity: 1 } : { y: 28, opacity: 0 }}
              transition={{ duration: 0.7, ease: LUXE_EASE, delay: mobileOpen ? 0.08 + i * 0.06 : 0 }}
              onClick={() => go(link.href)}
              className="font-display text-4xl text-ink"
            >
              {link.label}
            </motion.button>
          ))}
        </nav>
      </motion.div>
    </>
  );
}
