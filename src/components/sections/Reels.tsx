"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Quote, Volume2, VolumeX } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "@/lib/data";
import { LUXE_EASE, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ProceduralSkin } from "@/components/ui/ProceduralSkin";
import { SectionHeading } from "@/components/ui/SectionHeading";

function Reel({ item, index }: { item: Testimonial; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // 60% visible before we commit to playing — avoids thrashing during fast scrolls.
  const inView = useInView(ref, { amount: 0.6 });

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);

  // Autoplay is driven by viewport intersection, unless the user paused it.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (inView && !manualPause) {
      v.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [inView, manualPause]);

  // Leaving the viewport resets both the mute and the manual pause.
  useEffect(() => {
    if (!inView) {
      setMuted(true);
      setManualPause(false);
    }
  }, [inView]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      setManualPause(false);
      v.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      setManualPause(true);
      v.pause();
      setPlaying(false);
    }
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.9, ease: LUXE_EASE, delay: (index % 3) * 0.08 }}
      data-active={inView}
      className="glass glass-edge group relative aspect-[9/16] w-[260px] shrink-0 snap-center overflow-hidden rounded-[24px] sm:w-[300px]"
    >
      {/* Procedural base — also what shows before the clip has buffered. */}
      <div className="absolute inset-0">
        <ProceduralSkin hue={item.hue} roughness={0.35} seed={index + 5} animate />
      </div>

      {item.video && (
        <video
          ref={videoRef}
          src={item.video}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-multiply"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/30" />

      {/* Controls */}
      <div className="absolute right-3.5 top-3.5 flex flex-col gap-2">
        <button
          onClick={togglePlay}
          data-cursor="link"
          aria-label={playing ? "Pause reel" : "Play reel"}
          className="grid h-9 w-9 place-items-center rounded-full border border-ink/[0.12] bg-white/[0.88] text-ink transition-colors duration-500 hover:border-champagne/70 hover:text-champagne-deep"
        >
          {playing ? (
            <Pause className="h-3.5 w-3.5" strokeWidth={1.6} />
          ) : (
            <Play className="h-3.5 w-3.5" strokeWidth={1.6} />
          )}
        </button>

        <button
          onClick={toggleSound}
          data-cursor="link"
          aria-label={muted ? "Unmute reel" : "Mute reel"}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full border bg-white/[0.88] transition-colors duration-500",
            muted
              ? "border-ink/[0.12] text-ink hover:border-champagne/70 hover:text-champagne-deep"
              : "border-champagne/70 bg-champagne/25 text-champagne-deep",
          )}
        >
          {muted ? (
            <VolumeX className="h-3.5 w-3.5" strokeWidth={1.6} />
          ) : (
            <Volume2 className="h-3.5 w-3.5" strokeWidth={1.6} />
          )}
        </button>
      </div>

      <span className="absolute left-3.5 top-3.5 rounded-full border border-ink/10 bg-white/[0.88] px-2.5 py-1 text-[10px] tabular-nums tracking-[0.1em] text-ink-soft">
        {item.duration}
      </span>

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
        <Quote className="h-4 w-4 text-champagne-deep/85" strokeWidth={1.5} />
        <p className="text-[12.5px] leading-relaxed text-ink/90">{item.quote}</p>
        <div className="flex items-center gap-3 border-t border-ink/[0.09] pt-3">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-medium text-ink"
            style={{ background: `hsl(${item.hue} 45% 72%)` }}
          >
            {item.name.charAt(0)}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[12px] text-ink">{item.name}</span>
            <span className="truncate text-[10px] text-ink-muted">{item.treatment}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function Reels() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <section id="voices" className="relative overflow-hidden py-32 lg:py-44">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Patient Voices"
            title="Unscripted, filmed"
            accent="in the atrium"
            description="Clips play as they enter view and mute themselves on the way out. Sound is always yours to turn on."
          />

          <div className="flex gap-2">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => scrollBy(dir)}
                data-cursor="link"
                aria-label={dir === -1 ? "Previous reels" : "Next reels"}
                className="glass glass-edge grid h-12 w-12 place-items-center rounded-full text-ink transition-colors duration-500 hover:text-champagne-deep"
              >
                {dir === -1 ? (
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-bleed track so the reels run off the edge of the viewport. */}
      <div
        ref={trackRef}
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:px-10"
      >
        {TESTIMONIALS.map((item, i) => (
          <Reel key={item.id} item={item} index={i} />
        ))}
        {/* Trailing spacer keeps the last card clear of the viewport edge. */}
        <span className="w-2 shrink-0" aria-hidden />
      </div>
    </section>
  );
}
