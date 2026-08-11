/**
 * Baked dermal texture tiles.
 *
 * The previous implementation put `<feTurbulence>` + `<feDisplacementMap>` +
 * `<feDiffuseLighting>` inline in the DOM. An inline SVG filter is re-executed
 * by the rasteriser on *every repaint of the filtered region* — and with a SMIL
 * `<animate>` driving `baseFrequency`, that meant regenerating a multi-octave
 * Perlin field over a 600x800 box, sixteen times over, every single frame.
 *
 * A filter reached through `background-image: url("data:image/svg+xml,...")`
 * behaves completely differently: it is rasterised once, keyed by URL, and
 * served from the image cache forever after. Same pixels, no recurring cost.
 *
 * So the expensive part is quantised into a handful of shared tiles. Roughness
 * and detail are bucketed, which collapses the whole page down to a few unique
 * rasters instead of one live filter graph per element.
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Tile edge in px. `stitchTiles` makes the noise wrap seamlessly at this size. */
const TILE = 320;

const cache = new Map<string, string>();

/**
 * A grayscale relief map of dermal texture, as a tiling data URI.
 *
 * Mid-grey reads as flat, so the result can be dropped straight onto a colour
 * gradient with `soft-light` and the surface picks up believable relief without
 * the base hue shifting.
 */
export function dermalTile(roughness: number, detail = 1, seed = 3): string {
  // Bucketing is what makes this cheap: nearby values share one raster.
  const r = Math.round(clamp01(roughness) * 8) / 8;
  const d = Math.round(Math.max(0.15, detail) * 4) / 4;
  const s = Math.abs(Math.round(seed)) % 4;

  const key = `${r}|${d}|${s}`;
  const hit = cache.get(key);
  if (hit) return hit;

  // Coarse, low-frequency mottling for "before"; tight fine grain for "after".
  const freq = (0.018 + r * 0.055) * d;
  const octaves = 3 + Math.round(r * 2);
  // Relief depth. Rough skin catches far more side light than smooth skin.
  const surface = 1.1 + r * 3.2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">\
<filter id="d" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">\
<feTurbulence type="fractalNoise" baseFrequency="${freq.toFixed(4)} ${(freq * 1.3).toFixed(4)}" \
numOctaves="${octaves}" seed="${s}" stitchTiles="stitch" result="n"/>\
<feDiffuseLighting in="n" surfaceScale="${surface.toFixed(2)}" diffuseConstant="1" lighting-color="#fff">\
<feDistantLight azimuth="225" elevation="58"/>\
</feDiffuseLighting>\
</filter>\
<rect width="${TILE}" height="${TILE}" filter="url(#d)"/>\
</svg>`;

  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  cache.set(key, uri);
  return uri;
}
