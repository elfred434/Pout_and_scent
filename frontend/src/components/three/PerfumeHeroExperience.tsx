import { Component, Suspense, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, Float, RoundedBox, Sparkles } from '@react-three/drei';
import LiquidGlass from '@nkzw/liquid-glass';
import * as THREE from 'three';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { useMediaQuery, useReducedMotion } from '@/hooks/useMediaQuery';

function PerfumeBottle({ reducedMotion, compact }: { reducedMotion: boolean; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const liquid = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;

    const targetX = compact ? 0 : state.pointer.y * 0.08;
    const targetY = compact ? 0.18 : state.pointer.x * 0.22;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.04);
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.55) * 0.015;

    if (liquid.current) {
      liquid.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.018;
    }

    group.current.position.y += Math.sin(state.clock.elapsedTime * 0.7) * delta * 0.004;
  });

  const bubbles = useMemo(
    () => [
      [-0.48, -0.55, 0.34, 0.055],
      [0.38, -0.16, 0.36, 0.04],
      [-0.18, 0.2, 0.37, 0.035],
      [0.54, 0.5, 0.28, 0.028],
      [-0.58, 0.68, 0.24, 0.025],
    ] as const,
    []
  );

  return (
    <Float
      speed={reducedMotion ? 0 : 1.15}
      rotationIntensity={reducedMotion ? 0 : 0.08}
      floatIntensity={reducedMotion ? 0 : 0.32}
    >
      <group ref={group} rotation={[0.03, 0.18, -0.02]} scale={compact ? 0.88 : 1}>
        {/* Glass body */}
        <RoundedBox args={[2.35, 3.35, 1.12]} radius={0.38} smoothness={6} position={[0, -0.12, 0]}>
          <meshPhysicalMaterial
            color="#c5b3f5"
            transmission={0.9}
            thickness={0.85}
            roughness={0.08}
            ior={1.46}
            clearcoat={1}
            clearcoatRoughness={0.08}
            attenuationColor="#7651b5"
            attenuationDistance={2.4}
            transparent
            opacity={0.96}
          />
        </RoundedBox>

        {/* Perfume liquid */}
        <RoundedBox
          ref={liquid}
          args={[1.94, 2.05, 0.82]}
          radius={0.26}
          smoothness={5}
          position={[0, -0.58, 0.02]}
        >
          <meshPhysicalMaterial
            color="#604092"
            emissive="#34214f"
            emissiveIntensity={0.18}
            roughness={0.18}
            metalness={0.02}
            transparent
            opacity={0.72}
          />
        </RoundedBox>

        {/* Neck and metallic cap */}
        <mesh position={[0, 1.74, 0]}>
          <cylinderGeometry args={[0.45, 0.5, 0.5, 48]} />
          <meshPhysicalMaterial color="#d9ccff" transmission={0.55} thickness={0.5} roughness={0.12} />
        </mesh>
        <mesh position={[0, 2.08, 0]}>
          <cylinderGeometry args={[0.58, 0.5, 0.34, 48]} />
          <meshStandardMaterial color="#17111f" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.28, 0]}>
          <cylinderGeometry args={[0.62, 0.58, 0.12, 48]} />
          <meshStandardMaterial color="#c8adff" metalness={0.82} roughness={0.16} />
        </mesh>

        {/* Front label */}
        <RoundedBox args={[1.42, 1.12, 0.06]} radius={0.14} smoothness={5} position={[0, -0.08, 0.58]}>
          <meshPhysicalMaterial
            color="#f5f3ff"
            roughness={0.18}
            metalness={0.06}
            transparent
            opacity={0.84}
          />
        </RoundedBox>
        <mesh position={[0, 0.16, 0.62]}>
          <planeGeometry args={[0.78, 0.055]} />
          <meshBasicMaterial color="#7651b5" />
        </mesh>
        <mesh position={[0, -0.25, 0.62]}>
          <planeGeometry args={[0.48, 0.025]} />
          <meshBasicMaterial color="#c5b3f5" transparent opacity={0.82} />
        </mesh>

        {/* Tiny suspended bubbles inside the bottle */}
        {bubbles.map(([x, y, z, radius], index) => (
          <mesh key={index} position={[x, y, z]}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshPhysicalMaterial color="#ffffff" transmission={0.8} roughness={0.05} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Scene({ reducedMotion, compact }: { reducedMotion: boolean; compact: boolean }) {
  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 5, 5]} intensity={3.4} color="#ffffff" />
      <pointLight position={[-4, 1, 3]} intensity={22} distance={9} color="#a98bcf" />
      <pointLight position={[3, -2, 2]} intensity={18} distance={8} color="#b38cff" />

      {/* Futuristic orbital lines */}
      <mesh rotation={[1.15, 0.22, 0.42]} position={[0, -0.1, -1.2]}>
        <torusGeometry args={[2.42, 0.014, 12, 160]} />
        <meshBasicMaterial color="#d9ccff" transparent opacity={0.52} />
      </mesh>
      <mesh rotation={[1.38, -0.45, -0.24]} position={[0, -0.05, -1.1]}>
        <torusGeometry args={[2.8, 0.008, 12, 160]} />
        <meshBasicMaterial color="#d9ccff" transparent opacity={0.3} />
      </mesh>

      <PerfumeBottle reducedMotion={reducedMotion} compact={compact} />

      <Sparkles
        count={compact ? 28 : 62}
        scale={[6, 6, 3]}
        size={compact ? 2 : 2.8}
        speed={reducedMotion ? 0 : 0.22}
        color="#ebe2ff"
        opacity={0.65}
      />
      <AdaptiveDpr pixelated />
    </>
  );
}

function StaticBottleFallback() {
  return (
    <div className="hero-bottle-fallback" aria-hidden="true">
      <div className="hero-bottle-cap" />
      <div className="hero-bottle-neck" />
      <div className="hero-bottle-body">
        <div className="hero-bottle-liquid" />
        <div className="hero-bottle-label">P&amp;S</div>
      </div>
    </div>
  );
}

class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <StaticBottleFallback /> : this.props.children;
  }
}

function canUseWebGL() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function PerfumeHeroExperience() {
  const compact = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useReducedMotion();
  const hasWebGL = useMemo(canUseWebGL, []);

  return (
    <div className="relative h-full min-h-[440px] w-full overflow-visible" data-hero-visual>
      <div className="absolute inset-4 rounded-[2rem] bg-primary-500/10 blur-3xl" aria-hidden="true" />

      <SceneErrorBoundary>
        {hasWebGL ? (
          <Canvas
            dpr={compact ? 1 : [1, 1.5]}
            camera={{ position: [0, 0.12, 7.4], fov: 34 }}
            gl={{ alpha: true, antialias: !compact, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.18;
              gl.outputColorSpace = THREE.SRGBColorSpace;
            }}
          >
            <Suspense fallback={null}>
              <Scene reducedMotion={reducedMotion} compact={compact} />
            </Suspense>
          </Canvas>
        ) : (
          <StaticBottleFallback />
        )}
      </SceneErrorBoundary>

      {/* Real Liquid Glass from @nkzw/liquid-glass; desktop only for a balanced GPU budget. */}
      {!compact && !reducedMotion && (
        <LiquidGlass
          aberrationIntensity={1.4}
          blurAmount={0.08}
          borderRadius={18}
          displacementScale={44}
          elasticity={0.18}
          mode="standard"
          padding="11px 16px"
          saturation={155}
          style={{ position: 'absolute', left: '20%', top: '25%', zIndex: 8 }}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
            <SparklesIcon className="h-4 w-4" /> Verre interactif
          </span>
        </LiquidGlass>
      )}

      <div className="glass-panel-soft absolute bottom-8 right-3 z-10 hidden min-w-[164px] rounded-2xl p-4 text-white sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-200">Signature</p>
        <p className="mt-1 text-sm font-semibold">Éclat violet</p>
        <p className="mt-1 text-xs text-white/55">Eau de parfum · 50 ml</p>
      </div>
    </div>
  );
}
