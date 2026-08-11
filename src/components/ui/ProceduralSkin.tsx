"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { dermalTile } from "@/lib/texture";

type Props = {
  /** Base hue in degrees — ties the surface to its treatment. */
  hue: number;
  /** 0 = post-treatment (smooth, luminous), 1 = pre-treatment (coarse, mottled). */
  roughness?: number;
  /** Turbulence scale. Higher = tighter pores, for the microscope view. */
  detail?: number;
  seed?: number;
  className?: string;
  /** Adds a slow compositor-only drift. Never touches the main thread. */
  animate?: boolean;
};

/**
 * Dermal surface built from a cached relief tile blended over a hue gradient.
 *
 * The relief itself is generated once per (roughness, detail, seed) bucket and
 * served from the image cache — see `@/lib/texture`. Everything here is a plain
 * painted div, so a hover, a drag or a clip-path sweep repaints in microseconds
 * instead of re-running a fractal noise graph.
 *
 * Drop real photography or video in wherever this is used; the API is the same
 * shape, this is what renders until you do.
 */
export function ProceduralSkin({
  hue,
  roughness = 0.5,
  detail = 1,
  seed = 3,
  className,
  animate = false,
}: Props) {
  const tile = useMemo(() => dermalTile(roughness, detail, seed), [roughness, detail, seed]);

  /* Lightness stays broadly constant across the roughness range. If tone
     tracked roughness, the before/after pair would differ mainly in brightness
     — but the story is texture and evenness, and on an ivory page a "smooth"
     surface would simply fade into the background. */
  const light = `hsl(${hue} ${38 + roughness * 10}% ${74 - roughness * 8}%)`;
  const mid = `hsl(${hue} ${32 + roughness * 10}% ${58 - roughness * 10}%)`;
  const shadow = `hsl(${hue + 8} ${26 + roughness * 8}% ${36 - roughness * 8}%)`;

  // Coarse surfaces show more of the relief map; smooth ones only whisper it.
  const reliefOpacity = 0.38 + roughness * 0.42;
  // Micro view zooms the pores right in, matching the old `detail` behaviour.
  const scale = 260 / Math.max(0.25, detail);

  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Base tone */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(155deg, ${light} 0%, ${mid} 45%, ${shadow} 100%)` }}
      />

      {/* Relief. `soft-light` over the gradient sculpts pores without shifting
          the hue; the transform drift is compositor-only, so an always-on
          animation here costs the main thread nothing. */}
      <div
        className={cn("absolute -inset-[6%]", animate && "animate-skin-drift")}
        style={{
          backgroundImage: `url("${tile}")`,
          backgroundSize: `${scale}px ${scale}px`,
          backgroundRepeat: "repeat",
          mixBlendMode: "soft-light",
          opacity: reliefOpacity,
        }}
      />

      {/* Falls off to ivory, not black — the surfaces sit on a light page. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 80% at 50% 42%, transparent 58%, rgba(251,248,244,0.45) 100%)",
        }}
      />
    </div>
  );
}
