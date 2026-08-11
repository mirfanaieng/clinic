"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Product } from "@/lib/data";
import { useInViewport } from "@/lib/useInViewport";


/* ------------------------------------------------------------- geometry */

/**
 * Half-silhouette of the bottle, revolved around Y by LatheGeometry.
 * Kept as plain numbers so the profile is easy to redraw per product form.
 */
function useBottleProfile(form: Product["form"]) {
  return useMemo(() => {
    const wide = form === "sunblock";
    const r = wide ? 0.78 : 0.64;
    const neckR = wide ? 0.3 : 0.26;
    const shoulder = wide ? 0.5 : 0.62;

    const pts: THREE.Vector2[] = [
      new THREE.Vector2(0, -1.05),
      new THREE.Vector2(r * 0.55, -1.05),
      new THREE.Vector2(r * 0.94, -1.02),
      new THREE.Vector2(r, -0.94),
      new THREE.Vector2(r, shoulder),
      new THREE.Vector2(r * 0.96, shoulder + 0.1),
      new THREE.Vector2(r * 0.62, shoulder + 0.26),
      new THREE.Vector2(neckR * 1.15, shoulder + 0.4),
      new THREE.Vector2(neckR, shoulder + 0.5),
      new THREE.Vector2(neckR, shoulder + 0.72),
      new THREE.Vector2(neckR * 1.08, shoulder + 0.76),
      new THREE.Vector2(0, shoulder + 0.76),
    ];
    return pts;
  }, [form]);
}

/* --------------------------------------------------------------- bottle */

function Bottle({ product, dragging }: { product: Product; dragging: boolean }) {
  const group = useRef<THREE.Group>(null);
  const profile = useBottleProfile(product.form);

  // Liquid sits inside the glass, slightly inset and filled to ~55% height.
  const liquidProfile = useMemo(
    () =>
      profile
        .filter((p) => p.y < 0.25)
        .map((p) => new THREE.Vector2(Math.max(p.x * 0.9 - 0.02, 0), p.y + 0.02)),
    [profile],
  );

  useFrame((state) => {
    if (!group.current) return;
    // Idle bob; suspended while the user is driving the rotation.
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.9) * 0.035;
    if (!dragging) group.current.rotation.z = Math.sin(t * 0.55) * 0.028;
  });

  return (
    <group ref={group}>
      {/* Glass shell */}
      <mesh position={[0, 0.1, 0]}>
        <latheGeometry args={[profile, 48]} />
        {/* No `transmission`. Every transmissive material makes three.js render
            the whole scene a second time into a transmission target, per frame
            — with a glass and a liquid mesh across four bottles that was eight
            extra full-scene passes each frame. Alpha plus a hard clearcoat
            gives the same tinted-glass read for the cost of one ordinary pass,
            and the tint that identifies each bottle comes through unchanged. */}
        <meshPhysicalMaterial
          color={product.glass}
          roughness={0.14}
          ior={1.46}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.45}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </mesh>

      {/* Liquid */}
      <mesh position={[0, 0.1, 0]}>
        <latheGeometry args={[liquidProfile, 40]} />
        <meshPhysicalMaterial
          color={product.liquid}
          roughness={0.16}
          ior={1.36}
          metalness={0.05}
          clearcoat={0.8}
          emissive={product.liquid}
          emissiveIntensity={0.42}
          envMapIntensity={1.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Collar + cap */}
      <mesh position={[0, product.form === "sunblock" ? 0.68 : 0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.09, 32]} />
        <meshStandardMaterial color={product.capMetal} metalness={1} roughness={0.24} />
      </mesh>

      <mesh position={[0, product.form === "sunblock" ? 0.92 : 1.04, 0]}>
        <cylinderGeometry args={[0.285, 0.3, 0.44, 32]} />
        <meshStandardMaterial
          color={product.capMetal}
          metalness={1}
          roughness={0.18}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Engraved band on the cap catches the key light */}
      <mesh position={[0, product.form === "sunblock" ? 0.92 : 1.04, 0]}>
        <torusGeometry args={[0.288, 0.012, 8, 32]} />
        <meshStandardMaterial color="#FFF6EE" metalness={0.9} roughness={0.35} />
      </mesh>

      {/* Etched band on the body — a pair of fine gold rings rather than an
          opaque label panel, which read as a black block through the glass. */}
      {[-0.28, -0.44].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[product.form === "sunblock" ? 0.79 : 0.65, 0.006, 6, 36]}
          />
          <meshStandardMaterial
            color={product.capMetal}
            metalness={0.95}
            roughness={0.3}
            emissive={product.capMetal}
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------- interaction */

/**
 * Drag-to-spin with momentum. Rotation is applied to a wrapper group so the
 * bottle's own idle animation stays independent of user input.
 */
function Rig({
  children,
  dragging,
  velocity,
}: {
  children: React.ReactNode;
  dragging: boolean;
  velocity: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;

    if (!dragging) {
      // Friction, then a slow idle turntable once momentum has bled off.
      velocity.current *= 0.94;
      if (Math.abs(velocity.current) < 0.0015) velocity.current = 0.0022;
    }

    group.current.rotation.y += velocity.current * delta * 60;
  });

  return <group ref={group}>{children}</group>;
}

function Studio() {
  return (
    // Built from lightformers rather than an HDR file — nothing to fetch.
    // `frames` defaults to 1, so this bakes a cube map once at mount and is
    // never re-rendered; 128 is plenty for reflections this soft.
    <Environment resolution={128}>
      {/* Broad backdrop. Transmissive glass can only show what is behind it;
          this stands in for the ivory page the bottle is sitting on. */}
      <Lightformer
        form="rect"
        intensity={0.6}
        position={[0, 0, -5]}
        scale={[14, 14, 1]}
        color="#EFE6DC"
      />
      <Lightformer
        form="rect"
        intensity={1.1}
        position={[0, 2.6, -3]}
        scale={[7, 4, 1]}
        color="#FFF6EE"
      />
      <Lightformer
        form="rect"
        intensity={0.8}
        position={[-3.4, 0.6, 1.5]}
        rotation={[0, Math.PI / 2.2, 0]}
        scale={[5, 6, 1]}
        color="#C9A227"
      />
      <Lightformer
        form="rect"
        intensity={0.55}
        position={[3.4, -0.4, 1.8]}
        rotation={[0, -Math.PI / 2.2, 0]}
        scale={[4, 5, 1]}
        color="#A9C2D4"
      />
      <Lightformer
        form="circle"
        intensity={1.2}
        position={[0, -2.6, 1]}
        scale={2.4}
        color="#C9A227"
      />
    </Environment>
  );
}

/* ------------------------------------------------------------------ view */

export default function Product3DViewer({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const velocity = useRef(0.0022);
  const lastX = useRef(0);

  const { ref, active } = useInViewport<HTMLDivElement>("300px");
  // A WebGL context is expensive to hold, not just to draw into. Four of them
  // spinning up during the hero is what made the first scroll stutter, so each
  // one is created the first time its card approaches the viewport and then
  // kept — tearing contexts down on scroll-out would only trade one cost for
  // another.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (active) setMounted(true);
  }, [active]);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    // Scale by width so the gesture feels the same at any card size.
    velocity.current = (dx / e.currentTarget.clientWidth) * 0.5;
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      data-cursor="drag"
      data-cursor-label="Drag to spin"
      className={className}
      style={{ touchAction: "pan-y" }}
    >
      {mounted && (
        <Canvas
          dpr={[1, 1.5]}
          // Parked the moment the card leaves the viewport.
          frameloop={active ? "always" : "never"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.15, 6.1], fov: 30 }}
          style={{ pointerEvents: "none" }}
        >
          <Studio />
          <ambientLight intensity={0.28} />
          <directionalLight position={[3, 5, 3]} intensity={0.75} color="#FFF6EE" />
          <directionalLight position={[-3, 1, -2]} intensity={0.35} color="#C9A227" />

          <Rig dragging={dragging} velocity={velocity}>
            <Bottle product={product} dragging={dragging} />
          </Rig>

          {/* Baked once. The bottle is a near-cylinder turning on its own axis,
              so a live shadow pass every frame redraws an identical blob. */}
          <ContactShadows
            frames={1}
            position={[0, -1.15, 0]}
            opacity={0.45}
            scale={6}
            blur={3.4}
            far={2.4}
            color="#6B4F3A"
          />
        </Canvas>
      )}
    </div>
  );
}
