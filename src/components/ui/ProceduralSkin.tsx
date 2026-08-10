"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Base hue in degrees — ties the surface to its treatment. */
  hue: number;
  /** 0 = post-treatment (smooth, luminous), 1 = pre-treatment (coarse, mottled). */
  roughness?: number;
  /** Turbulence scale. Higher = tighter pores, for the microscope view. */
  detail?: number;
  seed?: number;
  className?: string;
  animate?: boolean;
};

/**
 * Dermal surface synthesised entirely in SVG — fractal turbulence for pore
 * structure, displaced lighting for relief, no image assets required.
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
  const id = useId().replace(/:/g, "");

  const base = 0.012 + roughness * 0.05;
  const freq = base * detail;
  const octaves = Math.round(3 + roughness * 3);
  const relief = 6 + roughness * 26;

  /* Lightness stays broadly constant across the roughness range. If tone
     tracked roughness, the before/after pair would differ mainly in brightness
     — but the story is texture and evenness, and on an ivory page a "smooth"
     surface would simply fade into the background. */
  const light = `hsl(${hue} ${38 + roughness * 10}% ${74 - roughness * 8}%)`;
  const mid = `hsl(${hue} ${32 + roughness * 10}% ${58 - roughness * 10}%)`;
  const shadow = `hsl(${hue + 8} ${26 + roughness * 8}% ${36 - roughness * 8}%)`;

  return (
    <svg
      className={cn("h-full w-full", className)}
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={mid} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>

        <filter id={`derm-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${freq} ${freq * 1.35}`}
            numOctaves={octaves}
            seed={seed}
            result="noise"
          >
            {animate && (
              <animate
                attributeName="baseFrequency"
                dur="26s"
                values={`${freq} ${freq * 1.35};${freq * 1.18} ${freq * 1.5};${freq} ${freq * 1.35}`}
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>

          {/* Push the gradient around by the noise field to sculpt pores. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={relief}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          {/* Relight the displaced surface so relief actually reads. */}
          <feDiffuseLighting
            in="noise"
            surfaceScale={1.4 + roughness * 2.6}
            diffuseConstant={0.85}
            lightingColor="#ffffff"
            result="lit"
          >
            <feDistantLight azimuth={225} elevation={58} />
          </feDiffuseLighting>

          {/* Multiply the lighting pass into the gradient (k1 is the in1*in2
              term). Adding it instead — as a dark theme wants — pushes every
              value toward white, which on an ivory page erases the surface
              completely. The small k3 term keeps the shadows from crushing. */}
          <feComposite
            in="lit"
            in2="displaced"
            operator="arithmetic"
            k1="0.9"
            k2="0"
            k3="0.22"
            k4="0"
          />
          <feGaussianBlur stdDeviation={0.4 + (1 - roughness) * 1.1} />
        </filter>

        {/* Falls off to ivory, not black — the surfaces sit on a light page. */}
        <radialGradient id={`vig-${id}`} cx="50%" cy="42%" r="80%">
          <stop offset="58%" stopColor="#FBF8F4" stopOpacity="0" />
          <stop offset="100%" stopColor="#FBF8F4" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      <rect width="600" height="800" fill={`url(#grad-${id})`} filter={`url(#derm-${id})`} />
      <rect width="600" height="800" fill={`url(#vig-${id})`} />
    </svg>
  );
}
