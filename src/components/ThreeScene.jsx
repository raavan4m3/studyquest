import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars, Environment } from '@react-three/drei';
import { useGame } from '../store/GameContext';
import * as THREE from 'three';

// ─── Shared Helpers ──────────────────────────────────────────────

function FloatingCoins({ count = 10 }) {
  const ref = useRef();
  const coins = useMemo(() => Array.from({ length: count }, () => ({
    position: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5 + 2, (Math.random() - 0.5) * 4 - 2],
    rot: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5,
  })), [count]);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.1; });
  return (
    <group ref={ref}>
      {coins.map((c, i) => (
        <Float key={i} speed={c.speed} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={c.position} rotation={[Math.PI / 2, 0, c.rot]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
            <meshStandardMaterial color="#fdcb6e" metalness={0.8} roughness={0.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// ─── DARK THEME ───────────────────────────────────────────────────

function DarkEnvironment() {
  const bookRef = useRef();
  const glowRef = useRef();
  const pagesRef = useRef([]);
  const pageCount = 20;

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (bookRef.current) {
      bookRef.current.rotation.y = Math.sin(t * 0.15) * 0.3;
      bookRef.current.rotation.x = Math.sin(t * 0.1) * 0.05 + 0.1;
      bookRef.current.position.y = Math.sin(t * 0.3) * 0.08;
    }
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
    pagesRef.current.forEach((m, i) => {
      if (m) {
        const p = (i / (pageCount - 1)) - 0.5;
        m.position.z = p * 0.07;
        m.rotation.y = p * 0.06 + Math.sin(t * 0.3 + i * 0.1) * 0.005;
      }
    });
  });

  return (
    <group ref={bookRef}>
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
        <group>
          <mesh ref={glowRef} position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 1.6]} /><meshBasicMaterial color="#6c5ce7" transparent opacity={0.12} />
          </mesh>
          <mesh position={[0, -0.22, 0]}><boxGeometry args={[1.4, 0.06, 1.0]} /><meshStandardMaterial color="#2d1b69" metalness={0.6} roughness={0.4} /></mesh>
          <mesh position={[-0.7, 0, 0]}><boxGeometry args={[0.06, 0.45, 1.0]} /><meshStandardMaterial color="#1a0f3a" metalness={0.5} roughness={0.5} /></mesh>
          {Array.from({ length: pageCount }).map((_, i) => (
            <mesh key={i} ref={el => pagesRef.current[i] = el} position={[0.05, 0, ((i / (pageCount - 1)) - 0.5) * 0.07]} rotation={[0, ((i / (pageCount - 1)) - 0.5) * 0.06, 0]}>
              <boxGeometry args={[1.3, 0.005, 0.95]} /><meshStandardMaterial color={new THREE.Color().setHSL(0.08, 0.1, 0.92 + Math.random() * 0.05)} roughness={0.6} metalness={0.05} transparent opacity={0.85} />
            </mesh>
          ))}
          <mesh position={[0.05, 0.22, 0]}><boxGeometry args={[1.4, 0.06, 1.0]} /><meshStandardMaterial color="#3d1f8a" metalness={0.5} roughness={0.3} /></mesh>
          <mesh position={[0.05, 0.25, 0]}><boxGeometry args={[1.3, 0.01, 0.9]} /><meshStandardMaterial color="#d4a843" metalness={0.9} roughness={0.2} /></mesh>
          <mesh position={[0.05, 0.25, 0]}><boxGeometry args={[0.3, 0.015, 0.3]} /><meshStandardMaterial color="#f0d080" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[0.3, -0.35, 0]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.04, 0.25, 0.01]} /><meshStandardMaterial color="#e17055" metalness={0.1} roughness={0.6} /></mesh>
        </group>
      </Float>
    </group>
  );
}

function DarkDecor() {
  return (
    <>
      <Sparkles count={80} scale={[12, 6, 12]} size={0.025} speed={0.4} color="#a29bfe" />
      <Stars count={200} depth={20} factor={3} saturation={0} fade speed={0.5} />
      <FloatingCoins />
    </>
  );
}

// ─── LIGHT THEME ──────────────────────────────────────────────────

function LightEnvironment() {
  const cloudRef = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (cloudRef.current) cloudRef.current.rotation.y = t * 0.02;
  });
  return (
    <group ref={cloudRef}>
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.2}>
        {[[-1.2, 0.6, -0.5], [0, 0.8, -0.3], [1.2, 0.5, -0.7], [-0.6, 0.3, 0.8], [0.8, 0.4, 0.6]].map((p, i) => (
          <group key={i} position={p}>
            <mesh position={[0, 0, 0]}><sphereGeometry args={[0.5 + Math.random() * 0.3, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.25} roughness={0.3} metalness={0.1} /></mesh>
            <mesh position={[0.4, -0.1, 0.1]}><sphereGeometry args={[0.35 + Math.random() * 0.2, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.3} metalness={0.1} /></mesh>
            <mesh position={[-0.3, 0.1, 0.2]}><sphereGeometry args={[0.3 + Math.random() * 0.2, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.3} metalness={0.1} /></mesh>
          </group>
        ))}
      </Float>
      {/* Light rays */}
      <mesh rotation={[0, 0, 0]} position={[0, 2, -2]}>
        <planeGeometry args={[3, 4]} /><meshBasicMaterial color="#fff8e7" transparent opacity={0.04} />
      </mesh>
      <mesh rotation={[0.1, 0.3, 0]} position={[1, 1.5, -1.5]}>
        <planeGeometry args={[2, 3]} /><meshBasicMaterial color="#fff8e7" transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

function LightDecor() {
  return (
    <>
      <Sparkles count={40} scale={[10, 5, 10]} size={0.03} speed={0.2} color="#ffeaa7" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[20, 20]} /><meshStandardMaterial color="#f5f0e8" opacity={0.3} transparent />
      </mesh>
      <FloatingCoins />
    </>
  );
}

// ─── CHERRY BLOSSOM — indoor minimalist luxury interior

function IndoorPetal({ index }) {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime * 0.2 + index * 0.6;
      ref.current.position.x += Math.sin(t * 0.3 + index) * 0.0012;
      ref.current.position.y -= 0.0018;
      ref.current.position.z += Math.cos(t * 0.2 + index * 0.5) * 0.001;
      ref.current.rotation.x += 0.004;
      ref.current.rotation.z += 0.006;
      if (ref.current.position.y < -0.3) {
        ref.current.position.y = 1.8;
        ref.current.position.x = (index % 8 - 4) * 0.3 + (Math.random() - 0.5) * 0.15;
        ref.current.position.z = (Math.random() - 0.5) * 1.8;
      }
    }
  });
  return (
    <mesh
      ref={ref}
      position={[(index % 8 - 4) * 0.3, Math.random() * 2 + 0.3, (Math.random() - 0.5) * 1.8]}
      rotation={[Math.random() * 6, Math.random() * 6, Math.random() * 6]}
    >
      <planeGeometry args={[0.035, 0.022]} />
      <meshBasicMaterial color={['#f8bbd0', '#fce4ec', '#f48fb1', '#ffcdd2', '#f0d0d8', '#e8c0c8'][index % 6]} transparent opacity={0.7} />
    </mesh>
  );
}

function TwistedTrunk({ offset, rotY, scaleY }) {
  const segments = 4;
  const heights = [0.15, 0.4, 0.7, 0.95];
  const offsets = [[0, 0], [0.03, 0.04], [-0.02, 0.06], [0.04, 0.03]];
  return (
    <group position={offset} rotation={[0, rotY, 0]}>
      {Array.from({ length: segments }, (_, i) => (
        <mesh
          key={i}
          position={[offsets[i][0], heights[i] * scaleY, offsets[i][1]]}
          rotation={[Math.sin(i * 0.5) * 0.06, 0, Math.cos(i * 0.7) * 0.05]}
        >
          <cylinderGeometry args={[0.035 - i * 0.006, 0.05 - i * 0.004, 0.3 * scaleY, 6]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function CanopyCluster({ cx, cy, cz, scale: sc }) {
  const colors = ['#fce4ec', '#f8bbd0', '#f48fb1', '#ffcdd2', '#f0d0d8'];
  const positions = [];
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.2 + Math.random() * 0.25;
    positions.push({
      x: Math.cos(angle) * radius * sc,
      y: (Math.random() - 0.5) * 0.25 * sc,
      z: Math.sin(angle) * radius * sc,
      r: (0.08 + Math.random() * 0.12) * sc,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return (
    <group position={[cx, cy, cz]}>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.r, 7, 7]} />
          <meshStandardMaterial color={p.color} roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function CherryBlossomTree() {
  const treeRef = useRef();
  useFrame((s) => {
    if (treeRef.current) treeRef.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.12) * 0.005;
  });
  const canopyPositions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.2 + Math.random() * 0.55;
      pos.push({
        cx: Math.cos(angle) * radius,
        cy: 0.8 + Math.random() * 0.5,
        cz: Math.sin(angle) * radius * 0.7,
        scale: 0.6 + Math.random() * 0.5,
      });
    }
    return pos;
  }, []);

  return (
    <group ref={treeRef} position={[0, -0.2, 0]}>
      {/* Multiple twisting trunks */}
      <TwistedTrunk offset={[-0.04, 0, 0.03]} rotY={0} scaleY={1} />
      <TwistedTrunk offset={[0.05, 0, -0.02]} rotY={0.3} scaleY={0.9} />
      <TwistedTrunk offset={[-0.02, 0, -0.05]} rotY={-0.2} scaleY={0.85} />
      <TwistedTrunk offset={[0, 0, 0.04]} rotY={0.5} scaleY={0.7} />
      {/* Broad bushy canopy */}
      {canopyPositions.map((p, i) => (
        <CanopyCluster key={i} cx={p.cx} cy={p.cy} cz={p.cz} scale={p.scale} />
      ))}
    </group>
  );
}

function Planter() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Outer planter */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial color="#faf8f5" roughness={0.2} metalness={0.05} />
      </mesh>
      {/* Inner rim */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.85, 0.02, 0.85]} />
        <meshStandardMaterial color="#f0ece8" roughness={0.2} metalness={0.05} />
      </mesh>
      {/* White pebbles */}
      {Array.from({ length: 40 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 0.7,
            0.08 + Math.random() * 0.04,
            (Math.random() - 0.5) * 0.7,
          ]}
          rotation={[Math.random(), Math.random(), Math.random()]}
        >
          <sphereGeometry args={[0.02 + Math.random() * 0.03, 5, 5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function ModernChair() {
  return (
    <group position={[1.6, -0.5, 0.4]} rotation={[0, -0.2, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#f0ece8" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.35]} />
        <meshStandardMaterial color="#f8f4f0" roughness={0.5} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.5, -0.18]}>
        <boxGeometry args={[0.35, 0.45, 0.03]} />
        <meshStandardMaterial color="#f0ece8" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Legs */}
      {[[-0.16, 0, -0.16], [0.16, 0, -0.16], [-0.16, 0, 0.16], [0.16, 0, 0.16]].map((p, i) => (
        <mesh key={i} position={[p[0], -0.08, p[2]]}>
          <cylinderGeometry args={[0.015, 0.02, 0.12, 6]} />
          <meshStandardMaterial color="#e0dcd8" metalness={0.2} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function SideTable() {
  return (
    <group position={[1.8, -0.5, -0.8]} rotation={[0, 0.3, 0]}>
      {/* Top */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.03, 16]} />
        <meshStandardMaterial color="#ece8e4" roughness={0.2} metalness={0.05} />
      </mesh>
      {/* Leg */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.2, 6]} />
        <meshStandardMaterial color="#e0dcd8" metalness={0.2} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.02, 12]} />
        <meshStandardMaterial color="#e0dcd8" metalness={0.2} roughness={0.3} />
      </mesh>
      {/* Vase on table */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#d8d0c8" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

function CherryBlossomEnvironment() {
  return (
    <group>
      {/* Back wall - light warm gray */}
      <mesh position={[0, 0.8, -2]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#f0ece8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.8, -2]}>
        <planeGeometry args={[8, 1.2]} />
        <meshStandardMaterial color="#e8e4e0" roughness={0.7} />
      </mesh>
      {/* Floor - light warm beige */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0.5]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.5} />
      </mesh>
      {/* Floor subtle grain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0.5]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#eeeae5" transparent opacity={0.15} wireframe roughness={0.5} />
      </mesh>
      {/* Planter */}
      <Planter />
      {/* Tree */}
      <CherryBlossomTree />
      {/* Modern chair */}
      <ModernChair />
      {/* Side table */}
      <SideTable />
      {/* Floating petals — 40 continuous */}
      {Array.from({ length: 40 }, (_, i) => <IndoorPetal key={i} index={i} />)}
      {/* Warm window light */}
      <mesh position={[1.5, 1.2, -1.5]} rotation={[0.1, 0.4, 0]}>
        <planeGeometry args={[0.6, 1.5]} />
        <meshBasicMaterial color="#fffdf5" transparent opacity={0.07} />
      </mesh>
      <mesh position={[-0.3, 1.5, -1.8]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#fce4ec" transparent opacity={0.04} />
      </mesh>
      {/* Very light ambient glow */}
      <mesh position={[0, 0.8, -1.9]}>
        <planeGeometry args={[5, 3]} />
        <meshBasicMaterial color="#faf6f0" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function CherryBlossomDecor() {
  return (
    <>
      <Sparkles count={25} scale={[5, 3, 4]} size={0.018} speed={0.15} color="#fce4ec" />
      {/* Ambient light particles */}
      {Array.from({ length: 8 }, (_, i) => (
        <Float key={i} speed={0.3 + Math.random() * 0.2} rotationIntensity={0} floatIntensity={0.15}>
          <mesh position={[(Math.random() - 0.5) * 3, Math.random() * 1.5 + 0.2, (Math.random() - 0.5) * 2 - 0.5]}>
            <sphereGeometry args={[0.006, 4, 4]} />
            <meshBasicMaterial color="#f0d0d8" transparent opacity={0.2} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// ─── OCEAN THEME ──────────────────────────────────────────────────

function OceanEnvironment() {
  const waterRef = useRef();
  const fishRef = useRef([]);
  const fishData = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2, radius: 1 + Math.random(), speed: 0.3 + Math.random() * 0.2, yOff: Math.random() * 0.5,
  })), []);
  const lightRef = useRef();

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (waterRef.current) {
      const pos = waterRef.current.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        pos.setZ(i, Math.sin(x * 2 + t * 0.8) * 0.04 + Math.cos(z * 1.5 + t * 0.5) * 0.03);
      }
      pos.needsUpdate = true;
    }
    if (lightRef.current) lightRef.current.position.y = 1 + Math.sin(t * 0.3) * 0.3;
    fishRef.current.forEach((m, i) => {
      if (m) {
        const d = fishData[i];
        const angle = d.angle + t * d.speed;
        m.position.x = Math.cos(angle) * d.radius;
        m.position.z = Math.sin(angle * 0.7) * d.radius * 0.6;
        m.position.y = Math.sin(angle * 1.3 + d.yOff) * 0.3 + d.yOff;
        m.rotation.y = -angle + Math.PI / 2;
        m.rotation.z = Math.sin(angle * 1.5) * 0.1;
      }
    });
  });

  return (
    <group>
      {/* Underwater fog */}
      <mesh position={[0, -0.5, -2]}><planeGeometry args={[10, 4]} /><meshBasicMaterial color="#0a4a6a" transparent opacity={0.2} /></mesh>
      {/* Water surface */}
      <mesh ref={waterRef} rotation={[-0.2, 0, 0]} position={[0, 0.3, 0]}>
        <planeGeometry args={[5, 4, 40, 40]} /><meshStandardMaterial color="#1a8aaa" transparent opacity={0.4} roughness={0.1} metalness={0.3} wireframe />
      </mesh>
      {/* Caustic light */}
      <mesh ref={lightRef} position={[0, 1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} /><meshBasicMaterial color="#4fc3f7" />
      </mesh>
      {/* Fish */}
      {fishData.map((_, i) => (
        <group key={i} ref={el => fishRef.current[i] = el}>
          <mesh><coneGeometry args={[0.06, 0.15, 4]} /><meshStandardMaterial color={['#ff6b6b', '#fdcb6e', '#74b9ff', '#a29bfe', '#00b894', '#fd79a8', '#e17055', '#00cec9'][i]} roughness={0.3} metalness={0.2} /></mesh>
          <mesh position={[-0.1, 0, 0]}><coneGeometry args={[0.02, 0.06, 3]} /><meshStandardMaterial color={['#ff6b6b', '#fdcb6e', '#74b9ff', '#a29bfe', '#00b894', '#fd79a8', '#e17055', '#00cec9'][i]} roughness={0.3} metalness={0.2} /></mesh>
        </group>
      ))}
      {/* Bubbles */}
      <Float speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
        {[[-0.5, -0.2, 1], [0.7, 0.1, 0.5], [-0.3, -0.4, -0.8], [1, -0.1, -0.3], [-0.8, 0, 0.2]].map((p, i) => (
          <mesh key={i} position={p}><sphereGeometry args={[0.02 + Math.random() * 0.03, 8, 8]} /><meshBasicMaterial color="#bbdefb" transparent opacity={0.4} /></mesh>
        ))}
      </Float>
      {/* Seaweed */}
      {[[-1.8, -0.5, -1], [1.7, -0.5, 0.5], [-1.5, -0.5, 1.8], [2, -0.5, -1.5]].map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.02, 0.04, 0.6, 6]} /><meshStandardMaterial color="#1b5e20" roughness={0.8} /></mesh>
          <mesh position={[0.05, 0.7, 0]} rotation={[0.2, 0, 0.1]}><cylinderGeometry args={[0.01, 0.02, 0.4, 6]} /><meshStandardMaterial color="#2e7d32" roughness={0.8} /></mesh>
        </group>
      ))}
    </group>
  );
}

function OceanDecor() {
  return (
    <>
      <Sparkles count={40} scale={[8, 4, 8]} size={0.03} speed={0.2} color="#4fc3f7" />
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} /><meshStandardMaterial color="#0d3b5a" opacity={0.8} transparent />
      </mesh>
    </>
  );
}

// ─── SPACE THEME ──────────────────────────────────────────────────

function Planet({ radius, color, distance, speed, ring }) {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(t) * distance;
      ref.current.position.z = Math.sin(t) * distance;
      ref.current.rotation.y += 0.01;
    }
  });
  return (
    <group ref={ref}>
      <mesh><sphereGeometry args={[radius, 20, 20]} /><meshStandardMaterial color={color} roughness={0.3} metalness={0.2} /></mesh>
      {ring && (
        <mesh rotation={[0.3, 0, 0]}>
          <ringGeometry args={[radius * 1.4, radius * 2, 32]} /><meshStandardMaterial color="#b0a0d0" roughness={0.6} metalness={0.3} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function SpaceEnvironment() {
  const sunRef = useRef();
  useFrame((s) => {
    if (sunRef.current) {
      sunRef.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 0.5) * 0.05);
    }
  });

  return (
    <group>
      {/* Sun */}
      <mesh ref={sunRef} position={[0.3, 0.2, 0]}>
        <sphereGeometry args={[0.3, 20, 20]} /><meshBasicMaterial color="#ffe082" />
      </mesh>
      <mesh position={[0.3, 0.2, 0]}>
        <sphereGeometry args={[0.35, 20, 20]} /><meshBasicMaterial color="#ffcc02" transparent opacity={0.1} />
      </mesh>
      <Planet radius={0.06} color="#e0e0e0" distance={0.6} speed={0.4} />
      <Planet radius={0.08} color="#ffab91" distance={0.9} speed={0.3} />
      <Planet radius={0.1} color="#4fc3f7" distance={1.2} speed={0.2} />
      <Planet radius={0.07} color="#ef5350" distance={1.5} speed={0.15} />
      <Planet radius={0.15} color="#d4a373" distance={1.9} speed={0.1} ring />
      <Planet radius={0.12} color="#ffcc80" distance={2.3} speed={0.07} ring />
      {/* Distant galaxy */}
      <mesh rotation={[0.5, 0.3, 0]} position={[-1.5, 0.5, -1]}>
        <ringGeometry args={[0.5, 1, 32]} /><meshBasicMaterial color="#b39ddb" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
      <Stars count={400} depth={40} factor={2} saturation={0.5} fade speed={0.3} />
      {/* Asteroid belt */}
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[
          Math.cos((i / 30) * Math.PI * 2) * 1.7,
          (Math.random() - 0.5) * 0.2,
          Math.sin((i / 30) * Math.PI * 2) * 1.7,
        ]}>
          <dodecahedronGeometry args={[0.015 + Math.random() * 0.02, 0]} /><meshStandardMaterial color="#888" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function SpaceDecor() {
  return (
    <Sparkles count={60} scale={[15, 8, 15]} size={0.02} speed={0.2} color="#b39ddb" />
  );
}

// ─── CYBERPUNK THEME ──────────────────────────────────────────────

function Building({ x, z, h }) {
  return (
    <mesh position={[x, h / 2 - 0.5, z]}>
      <boxGeometry args={[0.2 + Math.random() * 0.15, h, 0.2 + Math.random() * 0.15]} />
      <meshStandardMaterial color="#1a0a2e" emissive={['#ff0066', '#00ffff', '#ff00ff', '#00ff88'][Math.floor(Math.random() * 4)]} emissiveIntensity={0.3} roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

function CyberpunkEnvironment() {
  const gridRef = useRef();
  const rainRef = useRef([]);
  const rainCount = 80;

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (gridRef.current) gridRef.current.rotation.z = Math.sin(t * 0.1) * 0.005;
    rainRef.current.forEach((m, i) => {
      if (m) {
        m.position.y -= 0.03;
        if (m.position.y < -1) m.position.y = 1.5;
        m.position.x += Math.sin(i + t * 0.5) * 0.0005;
      }
    });
  });

  const buildings = useMemo(() => {
    const b = [];
    for (let i = 0; i < 25; i++) {
      let x, z;
      do {
        x = (Math.random() - 0.5) * 5;
        z = (Math.random() - 0.5) * 4;
      } while (Math.abs(x) < 0.3 && Math.abs(z) < 0.3);
      b.push({ x, z, h: 0.3 + Math.random() * 1.2 });
    }
    return b;
  }, []);

  const rainPos = useMemo(() => Array.from({ length: rainCount }, () => ({
    x: (Math.random() - 0.5) * 6, z: (Math.random() - 0.5) * 5, y: Math.random() * 3 - 1,
  })), []);

  return (
    <group>
      {/* Grid floor */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[6, 5, 20, 20]} /><meshStandardMaterial color="#0a0020" wireframe emissive="#ff0066" emissiveIntensity={0.1} transparent opacity={0.6} />
      </mesh>
      {/* Buildings */}
      {buildings.map((b, i) => <Building key={i} {...b} />)}
      {/* Rain */}
      {rainPos.map((p, i) => (
        <mesh key={i} ref={el => rainRef.current[i] = el} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[0.003, 0.08, 0.003]} /><meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
        </mesh>
      ))}
      {/* Neon glow */}
      <mesh position={[0, 0.5, -1.5]}><planeGeometry args={[4, 2]} /><meshBasicMaterial color="#ff0066" transparent opacity={0.03} /></mesh>
      <mesh position={[0, 0.5, 1.5]}><planeGeometry args={[4, 2]} /><meshBasicMaterial color="#00ffff" transparent opacity={0.03} /></mesh>
      {/* Holographic rings */}
      <mesh position={[0, 0, 0]} rotation={[0.3, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} /><meshBasicMaterial color="#ff00ff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CyberpunkDecor() {
  return (
    <Sparkles count={50} scale={[8, 4, 8]} size={0.03} speed={0.5} color="#ff0066" />
  );
}

// ─── ANIME THEME — wallpaper background with floating petals

function AnimePetals() {
  const refs = useRef([]);
  const count = 40;

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (m) {
        m.position.x += Math.sin(t * 0.3 + i * 0.7) * 0.001;
        m.position.y -= 0.003;
        m.position.z += Math.cos(t * 0.2 + i * 0.4) * 0.001;
        m.rotation.x += 0.005;
        m.rotation.z += 0.008;
        if (m.position.y < -1.2) {
          m.position.y = 1.5;
          m.position.x = (Math.random() - 0.5) * 4;
          m.position.z = (Math.random() - 0.5) * 2.5;
        }
      }
    });
  });

  const positions = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 4,
    y: Math.random() * 3 - 1,
    z: (Math.random() - 0.5) * 2.5,
  })), []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          ref={el => refs.current[i] = el}
          position={[p.x, p.y, p.z]}
          rotation={[Math.random() * 6, Math.random() * 6, Math.random() * 6]}
        >
          <planeGeometry args={[0.03, 0.02]} />
          <meshBasicMaterial color={['#fce4ec', '#f8bbd0', '#ffcdd2', '#f0d0d8'][i % 4]} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function AnimeEnvironment() {
  return (
    <group>
      <AnimePetals />
      <Sparkles count={20} scale={[4, 2, 4]} size={0.015} speed={0.15} color="#fce4ec" />
    </group>
  );
}

function AnimeDecor() {
  return (
    <Sparkles count={30} scale={[6, 3, 6]} size={0.02} speed={0.2} color="#fce4ec" />
  );
}

// ─── MINIMAL THEME ────────────────────────────────────────────────

function MinimalEnvironment() {
  const shapesRef = useRef([]);
  const geoData = useMemo(() => [
    { type: 'torus', pos: [-0.8, 0.2, 0], args: [0.2, 0.06, 16, 32], color: '#ffffff', speed: 0.3 },
    { type: 'icosahedron', pos: [0.8, -0.1, 0.3], args: [0.15, 0], color: '#e0e0e0', speed: 0.4 },
    { type: 'octahedron', pos: [0, 0.3, -0.5], args: [0.12, 0], color: '#cccccc', speed: 0.5 },
    { type: 'torusKnot', pos: [-0.3, -0.1, 0.7], args: [0.1, 0.04, 32, 16], color: '#dddddd', speed: 0.2 },
    { type: 'box', pos: [0.4, 0.2, -0.4], args: [0.15, 0.15, 0.15], color: '#eeeeee', speed: 0.35 },
  ], []);

  useFrame((s) => {
    geoData.forEach((d, i) => {
      if (shapesRef.current[i]) {
        shapesRef.current[i].rotation.x += d.speed * 0.01;
        shapesRef.current[i].rotation.y += d.speed * 0.015;
        shapesRef.current[i].position.y = d.pos[1] + Math.sin(s.clock.elapsedTime * d.speed + i) * 0.05;
      }
    });
  });

  const geo = (d, i) => {
    switch (d.type) {
      case 'torus': return <torusGeometry args={d.args} />;
      case 'icosahedron': return <icosahedronGeometry args={d.args} />;
      case 'octahedron': return <octahedronGeometry args={d.args} />;
      case 'torusKnot': return <torusKnotGeometry args={d.args} />;
      case 'box': return <boxGeometry args={d.args} />;
      default: return <boxGeometry args={[0.1, 0.1, 0.1]} />;
    }
  };

  return (
    <group>
      {/* Clean floor line */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 3]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.03} />
      </mesh>
      {/* Floating shapes */}
      {geoData.map((d, i) => (
        <mesh key={i} ref={el => shapesRef.current[i] = el} position={d.pos}>
          {geo(d, i)}
          <meshStandardMaterial color={d.color} roughness={0.2} metalness={0.3} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Thin ring */}
      <mesh rotation={[0.2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[0.4, 0.42, 48]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0.5, 0.3, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.25, 0.27, 48]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function MinimalDecor() {
  return (
    <Sparkles count={15} scale={[6, 4, 6]} size={0.01} speed={0.1} color="#ffffff" />
  );
}

// ─── ENVIRONMENT MAP ──────────────────────────────────────────────

const ENVIRONMENTS = {
  dark:     { scene: DarkEnvironment,     decor: DarkDecor,     bg: '#050510', light: '#6c5ce7' },
  light:    { scene: LightEnvironment,    decor: LightDecor,    bg: '#e8e0d8', light: '#ffe082' },
  forest:   { scene: CherryBlossomEnvironment, decor: CherryBlossomDecor, bg: '#f5f2ed', light: '#f5e0e0' },
  ocean:    { scene: OceanEnvironment,    decor: OceanDecor,    bg: '#0a1628', light: '#4fc3f7' },
  space:    { scene: SpaceEnvironment,    decor: SpaceDecor,    bg: '#050510', light: '#b39ddb' },
  cyberpunk:{ scene: CyberpunkEnvironment,decor: CyberpunkDecor,bg: '#0a000a', light: '#ff0066' },
  anime:    { scene: AnimeEnvironment,    decor: AnimeDecor,    bg: '#f0ece8', light: '#f8bbd0' },
  minimal:  { scene: MinimalEnvironment,  decor: MinimalDecor,  bg: '#0a0a0a', light: '#ffffff' },
};

function SceneContent() {
  const { currentTheme } = useGame();
  const env = ENVIRONMENTS[currentTheme] || ENVIRONMENTS.anime;
  const Scene = env.scene;
  const Decor = env.decor;
  const isDark = currentTheme !== 'light' && currentTheme !== 'forest' && currentTheme !== 'anime';

  return (
    <>
      {currentTheme !== 'anime' && <color attach="background" args={[env.bg]} />}
      <ambientLight intensity={currentTheme === 'anime' ? 0.8 : isDark ? 0.25 : 0.6} />
      <pointLight position={[2, 3, 4]} intensity={isDark ? 0.5 : 0.8} color={env.light} />
      <pointLight position={[-2, -1, 3]} intensity={isDark ? 0.3 : 0.5} color={env.light} />
      <spotLight position={[0, 3, 0]} intensity={isDark ? 0.2 : 0.4} angle={0.6} penumbra={0.5} color={env.light} />
      {isDark && currentTheme !== 'anime' ? <directionalLight position={[2, 4, 2]} intensity={0.3} color="#fff8f0" /> : null}
      {isDark ? <Environment preset="night" /> : null}
      <Decor />
      <Scene />
    </>
  );
}

export default function ThreeScene() {
  const { currentTheme } = useGame();
  return (
    <div className="three-scene">
      <Canvas camera={{ position: [0, 0, 3.6], fov: 50 }} dpr={[1, 1.5]} gl={{ alpha: currentTheme === 'anime' }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}
