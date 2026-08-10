#!/usr/bin/env bash
# Synthesises the abstract preview loops used by the treatment cards and the
# testimonial reels. Everything is generated from ffmpeg's built-in sources —
# no stock footage, no licensing, no binary assets in version control.
#
# Replace the output files with real clinical footage when you have it; the
# filenames are what the app looks for.
#
#   ./scripts/generate-media.sh
set -euo pipefail

OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
mkdir -p "$OUT"

# name            c1        c2        c3        tone  tone2
PALETTES=(
  "rejuvenation 0xD4AF37 0xF7E7E8 0x3A1F2A 174 261"
  "sculpting    0x7FA8C4 0xC7CBD1 0x101828 146 220"
  "hair         0xE8CC7A 0x8C6D1F 0x1A1208 196 294"
  "longevity    0x9FD4B8 0xD4AF37 0x0C1A16 165 247"
)

landscape() {
  local name=$1 c1=$2 c2=$3 c3=$4 f1=$5 f2=$6
  echo "  · treatment-$name.mp4"
  ffmpeg -y -loglevel error \
    -f lavfi -i "gradients=s=768x576:c0=0x0A0A0C:c1=$c1:c2=$c2:c3=$c3:n=4:speed=0.012:type=spiral:d=10:r=25" \
    -f lavfi -i "sine=frequency=$f1:duration=10,volume=0.11" \
    -f lavfi -i "sine=frequency=$f2:duration=10,volume=0.07" \
    -filter_complex "\
      [0:v]noise=alls=14:allf=t+u,gblur=sigma=9,eq=contrast=1.28:saturation=1.15:brightness=-0.06,\
vignette=PI/3.6,format=yuv420p[v];\
      [1:a][2:a]amix=inputs=2:duration=first,tremolo=f=0.25:d=0.6,\
afade=t=in:d=1.2,afade=t=out:st=8.8:d=1.2[a]" \
    -map "[v]" -map "[a]" \
    -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 33 -preset slow -g 50 \
    -c:a aac -b:a 48k -movflags +faststart -t 10 \
    "$OUT/treatment-$name.mp4"
}

portrait() {
  local idx=$1 c1=$2 c2=$3 f1=$4
  echo "  · reel-$idx.mp4"
  ffmpeg -y -loglevel error \
    -f lavfi -i "gradients=s=432x768:c0=0x0A0A0C:c1=$c1:c2=$c2:c3=0x141418:n=4:speed=0.016:type=radial:d=8:r=25" \
    -f lavfi -i "sine=frequency=$f1:duration=8,volume=0.1" \
    -filter_complex "\
      [0:v]noise=alls=11:allf=t+u,gblur=sigma=11,eq=contrast=1.22:saturation=1.1:brightness=-0.08,\
vignette=PI/4,format=yuv420p[v];\
      [1:a]tremolo=f=0.3:d=0.7,afade=t=in:d=1,afade=t=out:st=7:d=1[a]" \
    -map "[v]" -map "[a]" \
    -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 34 -preset slow -g 40 \
    -c:a aac -b:a 40k -movflags +faststart -t 8 \
    "$OUT/reel-$idx.mp4"
}

echo "Generating treatment previews…"
for row in "${PALETTES[@]}"; do
  # shellcheck disable=SC2086
  set -- $row
  landscape "$1" "$2" "$3" "$4" "$5" "$6"
done

echo "Generating testimonial reels…"
portrait 1 0xD4AF37 0xF7E7E8 174
portrait 2 0xE8CC7A 0x8C6D1F 196
portrait 3 0x9FD4B8 0xD4AF37 165
portrait 4 0xD48F8F 0xF7E7E8 208
portrait 5 0x7FA8C4 0xC7CBD1 146

echo
echo "Done → public/media"
du -sh "$OUT"
