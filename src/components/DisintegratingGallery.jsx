import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import GlowingHeader from './GlowingHeader';
import './DisintegratingGallery.css';

// 30 shared anchor points for both planes and particle spawn (staggered grid for depth)
const imagePositions = [
  [-3.8, 2.6, -0.6], [-2.2, 2.8, 0.2], [-0.6, 2.5, -0.4], [1.0, 2.7, 0.15], [2.6, 2.5, -0.55],
  [-3.4, 1.6, 0.4], [-1.8, 1.8, -0.2], [-0.2, 1.6, 0.35], [1.4, 1.7, -0.25], [3.0, 1.6, 0.45],
  [-3.9, 0.6, -0.35], [-2.3, 0.8, 0.5], [-0.7, 0.7, -0.4], [0.9, 0.65, 0.35], [2.5, 0.7, -0.5],
  [-3.2, -0.4, 0.15], [-1.6, -0.2, -0.55], [0.0, -0.4, 0.3], [1.6, -0.25, -0.2], [3.2, -0.35, 0.45],
  [-3.6, -1.4, -0.5], [-2.0, -1.2, 0.35], [-0.4, -1.25, -0.25], [1.2, -1.1, 0.4], [2.8, -1.25, -0.35],
  [-3.0, -2.2, 0.25], [-1.4, -2.0, -0.45], [0.2, -2.2, 0.4], [1.8, -2.05, -0.3], [3.4, -2.15, 0.35],
].map(([x, y, z]) => new THREE.Vector3(x, y, z));

const PARTICLE_COUNT = 8000;
const PLANE_SIZE = { w: 1.2, h: 0.9 };

const ParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uMorph: 0,
    uAlpha: 0,
    uScroll: 0,
    uPointSize: 6.0,
  },
  /* glsl */ `
    attribute vec3 aTarget;
    attribute float aSeed;
    varying float vSeed;
    varying float vMorph;

    uniform float uTime;
    uniform float uMorph;
    uniform float uScroll;
    uniform float uPointSize;

    float easeOutCubic(float x) {
      float t = clamp(x, 0.0, 1.0);
      return 1.0 - pow(1.0 - t, 3.0);
    }

    void main() {
      vSeed = aSeed;
      vMorph = uMorph;

      vec3 start = position;
      vec3 target = aTarget;

      float wobble = sin(uTime * 0.8 + aSeed * 6.2831) * 0.12;
      vec3 morphPos = mix(start, target, easeOutCubic(uMorph));
      morphPos.y += wobble * (1.0 - uMorph);
      morphPos.z += sin(uTime + aSeed * 4.5) * 0.1 * (1.0 - uMorph);

      // Phase 3: blow upward with scroll
      morphPos.y += uScroll * (1.5 + aSeed * 0.8);
      morphPos.x += uScroll * 0.25 * sin(uTime + aSeed * 3.0);

      vec4 mvPosition = modelViewMatrix * vec4(morphPos, 1.0);
      gl_PointSize = uPointSize * (1.5 - uMorph * 0.35) * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl */ `
    varying float vSeed;
    varying float vMorph;
    uniform float uAlpha;

    void main() {
      float r = 0.85 + 0.15 * sin(vSeed * 12.0);
      float g = 0.55 + 0.35 * vMorph;
      float b = 0.35 + 0.45 * (1.0 - vMorph);

      float dist = length(gl_PointCoord - 0.5);
      float soft = smoothstep(0.5, 0.1, dist);

      gl_FragColor = vec4(vec3(r, g, b), soft * uAlpha);
    }
  `
);
extend({ ParticleMaterial });

const ImageGallery = ({ morphTriggered, morphStartTimeRef }) => {
  const meshRefs = useRef([]);
  const materialRefs = useRef([]);
  const delays = useMemo(() => imagePositions.map(() => Math.random() * 0.35), []);
  const phaseStart = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (phaseStart.current === null) phaseStart.current = t;
    if (morphTriggered && morphStartTimeRef.current === null) {
      morphStartTimeRef.current = t;
    }

    const elapsed = t - phaseStart.current;
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
          ref={(el) => (meshRefs.current[idx] = el)}
          position={pos}
          rotation={[0, Math.random() * 0.4 - 0.2, Math.random() * 0.1 - 0.05]}
        >
          <planeGeometry args={[PLANE_SIZE.w, PLANE_SIZE.h]} />
          <meshBasicMaterial
            ref={(el) => (materialRefs.current[idx] = el)}
            color={new THREE.Color().setHSL(0.1 + idx * 0.03, 0.55, 0.55)}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
};

const ParticleSystem = ({ morphTarget, alphaTarget, scrollBlow }) => {
  const materialRef = useRef(null);
  const geometryRef = useRef(null);
  const morphRef = useRef(0);
  const alphaRef = useRef(0);

  const textPoints = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 180px "Space Grotesk", "Inter", sans-serif';
    const text = 'Jonathan Ouyang';
    const metrics = ctx.measureText(text);
    const x = (canvas.width - metrics.width) / 2;
    const y = canvas.height / 2 + 60;
    ctx.fillText(text, x, y);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const points = [];
    const step = 5;
    for (let py = 0; py < canvas.height; py += step) {
      for (let px = 0; px < canvas.width; px += step) {
        const idx = (py * canvas.width + px) * 4 + 3;
        if (data[idx] > 120) {
          const nx = (px / canvas.width - 0.5) * 9.5;
          const ny = ((canvas.height - py) / canvas.height - 0.5) * 4.0;
          points.push(new THREE.Vector3(nx, ny, (Math.random() - 0.5) * 0.6));
        }
      }
    }
    return points;
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const startArray = new Float32Array(PARTICLE_COUNT * 3);
    const targetArray = new Float32Array(PARTICLE_COUNT * 3);
    const seedArray = new Float32Array(PARTICLE_COUNT);

    if (textPoints.length === 0) return g;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const img = imagePositions[Math.floor(Math.random() * imagePositions.length)];
      const tx = img.x + (Math.random() - 0.5) * PLANE_SIZE.w;
      const ty = img.y + (Math.random() - 0.5) * PLANE_SIZE.h;
      const tz = img.z + (Math.random() - 0.5) * 0.25;

      startArray[i * 3] = tx;
      startArray[i * 3 + 1] = ty;
      startArray[i * 3 + 2] = tz;

      const target = textPoints[i % textPoints.length];
      targetArray[i * 3] = target.x;
      targetArray[i * 3 + 1] = target.y;
      targetArray[i * 3 + 2] = target.z;

      seedArray[i] = Math.random();
    }

    g.setAttribute('position', new THREE.BufferAttribute(startArray, 3));
    g.setAttribute('aTarget', new THREE.BufferAttribute(targetArray, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seedArray, 1));
    return g;
  }, [textPoints]);

  useFrame(({ clock }, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uTime = clock.getElapsedTime();
    morphRef.current = THREE.MathUtils.damp(morphRef.current, morphTarget, 5, delta);
    alphaRef.current = THREE.MathUtils.damp(alphaRef.current, alphaTarget, 6, delta);
    materialRef.current.uMorph = morphRef.current;
    materialRef.current.uAlpha = alphaRef.current;
    materialRef.current.uScroll = scrollBlow;
  });

  return (
    <points geometry={geometry} ref={geometryRef}>
      <particleMaterial ref={materialRef} transparent depthWrite={false} />
    </points>
  );
};

const DisintegratingGallery = () => {
  const [morphTarget, setMorphTarget] = useState(0); // 0 = solid phase, 1 = text phase
  const [alphaTarget, setAlphaTarget] = useState(0);
  const [scrollBlow, setScrollBlow] = useState(0);
  const morphStartTimeRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMorphTarget(1);
      setAlphaTarget(1);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll for Phase 3 blow-away
  useEffect(() => {
    const onScroll = () => {
      const scrolled = Math.min(1, window.scrollY / 800);
      setScrollBlow(scrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <div className="gallery-copy">
          <p className="eyebrow">Visual Narrative Revision</p>
          <GlowingHeader>Disintegrating Gallery</GlowingHeader>
          <p className="lede">
            Phase-based reveal: solid images pop into place, shatter into 8,000 coordinated particles,
            form "Jonathan Ouyang," then lift away as you scroll.
          </p>

          <div className="pill-row">
            {['Phase 1: Solid', 'Phase 2: Shatter', 'Phase 3: Scroll'].map((item) => (
              <span key={item} className="pill">{item}</span>
            ))}
          </div>
        </div>

        <div className="gallery-canvas">
          <div className="canvas-chrome">
            <div className="chrome-bar">
              <span className="chrome-light" />
              <span className="chrome-light" />
              <span className="chrome-light" />
              <p className="chrome-label">Live WebGL Pane</p>
            </div>
            <Canvas camera={{ position: [0, 0, 10], fov: 55 }}>
              <color attach="background" args={['#03040a']} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[4, 6, 6]} intensity={1.1} />
              <directionalLight position={[-4, -2, -4]} intensity={0.35} />
              <ImageGallery morphTriggered={morphTarget > 0.1} morphStartTimeRef={morphStartTimeRef} />
              <ParticleSystem morphTarget={morphTarget} alphaTarget={alphaTarget} scrollBlow={scrollBlow} />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
        </div>
      </section>

      <section className="gallery-narrative">
        <article className="narrative-card focused">
          <p className="card-kicker">Phase 1</p>
          <h3>Solid Gallery Pop</h3>
          <p className="card-blurb">30 planes scale from 0 to 1 at shared anchor points. Pure meshes, no particles yet.</p>
          <p className="card-intent">Anchors define exact spawn coordinates for the upcoming shatter.</p>
        </article>
        <article className="narrative-card focused">
          <p className="card-kicker">Phase 2</p>
          <h3>The Shatter</h3>
          <p className="card-blurb">At 3.5s, solids vanish and 8k particles appear in-place, converging into "Jonathan Ouyang."</p>
          <p className="card-intent">Shared data guarantees particles originate where planes were.</p>
        </article>
        <article className="narrative-card">
          <p className="card-kicker">Phase 3</p>
          <h3>Scroll Lift</h3>
          <p className="card-blurb">Scroll upward to blow the text apart vertically with subtle lateral drift.</p>
          <p className="card-intent">Maintains cohesion until user motion dissolves it.</p>
        </article>
      </section>
    </div>
  );
};

export default DisintegratingGallery;
