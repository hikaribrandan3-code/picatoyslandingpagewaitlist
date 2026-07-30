import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/* ============================================================
   PICAYOYO 3D VIEWER

   Renders the real CAD assembly (v23_assembly, exported to GLB
   from build123d) so the internals shown on the page are the
   actual geometry — not an illustrator's guess at it. The
   exploded view is derived from the model's own part positions
   rather than hand-placed, so it cannot drift out of sync with
   the design.

   Desktop only. Hero lazy-loads this so the three.js chunk
   never reaches a phone.
   ============================================================ */

const MODEL_URL = '/picayoyo-assembly.glb';

/** The four FDM-printed parts. Everything else is hardware. */
const PRINTED = /^p0\d/i;
/** Shank, thread and head are one fastener; the nut captures it. */
const FASTENER = /^h02/i;
const NUT = /^h03/i;

/**
 * PETG tints keyed to the COLOR_OPTIONS ids in data.ts, so a
 * visitor's colour vote is reflected in the model they're
 * looking at. Transmission is what sells "translucent print"
 * over "coloured plastic".
 */
const PETG: Record<string, { color: string; transmission: number; emissive?: string }> = {
  clear: { color: '#8ad9d2', transmission: 0.94 },
  blue: { color: '#4b82d8', transmission: 0.82 },
  pink: { color: '#ef7bb0', transmission: 0.82 },
  green: { color: '#8fce62', transmission: 0.84 },
  glow: { color: '#cdf7c2', transmission: 0.7, emissive: '#7de88a' },
};

type PartRig = {
  node: THREE.Object3D;
  home: THREE.Vector3;
  offset: THREE.Vector3;
};

function Yoyo({
  exploded,
  colorId,
  onReady,
}: {
  exploded: boolean;
  colorId: string;
  onReady: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);

  /** Tweened by GSAP, read every frame. Keeps GSAP out of R3F's loop. */
  const progress = useRef({ t: 0 });

  const model = useMemo(() => scene.clone(true), [scene]);

  /**
   * Measure the model, then derive the explode from it.
   *
   * The exporter's vertex frame doesn't match the node
   * translations, so the stack axis is found by looking at
   * where the parts actually sit: the axis their centres spread
   * along IS the yoyo's spin axis. Each part then slides away
   * from the assembly centre in proportion to how far out it
   * already is — which reproduces the CAD's own exploded view
   * without hardcoding a single coordinate.
   */
  const { parts, radius } = useMemo(() => {
    const named = model.children.filter((c) => /^[ph]\d/i.test(c.name));

    const box = new THREE.Box3();
    const centers = new Map<THREE.Object3D, THREE.Vector3>();
    const bounds = new Map<THREE.Object3D, THREE.Box3>();
    for (const node of named) {
      const b = new THREE.Box3().setFromObject(node);
      bounds.set(node, b);
      centers.set(node, b.getCenter(new THREE.Vector3()));
      box.union(b);
    }

    const mid = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Stack axis = the one the part centres are most spread along.
    // Measured, not assumed: the exporter writes the model Y-up while
    // the CAD authored it Z-up, so a hardcoded axis would be wrong.
    const spread = (['x', 'y', 'z'] as const).map((ax) => {
      const vs = [...centers.values()].map((c) => c[ax]);
      return Math.max(...vs) - Math.min(...vs);
    });
    const ai = spread.indexOf(Math.max(...spread));
    const axis = (['x', 'y', 'z'] as const)[ai];
    const unit = new THREE.Vector3(ai === 0 ? 1 : 0, ai === 1 ? 1 : 0, ai === 2 ? 1 : 0);

    // Which end is the grinder? Whichever side the grinder cap is on.
    const gcap = named.find((n) => /grindercap/i.test(n.name));
    const side =
      gcap && centers.get(gcap) ? Math.sign(centers.get(gcap)![axis] - mid[axis]) || 1 : 1;

    // Radius across the stack axis, for framing and clearances.
    const cross = (['x', 'y', 'z'] as const).filter((a) => a !== axis).map((a) => size[a]);
    const rad = Math.max(...cross) / 2;

    /* Work in a signed coordinate `u` where +u always points at the
       grinder end, so the layout below reads the same no matter which
       way round the exporter left the model. */
    const uLo = (n: THREE.Object3D) => {
      const b = bounds.get(n)!;
      return Math.min(side * b.min[axis], side * b.max[axis]);
    };
    const uHi = (n: THREE.Object3D) => {
      const b = bounds.get(n)!;
      return Math.max(side * b.min[axis], side * b.max[axis]);
    };

    const pick = (re: RegExp) => named.find((n) => re.test(n.name));
    const gHalf = pick(/grinderhalf/i);
    const sHalf = pick(/storagehalf/i);
    const sCap = pick(/storagecap/i);
    const nut = pick(/^h03/i);
    const bolt = named.filter((n) => FASTENER.test(n.name)); // thread + shank + head

    /* Lay the parts out in lanes, each derived from where the previous
       one actually ends. Placing the fastener by a fixed multiple of the
       radius put the shank straight through the grinder cap; anchoring
       every lane to the measured extent of the part before it means
       nothing can end up skewered, whatever the dimensions change to. */
    const GAP = rad * 0.26; // ~8mm on a 31mm radius
    const u = new Map<THREE.Object3D, number>();

    // Both halves fan out proportionally, staying symmetric about the bearing.
    const fan = (n: THREE.Object3D) => (centers.get(n)![axis] - mid[axis]) * 2.15 * side;
    if (gHalf) u.set(gHalf, fan(gHalf));
    if (sHalf) u.set(sHalf, fan(sHalf));

    // Grinder end: the bolt lifts into the gap it really occupies, then
    // the cap clears the bolt.
    let front = gHalf ? uHi(gHalf) + u.get(gHalf)! + GAP : rad;
    if (bolt.length) {
      const bLo = Math.min(...bolt.map(uLo));
      const bHi = Math.max(...bolt.map(uHi));
      const off = front - bLo;
      for (const n of bolt) u.set(n, off);
      front = bHi + off + GAP;
    }
    if (gcap) u.set(gcap, front - uLo(gcap));

    // Storage end: the nut backs off the thread, then the cap clears it.
    let back = sHalf ? uLo(sHalf) + u.get(sHalf)! - GAP : -rad;
    if (nut) {
      u.set(nut, back - uHi(nut));
      back = uLo(nut) + u.get(nut)! - GAP;
    }
    if (sCap) u.set(sCap, back - uHi(sCap));

    const rig: PartRig[] = named.map((node) => ({
      node,
      home: node.position.clone(),
      // Bearing has no entry and stays put — it is the anchor.
      offset: unit.clone().multiplyScalar((u.get(node) ?? 0) * side),
    }));

    // Re-centre the model on the origin so it orbits about itself.
    model.position.sub(mid);

    return { parts: rig, radius: rad };
  }, [model]);

  /**
   * Swap the flat CAD colours for real product materials.
   *
   * OpenCASCADE tessellates this assembly into 611 meshes. Giving each
   * one its own material would mean ~590 separate transmissive
   * materials, and transmission costs a render pass per material — so
   * exactly three are built here and shared by reference.
   */
  useEffect(() => {
    const tint = PETG[colorId] ?? PETG.clear;

    const petg = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tint.color),
      transmission: tint.transmission,
      thickness: 7,
      ior: 1.57, // PETG
      roughness: 0.14,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.25,
      emissive: tint.emissive ? new THREE.Color(tint.emissive) : new THREE.Color('#000000'),
      emissiveIntensity: tint.emissive ? 0.35 : 0,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const chrome = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#eef2f6'),
      metalness: 1,
      roughness: 0.16,
      envMapIntensity: 1.6,
    });

    // Shoulder screw, thread, head, hex nut — darker steel so the
    // hardware reads as distinct from the bearing race.
    const steel = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#9aa3ad'),
      metalness: 1,
      roughness: 0.38,
      envMapIntensity: 1.15,
    });

    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;

      // Walk up to the part this mesh belongs to — meshes are nested
      // under the named part nodes.
      let owner: THREE.Object3D | null = mesh;
      while (owner && !/^[ph]\d/i.test(owner.name)) owner = owner.parent;
      const name = owner?.name ?? '';

      mesh.material = PRINTED.test(name) ? petg : /bearing/i.test(name) ? chrome : steel;
      mesh.castShadow = true;
    });

    return () => {
      petg.dispose();
      chrome.dispose();
      steel.dispose();
    };
  }, [model, colorId]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  /** Explode / reassemble, plus the camera-ish turn that goes with it. */
  useEffect(() => {
    const tween = gsap.to(progress.current, {
      t: exploded ? 1 : 0,
      duration: exploded ? 1.15 : 0.95,
      ease: exploded ? 'power3.inOut' : 'power2.inOut',
      overwrite: true,
    });
    return () => {
      tween.kill();
    };
  }, [exploded]);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const t = progress.current.t;

    for (const p of parts) {
      p.node.position.copy(p.home).add(tmp.copy(p.offset).multiplyScalar(t));
    }

    if (!group.current) return;

    // Assembled: face-on and slowly turning, like the product shot.
    // Exploded: swung toward side-on so the stack reads across the
    // frame, and pulled back to fit the longer silhouette.
    const g = group.current;
    if (t < 0.999) g.rotation.y += dt * 0.34 * (1 - t);

    const target = THREE.MathUtils.lerp(1, 0.62, t);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 6, dt));
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, THREE.MathUtils.lerp(-0.18, -0.42, t), 6, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, THREE.MathUtils.lerp(0, 1.12, t), 6, dt);
  });

  // Normalise to ~1 unit radius so the camera framing is stable
  // regardless of the millimetre values coming out of CAD.
  const fit = 1 / radius;

  return (
    <group ref={group} scale={1}>
      <primitive object={model} scale={fit} />
    </group>
  );
}

function Stage({
  exploded,
  colorId,
  onReady,
}: {
  exploded: boolean;
  colorId: string;
  onReady: () => void;
}) {
  return (
    <>
      {/* Three-point studio light. Key top-left, fill right, rim
          behind — the arrangement that gives printed plastic its
          edge highlights instead of a flat wash. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[-4, 5, 4]} intensity={2.4} castShadow />
      <directionalLight position={[5, 1.5, 2.5]} intensity={1.1} />
      <directionalLight position={[0, -2, -5]} intensity={0.9} />

      {/* Softbox rig built in-scene rather than `preset="studio"`,
          which streams an HDR off a third-party CDN — a hard
          dependency (and a Suspense stall) we don't want in a
          landing page hero. Transmission and the chrome bearing
          both need a real environment to reflect, and these
          emissive planes are that environment. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#ffffff']} />
        {/* Large key softbox, upper left */}
        <Lightformer form="rect" intensity={5} position={[-3, 3, 2]} scale={[7, 5, 1]} target={[0, 0, 0]} />
        {/* Fill, right */}
        <Lightformer form="rect" intensity={2.2} position={[4, 0.5, 2]} scale={[5, 5, 1]} target={[0, 0, 0]} />
        {/* Rim from behind, separates the silhouette from white */}
        <Lightformer form="rect" intensity={3} position={[0, 1, -4]} scale={[6, 4, 1]} target={[0, 0, 0]} />
        {/* Bounce off the "table" */}
        <Lightformer form="rect" intensity={1.4} position={[0, -3, 1]} scale={[6, 3, 1]} target={[0, 0, 0]} />
        {/* Two thin strips — these are what read as the long
            specular highlights sliding across the caps as it turns. */}
        <Lightformer form="rect" intensity={6} position={[-1.5, 2.5, -1]} scale={[0.4, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={4} position={[2, -1.5, -1]} scale={[0.3, 3, 1]} target={[0, 0, 0]} />
      </Environment>

      <Suspense fallback={null}>
        <Yoyo exploded={exploded} colorId={colorId} onReady={onReady} />
      </Suspense>

      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.32}
        scale={9}
        blur={2.6}
        far={4}
        color="#8a7a63"
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2.6}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.84}
      />
    </>
  );
}

export default function YoyoViewer3D({ colorId = 'clear' }: { colorId?: string }) {
  const [exploded, setExploded] = useState(false);
  const [ready, setReady] = useState(false);
  const handleReady = React.useCallback(() => setReady(true), []);

  return (
    <div className="relative w-full">
      <div className="clay-well clay-cream relative overflow-hidden" style={{ background: '#ffffff' }}>
        <div className="h-[290px] w-full">
          <Canvas
            dpr={[1, 1.75]}
            shadows
            camera={{ position: [0, 0.9, 4.2], fov: 34 }}
            gl={{ antialias: true, preserveDrawingBuffer: false }}
            style={{ background: '#ffffff' }}
          >
            <Stage exploded={exploded} colorId={colorId} onReady={handleReady} />
          </Canvas>
        </div>

        {/* Loading veil. Sits over the canvas so there's no flash of
            empty white while the 875KB model streams in. */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E3CDB0] border-t-[#FF6B6B]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#6D6D6D]">
                Loading CAD model
              </span>
            </div>
          </div>
        )}

        {/* Drag hint — the model turns on its own, so people don't
            always realise they can grab it. */}
        {ready && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="rounded-full bg-[#2D2D2D]/70 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white whitespace-nowrap">
              Drag to rotate · scroll to zoom
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => setExploded((v) => !v)}
        className="clay clay-btn clay-sm clay-yellow mt-3.5 w-full px-4 py-3 text-xs font-black uppercase tracking-wider"
      >
        {exploded ? 'Reassemble' : 'Show me what’s inside'}
      </button>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
