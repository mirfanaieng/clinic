"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { Microscope, MoveHorizontal } from "lucide-react";
import { LUXE_EASE, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ProceduralSkin } from "@/components/ui/ProceduralSkin";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CASES = [
  {
    id: "acne-scarring",
    label: "Atrophic scarring",
    protocol: "Fractional Laser · 3 sessions",
    window: "16 weeks",
    hue: 14,
    before: 0.86,
    after: 0.2,
  },
  {
    id: "photoaging",
    label: "Photoaging & pigment",
    protocol: "PRP + Polynucleotide · 4 sessions",
    window: "22 weeks",
    hue: 32,
    before: 0.78,
    after: 0.16,
  },
  {
    id: "texture",
    label: "Barrier & texture",
    protocol: "HydraFacial Couture · 6 sessions",
    window: "12 weeks",
    hue: 350,
    before: 0.7,
    after: 0.12,
  },
];

export function BeforeAfter() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [micro, setMicro] = useState(false);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const active = CASES[caseIndex];

  // 0…100 — the divider position as a percentage of the frame width.
  const raw = useMotionValue(50);
  const pos = useSpring(raw, { stiffness: 420, damping: 42, mass: 0.6 });
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`);
  const handleLeft = useMotionTemplate`${pos}%`;

  // Mirrored into state purely so assistive tech sees a live value.
  const [ariaValue, setAriaValue] = useState(50);
  useMotionValueEvent(pos, "change", (v) => setAriaValue(Math.round(v)));

  const setFromClientX = useCallback(
    (clientX: number) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      raw.set(Math.min(100, Math.max(0, pct)));
    },
    [raw],
  );

  // Pointer capture on the frame keeps the drag alive outside the element.
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    setFromClientX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromClientX(e.clientX);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Arrow keys nudge the divider for keyboard users.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft") raw.set(Math.max(0, raw.get() - step));
    if (e.key === "ArrowRight") raw.set(Math.min(100, raw.get() + step));
  };

  // Sweep the divider once when the case changes, to show both states.
  useEffect(() => {
    raw.set(72);
    const t = setTimeout(() => raw.set(38), 420);
    const t2 = setTimeout(() => raw.set(50), 1100);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [caseIndex, raw]);

  return (
    <section id="results" className="relative py-32 lg:py-44">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Outcome Registry"
            title="Unretouched, same light,"
            accent="same lens"
            description="Every pairing is captured on our calibrated VISIA rig at identical exposure. Drag the divider — or open the microscope view to inspect pore-level texture."
          />

          <motion.button
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, ease: LUXE_EASE }}
            onClick={() => setMicro((v) => !v)}
            data-cursor="link"
            data-active={micro}
            className={cn(
              "glass glass-edge inline-flex shrink-0 items-center gap-3 self-start rounded-full py-3 pl-4 pr-6 transition-colors duration-500 lg:self-end",
              micro && "border-champagne/60 bg-champagne/16",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full transition-colors duration-500",
                micro ? "bg-ink text-canvas" : "bg-canvas-warm/70 text-champagne-deep",
              )}
            >
              <Microscope className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[13px] text-ink">Microscope view</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                {micro ? "40× dermal detail" : "Clinical distance"}
              </span>
            </span>
          </motion.button>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Frame */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 1, ease: LUXE_EASE }}
            ref={frameRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKeyDown}
            role="slider"
            tabIndex={0}
            aria-label="Before and after comparison"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={ariaValue}
            data-cursor="drag"
            data-cursor-label="Drag"
            className="glass relative aspect-[16/11] select-none overflow-hidden rounded-[26px] sm:aspect-[16/9]"
            style={{ touchAction: "pan-y" }}
          >
            {/* After (base layer) */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-after-${micro}`}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: LUXE_EASE }}
                  className="absolute inset-0"
                >
                  <ProceduralSkin
                    hue={active.hue}
                    roughness={active.after}
                    detail={micro ? 0.28 : 1}
                    seed={caseIndex * 3 + 1}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Before (clipped to the left of the divider) */}
            <motion.div style={{ clipPath: clip }} className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-before-${micro}`}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: LUXE_EASE }}
                  className="absolute inset-0"
                >
                  <ProceduralSkin
                    hue={active.hue}
                    roughness={active.before}
                    detail={micro ? 0.28 : 1}
                    seed={caseIndex * 3 + 1}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Divider */}
            <motion.div
              style={{ left: handleLeft }}
              className="pointer-events-none absolute inset-y-0 z-20 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ink/70 to-transparent"
            >
              <motion.span
                animate={{ scale: dragging ? 1.12 : 1 }}
                transition={{ duration: 0.4, ease: LUXE_EASE }}
                className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-white/75 text-ink backdrop-blur-xl"
              >
                <span className="absolute inset-0 rounded-full bg-champagne/16 blur-lg" />
                <MoveHorizontal className="relative h-4 w-4" strokeWidth={1.5} />
              </motion.span>
            </motion.div>

            {/* Corner labels */}
            <span className="pointer-events-none absolute left-5 top-5 z-10 rounded-full border border-ink/10 bg-white/72 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-soft backdrop-blur-md">
              Baseline
            </span>
            <span className="pointer-events-none absolute right-5 top-5 z-10 rounded-full border border-champagne/50 bg-champagne/14 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-champagne-deep backdrop-blur-md">
              Week {active.window.replace(" weeks", "")}
            </span>

            <AnimatePresence>
              {micro && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, ease: LUXE_EASE }}
                  className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-ink/10 bg-white/75 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-ink-soft backdrop-blur-md"
                >
                  40× · 1 mm field of view
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Case selector */}
          <div className="flex flex-col gap-3">
            {CASES.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.7, ease: LUXE_EASE, delay: i * 0.08 }}
                onClick={() => setCaseIndex(i)}
                data-cursor="link"
                data-active={caseIndex === i}
                className={cn(
                  "glass glass-edge flex flex-col gap-2 rounded-2xl p-5 text-left transition-colors duration-500",
                  caseIndex === i ? "border-champagne/55 bg-champagne/[0.11]" : "hover:bg-canvas-warm/70",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[14px] text-ink">{c.label}</span>
                  {caseIndex === i && (
                    <motion.span
                      layoutId="case-dot"
                      className="h-1.5 w-1.5 rounded-full bg-champagne"
                    />
                  )}
                </span>
                <span className="text-[11px] leading-relaxed text-ink-muted">
                  {c.protocol}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-champagne-deep/85">
                  {c.window} elapsed
                </span>
              </motion.button>
            ))}

            <p className="mt-2 text-[11px] leading-relaxed text-ink-muted/85">
              Individual outcomes vary. Imagery on this demo is synthesised for
              illustration — production builds pull from the consented patient registry.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
