/**
 * Ashima Arts / Stefan Gustavson simplex noise (MIT).
 * Shared by the silk surface and the cellular field.
 */
export const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/**
 * Undulating silk. Layered simplex octaves drive the displacement; the pointer
 * adds a travelling ripple whose amplitude decays with distance.
 */
export const SILK_VERTEX = /* glsl */ `
uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerStrength;
uniform float uAmplitude;

varying vec2  vUv;
varying float vElevation;
varying vec3  vNormalView;

${SIMPLEX_3D}

/**
 * Two octaves only. Normals need three evaluations of this per vertex, so
 * every octave here costs 3x — the fine weave detail is added far more
 * cheaply in the fragment stage instead.
 */
float silk(vec2 p) {
  float n  = snoise(vec3(p.x * 0.55, p.y * 0.75, uTime * 0.14));
        n += snoise(vec3(p.x * 1.45, p.y * 1.70, uTime * 0.22)) * 0.42;
  return n;
}

void main() {
  vUv = uv;
  vec3 pos = position;

  float h0 = silk(position.xy) * uAmplitude;
  float elevation = h0;

  // Pointer ripple — a decaying sine ring centred on the cursor.
  float d = distance(pos.xy, uPointer * 3.2);
  float ripple = sin(d * 3.4 - uTime * 2.1) * exp(-d * 1.15);
  elevation += ripple * 0.55 * uPointerStrength;

  pos.z += elevation;

  // Smooth normal from finite differences of the height field. Without a
  // shading cue the surface reads as fog rather than fabric. h0 is reused
  // from the displacement above, so this costs two extra samples, not three.
  float eps = 0.06;
  float hx = silk(position.xy + vec2(eps, 0.0)) * uAmplitude;
  float hy = silk(position.xy + vec2(0.0, eps)) * uAmplitude;

  vec3 tx = vec3(eps, 0.0, hx - h0);
  vec3 ty = vec3(0.0, eps, hy - h0);
  vec3 n  = normalize(cross(tx, ty));

  vNormalView = normalize(normalMatrix * n);
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const SILK_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec3  uColorShadow;
uniform vec3  uColorGold;
uniform vec3  uColorBase;
uniform float uOpacity;

varying vec2  vUv;
varying float vElevation;
varying vec3  vNormalView;

void main() {
  vec3 N = normalize(vNormalView);
  vec3 V = vec3(0.0, 0.0, 1.0);

  // Two-light studio: a key from upper left, a champagne fill from the
  // right. Satin gets its character from the tight specular lobe.
  vec3 L1 = normalize(vec3(-0.45, 0.72, 0.55));
  vec3 L2 = normalize(vec3(0.68, -0.28, 0.62));

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0);

  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);
  float spec1 = pow(max(dot(N, H1), 0.0), 64.0);
  float spec2 = pow(max(dot(N, H2), 0.0), 28.0);

  // Fresnel picks out the fold edges turning away from camera.
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

  // On a light page the fabric has to read by going DARKER than the ivory in
  // its troughs — an additive build-up from black only ever produces haze.
  float shade = diff1 * 0.62 + diff2 * 0.34;
  vec3 color = mix(uColorShadow, uColorBase, smoothstep(0.04, 0.72, shade));

  // Crests take a white highlight, folds a champagne bloom.
  color = mix(color, vec3(1.0), clamp(spec1 * 0.9, 0.0, 1.0));
  color = mix(color, uColorGold, clamp(spec2 * 0.30 + fres * 0.16, 0.0, 1.0));

  // Weave detail, added here rather than as a third displacement octave —
  // the vertex stage evaluates its noise three times over, this runs once.
  float weave = sin(vUv.x * 420.0) * sin(vUv.y * 260.0);
  color = mix(color, uColorGold, clamp(weave * spec1 * 0.4, 0.0, 1.0));

  // Champagne sheen band travelling across the fabric.
  float band = sin((vUv.x + vUv.y) * 5.5 - uTime * 0.55);
  color = mix(color, uColorGold, smoothstep(0.78, 1.0, band) * 0.14);

  // Vignette dissolves the plane edges, biased low so the fabric pools beneath
  // the headline instead of washing across it.
  vec2 p = vUv - vec2(0.56, 0.7);
  p.x *= 0.72;
  float vignette = 1.0 - smoothstep(0.06, 0.38, length(p));

  gl_FragColor = vec4(color, uOpacity * vignette);
  #include <colorspace_fragment>
}
`;

/** Drifting cellular motes — points with a soft radial falloff. */
export const CELL_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform vec2  uPointer;

attribute float aScale;
attribute float aSeed;

varying float vSeed;

${SIMPLEX_3D}

void main() {
  vec3 pos = position;

  // Slow brownian drift, unique per mote via the seed.
  pos.x += snoise(vec3(aSeed, uTime * 0.09, 0.0)) * 0.85;
  pos.y += snoise(vec3(0.0, aSeed, uTime * 0.11)) * 0.85;
  pos.z += snoise(vec3(uTime * 0.07, 0.0, aSeed)) * 0.5;

  // Gentle parallax away from the cursor.
  pos.xy += uPointer * (0.35 + aScale * 0.4);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * (14.0 / -mv.z);

  vSeed = aSeed;
}
`;

export const CELL_FRAGMENT = /* glsl */ `
uniform vec3  uColor;
uniform float uTime;

varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;

  // Soft core with a denser nucleus, pulsing out of phase per mote.
  float core = smoothstep(0.5, 0.0, d);
  float nucleus = smoothstep(0.16, 0.0, d);
  float pulse = 0.65 + 0.35 * sin(uTime * 1.3 + vSeed * 6.28);

  // Alpha-blended rather than additive: on ivory, additive motes are invisible.
  // Darkness at the nucleus is what makes them read.
  vec3 color = uColor * (1.0 - nucleus * 0.35);
  gl_FragColor = vec4(color, core * 0.34 * pulse);
  #include <colorspace_fragment>
}
`;
