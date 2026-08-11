"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useInViewport } from "@/lib/useInViewport";
import {
  CELL_FRAGMENT,
  CELL_VERTEX,
  SILK_FRAGMENT,
  SILK_VERTEX,
} from "@/components/canvas/shaders";

const SHADOW = new THREE.Color("#C8AFA4"); // warm taupe — the fabric's troughs
const GOLD = new THREE.Color("#C9A227");
const BASE = new THREE.Color("#F6E9E3"); // blush satin

/* -------------------------------------------------------------- silk mesh */

function SilkSurface() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uAmplitude: { value: 0.42 },
      uColorShadow: { value: SHADOW },
      uColorGold: { value: GOLD },
      uColorBase: { value: BASE },
      uOpacity: { value: 0.92 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;

    u.uTime.value += delta;

    // Ease the pointer uniform so fast flicks don't snap the ripple.
    const target = state.pointer;
    u.uPointer.value.lerp(target, 0.06);

    // Ripple only while the pointer is actually inside the viewport.
    const inside = Math.abs(target.x) < 0.999 && Math.abs(target.y) < 0.999;
    u.uPointerStrength.value = THREE.MathUtils.lerp(
      u.uPointerStrength.value,
      inside ? 1 : 0,
      0.04,
    );

    if (mesh.current) {
      // Slow counter-rotation gives the fabric a breathing tilt.
      mesh.current.rotation.z = Math.sin(u.uTime.value * 0.08) * 0.06;
      mesh.current.rotation.x = -0.42 + Math.sin(u.uTime.value * 0.11) * 0.035;
    }
  });

  return (
    <mesh ref={mesh} position={[0, -0.35, 0]} rotation={[-0.42, 0, 0]}>
      {/* 64x40 rather than 110x72. The vertex stage evaluates two simplex
          octaves three times over per vertex for the normals, so segment count
          is the single most expensive number in this scene — and at this
          amplitude the extra tessellation was not visible. */}
      <planeGeometry args={[13, 8, 64, 40]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={SILK_VERTEX}
        fragmentShader={SILK_FRAGMENT}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ---------------------------------------------------------- cellular field */

function CellularField({ count = 150 }: { count?: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const { positions, scales, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Biased toward the centre so the edges stay clean.
      const r = Math.pow(Math.random(), 0.65) * 6.5;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 2] = Math.sin(theta) * r * 0.35 - 1.2;
      scales[i] = 0.35 + Math.random() * 1.5;
      seeds[i] = Math.random() * 10;
    }
    return { positions, scales, seeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 12 },
      uColor: { value: GOLD },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uPointer.value.lerp(state.pointer, 0.03);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={CELL_VERTEX}
        fragmentShader={CELL_FRAGMENT}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------- gold nucleus */

/** A single slow-turning torus knot reading as a "molecule" behind the silk. */
function Nucleus() {
  const ref = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.07;
    ref.current.rotation.y += delta * 0.11;
    // Drift around the resting anchor rather than toward the origin.
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      2.15 + state.pointer.x * 0.5,
      0.02,
    );
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      -0.15 + state.pointer.y * 0.35,
      0.02,
    );
  });

  // Hide on very narrow viewports where it crowds the headline.
  if (viewport.width < 5) return null;

  return (
    <mesh ref={ref} position={[2.15, -0.15, -3.4]} scale={0.78}>
      <torusKnotGeometry args={[1.05, 0.055, 64, 6, 2, 3]} />
      <meshBasicMaterial
        color={GOLD}
        transparent
        opacity={0.42}
        wireframe
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------- scene */

function Scene() {
  return (
    <>
      <color attach="background" args={["#FBF8F4"]} />
      <fog attach="fog" args={["#FBF8F4", 6, 18]} />
      <ambientLight intensity={0.4} />
      <Nucleus />
      <SilkSurface />
      <CellularField />
    </>
  );
}

export default function HeroCanvas({ className }: { className?: string }) {
  const { ref, active } = useInViewport<HTMLDivElement>("120px");
  // Starts at 1 and is allowed up to 1.5 only once the scene proves it can
  // hold framerate — the reverse of shipping a retina buffer and hoping.
  const [dpr, setDpr] = useState(1);

  return (
    <div ref={ref} className={className}>
      <Canvas
        className="!absolute inset-0"
        dpr={dpr}
        // Parked entirely while the hero is off screen. Nothing below the fold
        // needs this scene to keep drawing.
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0.35, 6.4], fov: 42, near: 0.1, far: 24 }}
        // The canvas is decorative; pointer events belong to the UI above it.
        style={{ pointerEvents: "none" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(1.5, window.devicePixelRatio))}
          onDecline={() => setDpr(1)}
        />
        <Scene />
      </Canvas>
    </div>
  );
}
