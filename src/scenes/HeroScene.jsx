import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const VOLT = "#f2e313";

/* ---------- Géométries procédurales (aucun fichier 3D téléchargé) ---------- */
const EXTRUDE = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 3, curveSegments: 40 };

function shapeFromPoints(pts) {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

function buildPieces() {
  const stem = shapeFromPoints([[0.18, 1.603], [0.7, 1.603], [0.7, -0.64], [0.18, -0.64]]);
  const flag = shapeFromPoints([[-0.833, 1.114], [0.18, 1.603], [0.18, 1.026], [-0.607, 0.646]]);
  const hook = new THREE.Shape();
  hook.absarc(-0.32, -0.64, 1.02, 0, -Math.PI, true);
  hook.absarc(-0.32, -0.64, 0.5, -Math.PI, 0, false);
  const cap = shapeFromPoints([[-1.34, -0.64], [-0.82, -0.64], [-0.82, -0.32], [-1.34, -0.32]]);
  const make = (shape) => {
    const g = new THREE.ExtrudeGeometry(shape, EXTRUDE);
    g.translate(-0.03, 0, -0.25);
    return g;
  };
  return [
    { key: "stem", geo: make(stem), from: [0, 3.2, 0], rot: [0, 0, 0.4] },
    { key: "flag", geo: make(flag), from: [-3.2, 1.2, 0.6], rot: [0, -0.8, 0.6] },
    { key: "hook", geo: make(hook), from: [0, -3.4, 0.5], rot: [0.9, 0, -0.6] },
    { key: "cap", geo: make(cap), from: [-2.6, -2.2, 0], rot: [0, 0, 1.2] },
  ];
}

// Texture "métal brossé" générée en code : stries horizontales dans le canal de rugosité.
function makeBrushedTexture() {
  const w = 512, h = 512;
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const row = 120 + Math.random() * 70;
    for (let x = 0; x < w; x++) {
      const v = Math.min(255, row + (Math.random() - 0.5) * 26);
      const i = (y * w + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.5, 1.5);
  t.needsUpdate = true;
  return t;
}

const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

/* ---------- Monogramme 3D ---------- */
function Monogram3D({ reduced, interactive }) {
  const group = useRef();
  const parts = useRef([]);
  const cube = useRef();
  const start = useRef(null);
  const pieces = useMemo(buildPieces, []);
  const brushed = useMemo(makeBrushedTexture, []);
  const metal = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#e4e1d6", metalness: 1, roughness: 0.55, roughnessMap: brushed, envMapIntensity: 1.6 }),
    [brushed]
  );
  const volt = useMemo(() => new THREE.MeshStandardMaterial({ color: VOLT, emissive: VOLT, emissiveIntensity: 0.55, metalness: 0.2, roughness: 0.35 }), []);
  const cubeGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.5), []);

  useEffect(
    () => () => {
      pieces.forEach((p) => p.geo.dispose());
      cubeGeo.dispose();
      metal.dispose();
      volt.dispose();
      brushed.dispose();
    },
    [pieces, cubeGeo, metal, volt, brushed]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (start.current === null) start.current = t + 0.25;
    const el = t - start.current;
    pieces.forEach((p, i) => {
      const m = parts.current[i];
      if (!m) return;
      const k = reduced ? 1 : easeOutExpo(Math.max(0, Math.min(1, (el - i * 0.12) / 1.4)));
      m.position.set(p.from[0] * (1 - k), p.from[1] * (1 - k), p.from[2] * (1 - k));
      m.rotation.set(p.rot[0] * (1 - k), p.rot[1] * (1 - k), p.rot[2] * (1 - k));
    });
    if (cube.current) {
      const k = reduced ? 1 : easeOutExpo(Math.max(0, Math.min(1, (el - 0.7) / 1.2)));
      cube.current.position.set(1.11, 1.42 + 2.5 * (1 - k), 0);
      cube.current.rotation.set(0, (1 - k) * 3 + (reduced ? 0 : Math.sin(t * 0.8) * 0.12), 0);
      cube.current.scale.setScalar(0.2 + 0.8 * k);
    }
    if (!group.current) return;
    const idle = reduced ? 0 : Math.sin(t * 0.35) * 0.18;
    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;
    const g = group.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.32 + idle + px * 0.45, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.08 - py * 0.25, 3, delta);
    g.position.y = reduced ? 0 : Math.sin(t * 0.6) * 0.06;
  });

  return (
    <group ref={group}>
      {pieces.map((p, i) => (
        <mesh key={p.key} ref={(m) => (parts.current[i] = m)} geometry={p.geo} material={metal} castShadow={false} />
      ))}
      <mesh ref={cube} geometry={cubeGeo} material={volt} />
    </group>
  );
}

/* ---------- Modules flottants : "briques" de produit ---------- */
function Modules({ count, reduced }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return { a, r: 2.5 + (i % 3) * 0.45, y: ((i * 37) % 7) / 7 - 0.5, s: 0.08 + ((i * 13) % 5) * 0.035, sp: 0.06 + (i % 4) * 0.02 };
      }),
    [count]
  );
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#181913", roughness: 0.75, metalness: 0.3 }), []);
  useEffect(() => () => (geo.dispose(), mat.dispose()), [geo, mat]);
  useFrame((state) => {
    const t = reduced ? 0 : state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      const a = s.a + t * s.sp;
      dummy.position.set(Math.cos(a) * s.r, s.y * 2.6 + Math.sin(t * 0.5 + i) * 0.08, Math.sin(a) * s.r * 0.55 - 0.6);
      dummy.rotation.set(t * 0.3 + i, t * 0.2 + i * 0.5, 0);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, count]} />;
}

function Ring({ reduced }) {
  const ref = useRef();
  useFrame((_, d) => {
    if (!reduced && ref.current) ref.current.rotation.z += d * 0.05;
  });
  return (
    <group rotation={[1.18, 0.18, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[2.35, 0.012, 8, 160]} />
        <meshBasicMaterial color={VOLT} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, 0.6]}>
        <torusGeometry args={[2.85, 0.006, 6, 160]} />
        <meshBasicMaterial color="#5a5a50" />
      </mesh>
    </group>
  );
}

function Particles({ count, reduced }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, [count]);
  useFrame((_, d) => {
    if (!reduced && ref.current) ref.current.rotation.y += d * 0.012;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#eeebe1" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function GlassPanel() {
  return (
    <mesh position={[0.35, 0.15, -1.1]} rotation={[0, -0.25, 0]}>
      <boxGeometry args={[2.6, 3.6, 0.06]} />
      <meshPhysicalMaterial color="#d9d6cc" roughness={0.38} transmission={1} thickness={0.4} ior={1.3} metalness={0} transparent />
    </mesh>
  );
}

/* Positionne la composition selon le format : à droite sur ordinateur, en haut sur mobile. */
function Layout({ children }) {
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.05;
  const scale = wide ? Math.min(0.85, viewport.height / 7) : Math.min(0.7, viewport.width / 6);
  const pos = wide ? [viewport.width * 0.27, 0.1, 0] : [0, viewport.height * 0.23, 0];
  return (
    <group position={pos} scale={scale}>
      {children}
    </group>
  );
}

export default function HeroScene({ quality = "high", reduced = false, interactive = true, active = true, onReady }) {
  const high = quality === "high";
  return (
    <Canvas
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: high, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0, 7.2], fov: 35 }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        onReady && requestAnimationFrame(() => onReady());
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 5, 4]} intensity={1.6} color="#fff6e0" />
      <pointLight position={[3, -1, -2]} intensity={6} distance={9} color={VOLT} />
      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={4} color="#f4f1e8" position={[-5, 3, 3]} scale={[8, 2, 1]} rotation={[0, Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={2.5} color="#f4f1e8" position={[4, 1, 4]} scale={[5, 7, 1]} rotation={[0, -Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={3} color={VOLT} position={[0, -4, -3]} scale={[10, 0.5, 1]} rotation={[Math.PI / 2.4, 0, 0]} />
        <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 0, 6]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, 5, -4]} scale={2} />
      </Environment>
      <Layout>
        <Monogram3D reduced={reduced} interactive={interactive} />
        <Ring reduced={reduced} />
        <Modules count={high ? 14 : 7} reduced={reduced} />
        {high && <GlassPanel />}
        <ContactShadows position={[0, -2.2, 0]} opacity={0.55} scale={7} blur={2.6} far={3.5} frames={reduced ? 1 : 150} resolution={high ? 512 : 256} />
      </Layout>
      <Particles count={high ? 520 : 160} reduced={reduced} />
    </Canvas>
  );
}
