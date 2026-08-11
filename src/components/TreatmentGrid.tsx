"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Clock, Volume2, VolumeX, Waves } from "lucide-react";
import { CATEGORIES, TREATMENTS, type Treatment, type TreatmentCategory } from "@/lib/data";
import { LUXE_EASE, viewportOnce } from "@/lib/motion";
import { cn, formatPrice } from "@/lib/utils";
import { ProceduralSkin } from "@/components/ui/ProceduralSkin";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useBoutique } from "@/lib/store";

type Filter = TreatmentCategory | "all";

/* ------------------------------------------------------------------- card */

function TreatmentCard({ treatment, index }: { treatment: Treatment; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [canPlay, setCanPlay] = useState(false);
  const { openBooking } = useBoutique();

  // Pointer position normalised to -0.5…0.5 across the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 150, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), spring);
  const depth = useSpring(hovered ? 1 : 0, { stiffness: 180, damping: 24 });

  // Layers lift by different amounts to build parallax inside the tilt.
  const mediaZ = useTransform(depth, [0, 1], [0, 34]);
  const textZ = useTransform(depth, [0, 1], [0, 62]);

  /* Glare follows the pointer across the glass. It is a fixed blob that gets
     translated, rather than a `radial-gradient(circle at X% Y%)` rebuilt each
     move — a gradient whose position changes has to be repainted across the
     whole card on the main thread, while a transform is handed to the
     compositor and costs nothing. */
  const glareX = useSpring(useTransform(px, [-0.5, 0.5], ["-22%", "22%"]), {
    stiffness: 140,
    damping: 22,
  });
  const glareY = useSpring(useTransform(py, [-0.5, 0.5], ["-22%", "22%"]), {
    stiffness: 140,
    damping: 22,
  });

  const handleMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const enter = () => {
    setHovered(true);
    const v = videoRef.current;
    // play() rejects if the element is torn down mid-gesture — ignore quietly.
    v?.play().catch(() => {});
  };

  const leave = () => {
    setHovered(false);
    px.set(0);
    py.set(0);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setMuted(true);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) v.play().catch(() => {});
  };

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.7, ease: LUXE_EASE, delay: (index % 3) * 0.07 }}
      onPointerMove={handleMove}
      onPointerEnter={enter}
      onPointerLeave={leave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      data-cursor="view"
      data-cursor-label="Protocol"
      data-cursor-magnet="0.12"
      data-active={hovered}
      className="glass glass-edge group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[26px] p-7 preserve-3d"
    >
      {/* Media layer */}
      <motion.div style={{ z: mediaZ }} className="absolute inset-0 -z-10">
        <motion.div
          animate={{ scale: hovered ? 1.08 : 1, opacity: hovered ? 1 : 0.88 }}
          transition={{ duration: 1.1, ease: LUXE_EASE }}
          className="absolute inset-0"
        >
          <ProceduralSkin hue={treatment.hue} roughness={0.5} seed={index + 2} animate />
        </motion.div>

        {treatment.video && (
          <motion.video
            ref={videoRef}
            src={treatment.video}
            muted={muted}
            loop
            playsInline
            preload="none"
            onCanPlay={() => setCanPlay(true)}
            animate={{ opacity: hovered && canPlay ? 0.62 : 0 }}
            transition={{ duration: 0.9, ease: LUXE_EASE }}
            className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/[0.82] to-white/10" />
        <motion.div
          style={{
            x: glareX,
            y: glareY,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.55), transparent 45%)",
          }}
          className="pointer-events-none absolute -inset-[18%] opacity-70"
        />
      </motion.div>

      {/* Top rail */}
      <div className="absolute inset-x-7 top-7 flex items-start justify-between gap-3">
        <span className="rounded-full border border-ink/10 bg-canvas-warm/[0.88] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          {CATEGORIES.find((c) => c.id === treatment.category)?.label}
        </span>

        {treatment.video && (
          <motion.button
            onClick={toggleSound}
            aria-label={muted ? "Unmute preview" : "Mute preview"}
            data-cursor="link"
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
            transition={{ duration: 0.4, ease: LUXE_EASE }}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/[0.12] bg-white/[0.88] text-ink transition-colors hover:border-champagne/70 hover:text-champagne-deep"
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </motion.button>
        )}
      </div>

      {/* Content */}
      <motion.div style={{ z: textZ }} className="relative flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[11px] text-champagne-deep/90">
          <Waves className="h-3.5 w-3.5" strokeWidth={1.4} />
          <span className="tracking-[0.06em]">{treatment.tagline}</span>
        </div>

        <h3 className="font-display text-[26px] leading-tight text-ink">{treatment.name}</h3>

        {/* Description unfurls on hover rather than crowding the resting state. */}
        <motion.div
          initial={false}
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.6, ease: LUXE_EASE }}
          className="overflow-hidden"
        >
          <p className="pb-1 text-[13px] leading-relaxed text-ink-muted">
            {treatment.description}
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" strokeWidth={1.5} />
            {treatment.duration}
          </span>
          <span>Downtime · {treatment.downtime}</span>
          {treatment.metrics.map((m) => (
            <span key={m.label} className="text-champagne-deep/85">
              {m.label} <span className="text-ink">{m.value}</span>
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-ink/[0.09] pt-5">
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">From</span>
            <span className="font-display text-xl text-ink">{formatPrice(treatment.from)}</span>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openBooking(treatment.id);
            }}
            data-cursor="link"
            className="inline-flex items-center gap-2 rounded-full border border-ink/[0.12] px-4 py-2.5 text-[12px] text-ink transition-all duration-500 ease-luxe hover:border-champagne hover:bg-ink hover:text-canvas"
          >
            Reserve
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </button>
        </div>
      </motion.div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------- grid */

export function TreatmentGrid() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? TREATMENTS : TREATMENTS.filter((t) => t.category === filter)),
    [filter],
  );

  return (
    <section id="treatments" className="relative py-32 lg:py-44">
      {/* Section glow */}
      <div
        className="glow left-1/2 top-0 h-[640px] w-[1000px] -translate-x-1/2"
        style={{ "--glow": "rgba(201,162,39,0.13)" } as React.CSSProperties}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="The Treatment Map"
          title="Protocols engineered around"
          accent="your biology"
          description="Nine signature protocols across four disciplines. Hover any card to see the treatment in motion — every figure below is drawn from our own outcome registry."
        />

        {/* Filters sit on their own line: five labels never fit beside the
            heading without wrapping into a ragged block. */}
        <div className="mt-10 flex lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: LUXE_EASE }}
            className="glass glass-edge no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                data-cursor="link"
                data-cursor-magnet="0.45"
                className={cn(
                  "relative whitespace-nowrap rounded-full px-4 py-2.5 text-[12px] transition-colors duration-500",
                  filter === cat.id ? "text-canvas" : "text-ink-soft hover:text-ink",
                )}
              >
                {filter === cat.id && (
                  <motion.span
                    layoutId="treatment-filter-pill"
                    transition={{ duration: 0.6, ease: LUXE_EASE }}
                    className="absolute inset-0 -z-10 rounded-full bg-ink"
                  />
                )}
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div
          layout
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((treatment, i) => (
              <TreatmentCard key={treatment.id} treatment={treatment} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
