import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { OrbitControls, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import "./DisintegratingGallery.css";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json";

// Shared anchor points for both planes and particle spawn
const spreadScaleX = 3.2; // stronger horizontal spread
const spreadScaleY = 2.0; // stronger vertical spread
const depthScale = 2.0; // more distinct depth layering
const imagePositions = [
  [-3.4, 2.8, -0.8],
  [-1.4, 2.9, 1.2],
  [0.6, 2.7, -1.4],
  [2.6, 2.9, 1.4],
  [4.2, 2.6, -1.6],
  [-3.6, 1.4, 1.6],
  [-1.2, 1.6, -1.5],
  [1.0, 1.5, 1.4],
  [3.2, 1.4, -1.6],
  [-4.0, 0.2, -1.7],
  [-1.8, 0.3, 1.7],
  [1.6, 0.25, -1.5],
  [4.0, 0.35, 1.6],
  [-3.2, -1.3, -1.6],
  [-0.8, -1.1, 1.5],
  [1.4, -1.2, -1.4],
  [3.4, -1.25, 1.6],
  [-2.6, -2.4, 1.4],
  [0.2, -2.3, -1.5],
  [2.8, -2.35, 1.5],
].map(
  ([x, y, z]) =>
    new THREE.Vector3(x * spreadScaleX, y * spreadScaleY, z * depthScale)
);

// Pre-set (non-random) size variation; all remain large.
const planeSizes = [
  { w: 4.4, h: 3.4 },
  { w: 4.9, h: 3.6 },
  { w: 4.1, h: 3.1 },
  { w: 4.7, h: 3.5 },
  { w: 5.0, h: 3.7 },
  { w: 4.3, h: 3.2 },
  { w: 4.5, h: 3.3 },
  { w: 4.2, h: 3.2 },
  { w: 4.8, h: 3.6 },
  { w: 4.7, h: 3.5 },
  { w: 5.1, h: 3.8 },
  { w: 4.3, h: 3.2 },
  { w: 4.6, h: 3.4 },
  { w: 4.2, h: 3.2 },
  { w: 4.8, h: 3.6 },
  { w: 4.4, h: 3.3 },
  { w: 5.0, h: 3.7 },
  { w: 4.3, h: 3.2 },
  { w: 4.7, h: 3.5 },
  { w: 4.2, h: 3.2 },
];
const PARTICLE_COUNT = 20000;

const clusterPalette = [
  "#FF7A18",
  "#FF5F5F",
  "#FF9A62",
  "#D95E40",
  "#FFB347",
  "#FF6F61",
  "#F76B1C",
  "#FF8C42",
  "#F25C54",
  "#F79256",
  "#FF7A18",
  "#D9376E",
  "#FF5F5F",
  "#D95E40",
  "#FFB347",
  "#F25C54",
  "#F76B1C",
  "#FF8C42",
  "#F79256",
  "#FF6F61",
  "#FF9A62",
  "#D9376E",
  "#FF7A18",
  "#D95E40",
  "#FF5F5F",
  "#F25C54",
  "#FF8C42",
  "#FFB347",
  "#FF6F61",
  "#F79256",
];

const ParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uMorph: 0,
    uAlpha: 0,
    uScroll: 0,
  },
  /* glsl */ `
    attribute vec3 aTarget;
    attribute vec3 aColor;
    attribute float aSeed;
    varying vec3 vColor;
    varying float vMorph;

    uniform float uTime;
    uniform float uMorph;
    uniform float uScroll;

    float easeOutCubic(float x) {
      float t = clamp(x, 0.0, 1.0);
      return 1.0 - pow(1.0 - t, 3.0);
    }

    void main() {
      vColor = aColor;
      vMorph = uMorph;

      vec3 start = position;
      vec3 target = aTarget;

      float wobble = sin(uTime * 0.8 + aSeed * 6.2831) * 0.12;
      vec3 morphPos = mix(start, target, easeOutCubic(uMorph));
      morphPos.y += wobble * (1.0 - uMorph);
      morphPos.z += sin(uTime + aSeed * 4.5) * 0.1 * (1.0 - uMorph);

      morphPos.y += uScroll * (1.5 + aSeed * 0.8);
      morphPos.x += uScroll * 0.25 * sin(uTime + aSeed * 3.0);

      vec4 mvPosition = modelViewMatrix * vec4(morphPos, 1.0);
      gl_PointSize = 0.2 * (1.4 - uMorph * 0.35) * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl */ `
    varying vec3 vColor;
    varying float vMorph;
    uniform float uAlpha;

    void main() {
      float dist = length(gl_PointCoord - 0.5);
      float soft = smoothstep(0.5, 0.08, dist);
      gl_FragColor = vec4(vColor, soft * uAlpha);
    }
  `
);
extend({ ParticleMaterial });

const ImageGallery: React.FC<{
  morphTriggered: boolean;
  morphStartTimeRef: React.MutableRefObject<number | null>;
}> = ({ morphTriggered, morphStartTimeRef }) => {
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const materialRefs = useRef<THREE.MeshBasicMaterial[]>([]);
  const delays = useMemo(
    () => imagePositions.map(() => Math.random() * 0.35),
    []
  );
  const phaseStart = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (phaseStart.current === null) phaseStart.current = t;
    if (morphTriggered && morphStartTimeRef.current === null) {
      morphStartTimeRef.current = t;
    }

    const elapsed = t - (phaseStart.current ?? 0);
    meshRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const material = materialRefs.current[idx];
      const pop = Math.min(1, Math.max(0, (elapsed - delays[idx]) / 0.9));
      const eased = 1 - Math.pow(1 - pop, 3);

      let scale = eased;
      let opacity = 1;

      if (morphTriggered && morphStartTimeRef.current !== null) {
        const fadeElapsed = t - morphStartTimeRef.current;
        const fade = Math.min(1, Math.max(0, fadeElapsed / 0.35));
        scale *= 1 - fade;
        opacity = 1 - fade;
      }

      mesh.scale.setScalar(Math.max(0.0001, scale));
      if (material) {
        material.opacity = opacity;
      }
    });
  });

  return (
    <group>
      {imagePositions.map((pos, idx) => (
        <mesh
          key={idx}
          ref={(el) => (meshRefs.current[idx] = el!)}
          position={pos}
          rotation={[0, Math.random() * 0.4 - 0.2, Math.random() * 0.1 - 0.05]}
        >
          <planeGeometry args={[planeSizes[idx].w, planeSizes[idx].h]} />
          <meshBasicMaterial
            ref={(el) => (materialRefs.current[idx] = el!)}
            color={clusterPalette[idx % clusterPalette.length]}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
};

const ParticleSystem: React.FC<{
  morphTarget: number;
  alphaTarget: number;
  scrollBlow: number;
}> = ({ morphTarget, alphaTarget, scrollBlow }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const font = new FontLoader().parse(
      helvetiker as unknown as THREE.FontData
    );
    const textGeo = new TextGeometry("Jonathan Ouyang", {
      font,
      size: 1.5,
      height: 0.01,
      curveSegments: 4,
      bevelEnabled: false,
    });
    textGeo.center();

    const sampler = new MeshSurfaceSampler(new THREE.Mesh(textGeo)).build();
    const targetArray = new Float32Array(PARTICLE_COUNT * 3);
    const startArray = new Float32Array(PARTICLE_COUNT * 3);
    const colorArray = new Float32Array(PARTICLE_COUNT * 3);
    const seedArray = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const temp = new THREE.Vector3();
      sampler.sample(temp);
      targetArray[i * 3] = temp.x * 1.275;
      targetArray[i * 3 + 1] = temp.y * 0.72;
      targetArray[i * 3 + 2] = temp.z;

      const imgIndex = Math.floor(Math.random() * imagePositions.length);
      const pos = imagePositions[imgIndex];
      const size = planeSizes[imgIndex];
      startArray[i * 3] = pos.x + (Math.random() - 0.5) * size.w;
      startArray[i * 3 + 1] = pos.y + (Math.random() - 0.5) * size.h;
      startArray[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.25;

      const c = new THREE.Color(
        clusterPalette[imgIndex % clusterPalette.length]
      );
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;

      seedArray[i] = Math.random();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(startArray, 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(targetArray, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(colorArray, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seedArray, 1));
    return g;
  }, []);

  const morphRef = useRef(0);
  const alphaRef = useRef(0);
  const morphStartRef = useRef<number | null>(null);

  useFrame(({ clock }, delta) => {
    if (!materialRef.current) return;
    const t = clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = t;
    const targetMorph = morphTarget;
    const current = morphRef.current;
    const rising = targetMorph > current;

    // brief hold after shatter so particles linger at origin
    const holdDuration = 0.35;
    if (rising && morphStartRef.current === null) {
      morphStartRef.current = t;
    }
    const holdActive =
      rising &&
      morphStartRef.current !== null &&
      t - morphStartRef.current < holdDuration;

    if (!holdActive) {
      // Smooth ramp: slow at start, accelerates as morph progresses
      const blend = THREE.MathUtils.clamp(current, 0, 1);
      const rate = rising ? THREE.MathUtils.lerp(0.12, 2.7, blend) : 2.0;
      const deltaStep = THREE.MathUtils.clamp(rate * delta, 0, 1);
      const next = current + (targetMorph - current) * deltaStep;
      morphRef.current = THREE.MathUtils.clamp(next, 0, 1);
    }
    alphaRef.current = THREE.MathUtils.damp(
      alphaRef.current,
      alphaTarget,
      6,
      delta
    );
    materialRef.current.uniforms.uMorph.value = morphRef.current;
    materialRef.current.uniforms.uAlpha.value = alphaRef.current;
    materialRef.current.uniforms.uScroll.value = scrollBlow;
  });

  return (
    <points geometry={geometry}>
      <particleMaterial
        ref={materialRef as any}
        transparent
        depthWrite={false}
      />
    </points>
  );
};

const PersonalSite: React.FC = () => {
  const [morphTarget, setMorphTarget] = useState(0);
  const [alphaTarget, setAlphaTarget] = useState(0);
  const [scrollBlow, setScrollBlow] = useState(0);
  const morphStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMorphTarget(1);
      setAlphaTarget(1);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = Math.min(1, window.scrollY / 800);
      setScrollBlow(scrolled);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="gallery-page full-bleed">
      <div className="gallery-canvas full-viewport">
        <Canvas
          camera={{ position: [0, 0, 14], fov: 48 }}
          dpr={[1, 2]}
          gl={{ antialias: false }}
        >
          <color attach="background" args={["#03040a"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 6]} intensity={1.1} />
          <directionalLight position={[-4, -2, -4]} intensity={0.35} />
          <ImageGallery
            morphTriggered={morphTarget > 0.1}
            morphStartTimeRef={morphStartTimeRef}
          />
          <ParticleSystem
            morphTarget={morphTarget}
            alphaTarget={alphaTarget}
            scrollBlow={scrollBlow}
          />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
};

export default PersonalSite;
