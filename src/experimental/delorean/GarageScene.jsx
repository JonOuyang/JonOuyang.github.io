/* eslint-disable react/no-unknown-property */
import { Component, useMemo, useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Environment,
  Lightformer,
  ContactShadows,
  MeshReflectorMaterial,
  useGLTF,
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import {
  TL, DOOR, ROOM, CAM_FOV, CAM_Y,
  clamp01, smoothstep, doorTravel, trackPoint,
  openerLamp, mainLights, headlampLevel,
} from './timeline';
import {
  buildDoorFaceTexture, buildExteriorNormal, buildInteriorNormal,
  buildFloorRoughness, buildBrushedRoughness,
} from './doorAssets';

const CA_OFFSET = new THREE.Vector2(0.0002, 0.0002);
// debug kill-switches for bisecting render issues, e.g. ?nofx&nocar&noaniso
const Q = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search)
  : new URLSearchParams();

// Model: "DeLorean DMC-12" by JandroS via Sketchfab (CC-BY-4.0), fetched from
// the Objaverse mirror. Untextured PBR — everything below re-materials it.
const CAR = {
  url: '/assets/delorean/model/delorean.glb',
  targetLength: 4.22,
  pos: [-0.15, 0, -3.35],
  yaw: 0.42,
  keepTexturedMaterials: false,
};

// ---------------------------------------------------------------------------
// Materials — created once; envMapIntensity is ramped with the interior lights
// so nothing inside "exists" until the opener light snaps on. Anything visible
// from outside keeps envMapIntensity 0 forever (IBL has no occlusion — it
// would leak through the walls onto the vanta-black exterior).
// ---------------------------------------------------------------------------
function useSceneMaterials() {
  return useMemo(() => {
    const envList = [];
    const reg = (m, base) => {
      m.envMapIntensity = 0;
      m.userData.envBase = base;
      envList.push(m);
      return m;
    };

    // Unlit (outside, in the void) this reads pure black regardless of albedo;
    // once the panels tilt into the room, the ceiling pools model their form.
    const doorFront = new THREE.MeshStandardMaterial({
      color: 0x26282a, roughness: 0.85, metalness: 0.08,
      emissive: 0xffffff, emissiveIntensity: 0,
    });
    doorFront.envMapIntensity = 0;
    const doorBack = reg(new THREE.MeshStandardMaterial({
      color: 0xdde1e4, roughness: 0.52, metalness: 0.18,
    }), 1.15);
    const doorEdge = reg(new THREE.MeshStandardMaterial({
      color: 0xcdd2d6, roughness: 0.6, metalness: 0.15,
    }), 0.5);
    const seal = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.95 });
    seal.shadowSide = THREE.DoubleSide;
    seal.envMapIntensity = 0;
    const strip = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.35, 1.35, 1.35),
      transparent: true, opacity: 0, toneMapped: false, depthWrite: false,
    });
    const extBlack = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0 });
    extBlack.shadowSide = THREE.DoubleSide;
    extBlack.envMapIntensity = 0;
    const ground = new THREE.MeshStandardMaterial({ color: 0x0a0b0c, roughness: 0.96, metalness: 0 });
    ground.envMapIntensity = 0;
    ground.dithering = true;
    const threshold = new THREE.MeshStandardMaterial({ color: 0x232629, roughness: 0.9, metalness: 0 });
    threshold.envMapIntensity = 0;
    threshold.dithering = true;
    // Jamb reveals sit outside the sealed door plane; safe to register now that
    // the env ramp is door-coupled (zero while sealed).
    const jamb = reg(new THREE.MeshStandardMaterial({ color: 0xe4e7ea, roughness: 0.8, metalness: 0.02 }), 0.9);
    const wall = reg(new THREE.MeshStandardMaterial({ color: 0xf2f3f4, roughness: 0.85, metalness: 0.0 }), 1.5);
    wall.shadowSide = THREE.DoubleSide;
    wall.dithering = true;
    const ceiling = reg(new THREE.MeshStandardMaterial({ color: 0xf4f5f6, roughness: 0.9, metalness: 0.0 }), 1.25);
    ceiling.dithering = true;
    const steelDark = reg(new THREE.MeshStandardMaterial({ color: 0x3a3e43, roughness: 0.5, metalness: 0.8 }), 0.4);
    const openerBox = reg(new THREE.MeshStandardMaterial({ color: 0x2c2f34, roughness: 0.7, metalness: 0.3 }), 0.35);
    const fixture = new THREE.MeshStandardMaterial({
      color: 0xf5f8fa, roughness: 0.4, metalness: 0.1,
      emissive: 0xf6f9fc, emissiveIntensity: 0,
    });
    reg(fixture, 0.8);

    // Car materials (used by placeholder + untextured meshes of the real model).
    // NOTE: anisotropy is poison here — with this GLB under the EffectComposer
    // it silently blacks out the whole frame. Brushed look comes from the
    // roughness streak map instead.
    const steel = reg(new THREE.MeshPhysicalMaterial({
      color: 0xb9bdbf, metalness: 1.0, roughness: 0.26,
    }), 1.45);
    const glass = reg(new THREE.MeshPhysicalMaterial({
      color: 0x11171c, metalness: 0.2, roughness: 0.06,
      transparent: true, opacity: 0.92,
    }), 1.2);
    const tire = reg(new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.92, metalness: 0 }), 0.3);
    const rim = reg(new THREE.MeshStandardMaterial({ color: 0x9da2a6, metalness: 1.0, roughness: 0.28 }), 1.15);
    const trim = reg(new THREE.MeshStandardMaterial({ color: 0x232527, roughness: 0.52, metalness: 0.25 }), 0.8);
    const lens = reg(new THREE.MeshStandardMaterial({ color: 0xb9bfc2, roughness: 0.08, metalness: 0.6 }), 1.1);
    const headlamp = reg(new THREE.MeshStandardMaterial({
      color: 0xaeb2b5, roughness: 0.12, metalness: 0.5,
      emissive: 0xfff0cd, emissiveIntensity: 0,
    }), 1.1);
    const openerLens = new THREE.MeshStandardMaterial({
      color: 0x2a2015, roughness: 0.3,
      emissive: 0xffc26e, emissiveIntensity: 0,
    });
    openerLens.envMapIntensity = 0;

    // headlight glare billboards (radial gradient, additive)
    const glareCanvas = document.createElement('canvas');
    glareCanvas.width = glareCanvas.height = 256;
    const gctx = glareCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255,246,224,1)');
    grad.addColorStop(0.25, 'rgba(255,238,200,0.55)');
    grad.addColorStop(0.6, 'rgba(255,230,180,0.12)');
    grad.addColorStop(1, 'rgba(255,230,180,0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 256, 256);
    const glare = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(glareCanvas),
      color: 0xfff2d0, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    });
    const tailLens = reg(new THREE.MeshStandardMaterial({ color: 0x4a0d0e, roughness: 0.18, metalness: 0.1 }), 0.9);
    const signalLens = reg(new THREE.MeshStandardMaterial({
      color: 0x6e4210, roughness: 0.18, metalness: 0.1,
      emissive: 0xff9a2a, emissiveIntensity: 0,
    }), 0.9);
    const carInterior = reg(new THREE.MeshStandardMaterial({ color: 0x232527, roughness: 0.85, metalness: 0 }), 0.35);

    return {
      envList, doorFront, doorBack, doorEdge, seal, strip, extBlack, ground,
      threshold, jamb, wall, ceiling, steelDark, openerBox, fixture,
      steel, glass, tire, rim, trim, lens, headlamp, openerLens, glare,
      tailLens, signalLens, carInterior,
    };
  }, []);
}

// Door panel: box with the +z face UVs remapped to this panel's slice of the
// full-slab atlas (shared emissive nameplate texture + normal maps).
function makePanelGeometry(i) {
  const h = DOOR.PANEL_H - DOOR.SEAM;
  const g = new THREE.BoxGeometry(DOOR.W, h, DOOR.SLAB_T);
  const uv = g.attributes.uv;
  const vLo = (i * DOOR.PANEL_H + DOOR.SEAM / 2) / DOOR.H;
  const vHi = ((i + 1) * DOOR.PANEL_H - DOOR.SEAM / 2) / DOOR.H;
  // +z face verts 16..19: (0,1),(1,1),(0,0),(1,0); -z face verts 20..23
  uv.setXY(16, 0, vHi); uv.setXY(17, 1, vHi); uv.setXY(18, 0, vLo); uv.setXY(19, 1, vLo);
  uv.setXY(20, 0, vHi); uv.setXY(21, 1, vHi); uv.setXY(22, 0, vLo); uv.setXY(23, 1, vLo);
  uv.needsUpdate = true;
  return g;
}

function Door({ mats, panelRefs }) {
  const geoms = useMemo(
    () => Array.from({ length: DOOR.PANELS }, (_, i) => makePanelGeometry(i)),
    []
  );
  const faceMats = useMemo(
    () => [mats.doorEdge, mats.doorEdge, mats.doorEdge, mats.doorEdge, mats.doorFront, mats.doorBack],
    [mats]
  );
  return (
    <>
      {geoms.map((g, i) => (
        <group key={i} ref={(el) => { panelRefs.current[i] = el; }}>
          <mesh geometry={g} material={faceMats} castShadow receiveShadow />
          {i === 0 && (
            <mesh position={[0, -(DOOR.PANEL_H - DOOR.SEAM) / 2 - 0.008, 0]} castShadow>
              <boxGeometry args={[DOOR.W, 0.018, DOOR.SLAB_T + 0.01]} />
              <primitive object={mats.seal} attach="material" />
            </mesh>
          )}
          {i < DOOR.PANELS - 1 && (
            <mesh position={[0, (DOOR.PANEL_H - DOOR.SEAM) / 2, DOOR.SLAB_T / 2 + 0.004]}>
              <planeGeometry args={[DOOR.OPEN_W, 0.009]} />
              <primitive object={mats.strip} attach="material" />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

// Front wall: vanta-black outside, white inside, jamb reveals + rubber seals.
function FrontWall({ mats }) {
  const extGeom = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-24, -1.5); s.lineTo(24, -1.5); s.lineTo(24, 14); s.lineTo(-24, 14); s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-DOOR.OPEN_W / 2, 0); hole.lineTo(DOOR.OPEN_W / 2, 0);
    hole.lineTo(DOOR.OPEN_W / 2, DOOR.OPEN_H); hole.lineTo(-DOOR.OPEN_W / 2, DOOR.OPEN_H);
    hole.closePath();
    s.holes.push(hole);
    return new THREE.ShapeGeometry(s);
  }, []);
  const intGeom = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-ROOM.W / 2, 0); s.lineTo(ROOM.W / 2, 0);
    s.lineTo(ROOM.W / 2, ROOM.H); s.lineTo(-ROOM.W / 2, ROOM.H); s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-DOOR.OPEN_W / 2, 0); hole.lineTo(DOOR.OPEN_W / 2, 0);
    hole.lineTo(DOOR.OPEN_W / 2, DOOR.OPEN_H); hole.lineTo(-DOOR.OPEN_W / 2, DOOR.OPEN_H);
    hole.closePath();
    s.holes.push(hole);
    return new THREE.ShapeGeometry(s);
  }, []);
  const W2 = DOOR.OPEN_W / 2, H = DOOR.OPEN_H;
  return (
    <>
      <mesh geometry={extGeom} material={mats.extBlack} position={[0, 0, 0.13]} castShadow />
      <mesh geometry={intGeom} material={mats.wall} position={[0, 0, -0.12]} rotation={[0, Math.PI, 0]} receiveShadow />
      {/* jamb reveals — kept behind the black facade plane so nothing white
          shows from outside; only the inner return surfaces catch light */}
      <mesh position={[-(W2 + 0.03), H / 2, -0.0075]} material={mats.jamb} receiveShadow>
        <boxGeometry args={[0.06, H + 0.06, 0.235]} />
      </mesh>
      <mesh position={[W2 + 0.03, H / 2, -0.0075]} material={mats.jamb} receiveShadow>
        <boxGeometry args={[0.06, H + 0.06, 0.235]} />
      </mesh>
      <mesh position={[0, H + 0.03, -0.0075]} material={mats.jamb} receiveShadow>
        <boxGeometry args={[DOOR.OPEN_W + 0.12, 0.06, 0.235]} />
      </mesh>
      {/* stop-moulding seals pressed against the door face */}
      <mesh position={[-(W2 - 0.008), H / 2, -0.122]} material={mats.seal} castShadow>
        <boxGeometry args={[0.016, H, 0.05]} />
      </mesh>
      <mesh position={[W2 - 0.008, H / 2, -0.122]} material={mats.seal} castShadow>
        <boxGeometry args={[0.016, H, 0.05]} />
      </mesh>
      <mesh position={[0, H - 0.008, -0.122]} material={mats.seal} castShadow>
        <boxGeometry args={[DOOR.OPEN_W, 0.016, 0.05]} />
      </mesh>
      {/* static outline glow strips (the "formed lines" living in 3D) */}
      <mesh position={[0, 0.006, -0.095]}>
        <planeGeometry args={[DOOR.OPEN_W, 0.01]} />
        <primitive object={mats.strip} attach="material" />
      </mesh>
      <mesh position={[0, H - 0.006, -0.095]}>
        <planeGeometry args={[DOOR.OPEN_W, 0.01]} />
        <primitive object={mats.strip} attach="material" />
      </mesh>
      <mesh position={[-(W2 - 0.005), H / 2, -0.095]}>
        <planeGeometry args={[0.01, H]} />
        <primitive object={mats.strip} attach="material" />
      </mesh>
      <mesh position={[W2 - 0.005, H / 2, -0.095]}>
        <planeGeometry args={[0.01, H]} />
        <primitive object={mats.strip} attach="material" />
      </mesh>
    </>
  );
}

function Room({ mats, floorRough, floorMatRef }) {
  const zc = -(ROOM.D / 2) - 0.12;
  return (
    <>
      {/* epoxy floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, zc]} receiveShadow>
        <planeGeometry args={[ROOM.W, ROOM.D]} />
        <MeshReflectorMaterial
          ref={floorMatRef}
          color="#c9c8c5"
          roughness={0.75}
          roughnessMap={floorRough}
          metalness={0.05}
          mirror={0.32}
          blur={[600, 200]}
          mixBlur={1}
          mixStrength={0.6}
          resolution={1024}
          depthScale={0.5}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
        />
      </mesh>
      <mesh position={[0, ROOM.H / 2, -ROOM.D - 0.12]} material={mats.wall} receiveShadow>
        <planeGeometry args={[ROOM.W, ROOM.H]} />
      </mesh>
      <mesh position={[-ROOM.W / 2, ROOM.H / 2, zc]} rotation-y={Math.PI / 2} material={mats.wall} receiveShadow>
        <planeGeometry args={[ROOM.D, ROOM.H]} />
      </mesh>
      <mesh position={[ROOM.W / 2, ROOM.H / 2, zc]} rotation-y={-Math.PI / 2} material={mats.wall} receiveShadow>
        <planeGeometry args={[ROOM.D, ROOM.H]} />
      </mesh>
      <mesh position={[0, ROOM.H, zc]} rotation-x={Math.PI / 2} material={mats.ceiling} receiveShadow>
        <planeGeometry args={[ROOM.W, ROOM.D]} />
      </mesh>

      {/* ceiling LED shop lights */}
      {[-1.7, -3.7].map((z) => (
        <group key={z} position={[0, ROOM.H - 0.05, z]}>
          <mesh material={mats.fixture}>
            <boxGeometry args={[1.55, 0.045, 0.15]} />
          </mesh>
          <mesh position={[0, 0.035, 0]} material={mats.openerBox}>
            <boxGeometry args={[1.4, 0.03, 0.1]} />
          </mesh>
        </group>
      ))}

      {/* door hardware: side tracks, torsion bar + springs, opener + rail */}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <mesh position={[sx * (DOOR.OPEN_W / 2 + 0.07), DOOR.CURVE_Y / 2, DOOR.PLANE_Z]} material={mats.steelDark} castShadow>
            <boxGeometry args={[0.028, DOOR.CURVE_Y, 0.055]} />
          </mesh>
          <mesh
            position={[sx * (DOOR.OPEN_W / 2 + 0.07), DOOR.CURVE_Y + DOOR.R, DOOR.PLANE_Z - DOOR.R - 1.1]}
            material={mats.steelDark}
            castShadow
          >
            <boxGeometry args={[0.028, 0.055, 2.2]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, DOOR.OPEN_H + 0.14, -0.3]} rotation-z={Math.PI / 2} material={mats.steelDark} castShadow>
        <cylinderGeometry args={[0.013, 0.013, DOOR.OPEN_W + 0.2, 10]} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, DOOR.OPEN_H + 0.14, -0.3]} rotation-z={Math.PI / 2} material={mats.steelDark} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.75, 12]} />
        </mesh>
      ))}
      <mesh position={[0, 2.52, -1.9]} material={mats.steelDark} castShadow>
        <boxGeometry args={[0.045, 0.07, 3.1]} />
      </mesh>
      <mesh position={[0, 2.42, -3.3]} material={mats.openerBox} castShadow>
        <boxGeometry args={[0.5, 0.19, 0.38]} />
      </mesh>
      {/* the opener's amber service-lamp lens */}
      <mesh position={[0, 2.42, -3.1]} material={mats.openerLens}>
        <boxGeometry args={[0.14, 0.1, 0.02]} />
      </mesh>
    </>
  );
}

function Outside({ mats }) {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 12.1]} material={mats.ground} receiveShadow>
        <planeGeometry args={[60, 24]} />
      </mesh>
      <mesh position={[0, -0.006, 0.16]} material={mats.threshold} receiveShadow>
        <boxGeometry args={[DOOR.OPEN_W + 0.5, 0.012, 0.62]} />
      </mesh>
    </>
  );
}

function applyCarMaterials(root, mats) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const label = `${o.name} ${o.material?.name || ''}`.toLowerCase();
    const hasTexture = !!o.material?.map;
    if (CAR.keepTexturedMaterials && hasTexture) {
      o.material = o.material.clone();
      o.material.envMapIntensity = 0;
      o.material.userData.envBase = 1.1;
      mats.envList.push(o.material);
      return;
    }
    if (/glass|wind|wshield|shield/.test(label)) o.material = mats.glass;
    else if (/tire|tyre|rubber/.test(label)) o.material = mats.tire;
    else if (/wheel|rim|hub|alloy/.test(label)) o.material = mats.rim;
    else if (/taillight/.test(label)) o.material = mats.tailLens;
    else if (/signal/.test(label)) o.material = mats.signalLens;
    else if (/headlight/.test(label)) o.material = mats.headlamp;
    else if (/light|lamp|lens|indicator/.test(label)) o.material = mats.lens;
    else if (/seat|dash|cockpit|cabin|interior|steering/.test(label)) o.material = mats.carInterior;
    else if (/trim|bumper|grill|fascia|louv|vent|plate|black|base|under|chassis/.test(label)) o.material = mats.trim;
    else o.material = mats.steel;
  });
}

class CarBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function CarModel({ mats, headLRef, headRRef }) {
  const { scene } = useGLTF(CAR.url);
  // Clone before mutating — useGLTF caches the scene, and mutating the cached
  // graph breaks the page on navigate-away-and-back.
  const prepared = useMemo(() => {
    const root = scene.clone(true);
    applyCarMaterials(root, mats);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const len = Math.max(size.x, size.z);
    const s = CAR.targetLength / len;
    root.scale.setScalar(s);
    box.setFromObject(root);
    const c = box.getCenter(new THREE.Vector3());
    root.position.x -= c.x;
    root.position.z -= c.z;
    root.position.y -= box.min.y;
    const holder = new THREE.Group();
    holder.add(root);
    return holder;
  }, [scene, mats]);

  // Beam origins in normalized car space (car is scaled to 4.22m long,
  // grounded, centered, nose at +z ≈ 2.05). Derived visually — the mesh
  // bounding boxes report through a stale transform chain and can't be trusted.
  const anchors = useMemo(() => ({
    L: new THREE.Vector3(-0.56, 0.63, 2.0),
    R: new THREE.Vector3(0.56, 0.63, 2.0),
  }), []);
  const targets = useMemo(() => ({ L: new THREE.Object3D(), R: new THREE.Object3D() }), []);

  useEffect(() => {
    if (!Q.has('debug')) return;
    const meshes = [];
    prepared.traverse((o) => {
      if (o.isMesh) {
        const b = new THREE.Box3().setFromObject(o);
        meshes.push({
          name: o.name,
          isHeadlamp: o.material === mats.headlamp,
          box: [b.min, b.max].map((v) => v.toArray().map((n) => +n.toFixed(2))),
        });
      }
    });
    window.__dlCar = meshes;
  }, [prepared, mats]);

  return (
    <group position={CAR.pos} rotation-y={CAR.yaw}>
      <primitive object={prepared} />
      {anchors && !Q.has('nohead') && ['L', 'R'].map((k) => (
        <group key={k}>
          <spotLight
            ref={k === 'L' ? headLRef : headRRef}
            position={anchors[k].toArray()}
            angle={0.36} penumbra={0.8} decay={2} intensity={0}
            color="#ffeecb"
            target={targets[k]}
          />
          {/* aimed slightly toward the camera axis so the beam pools stay in frame */}
          <primitive
            object={targets[k]}
            position={[anchors[k].x * 0.8 - 0.55, 0.3, anchors[k].z + 9]}
          />
          <sprite
            position={[anchors[k].x, anchors[k].y, anchors[k].z + 0.07]}
            scale={[0.72, 0.44, 1]}
            material={mats.glare}
          />
        </group>
      ))}
    </group>
  );
}

function PlaceholderCar({ mats }) {
  return (
    <group position={CAR.pos} rotation-y={CAR.yaw}>
      <mesh position={[0, 0.53, 0]} material={mats.steel} castShadow receiveShadow>
        <boxGeometry args={[1.85, 0.5, 4.2]} />
      </mesh>
      <mesh position={[0, 0.95, 0.25]} material={mats.glass} castShadow>
        <boxGeometry args={[1.66, 0.4, 1.9]} />
      </mesh>
      <mesh position={[0, 0.62, -2.0]} material={mats.trim} castShadow>
        <boxGeometry args={[1.8, 0.3, 0.3]} />
      </mesh>
      {[[-0.83, 1.32], [0.83, 1.32], [-0.83, -1.32], [0.83, -1.32]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.32, z]} rotation-z={Math.PI / 2} material={mats.tire} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.23, 24]} />
        </mesh>
      ))}
    </group>
  );
}

// Per-frame conductor: everything is a function of t.
function Rig({
  mats, timing, doorGroupRef, panelRefs, spillRef, keyRef, floorMatRef,
  poolARef, poolBRef, poolCRef, openerRef, headLRef, headRRef,
}) {
  const { gl, camera, size, scene } = useThree();
  const dbg = useMemo(
    () => new URLSearchParams(window.location.search).has('debug'),
    []
  );
  useFrame(() => {
    if (dbg) {
      window.__dlCam = {
        z: +camera.position.z.toFixed(3),
        fov: camera.fov,
        sizeW: size.width,
        sizeH: size.height,
        t: +(timing.freezeT != null ? timing.freezeT
          : timing.start == null ? 0 : (performance.now() - timing.start) / 1000).toFixed(2),
        d: +doorTravel(timing.freezeT ?? 0).toFixed(3),
        L: +mainLights(timing.freezeT ?? 0, doorTravel(timing.freezeT ?? 0) / DOOR.TRAVEL).toFixed(3),
        spill: spillRef.current ? +spillRef.current.intensity.toFixed(1) : null,
        stripOp: +mats.strip.opacity.toFixed(3),
        emissive: +mats.doorFront.emissiveIntensity.toFixed(2),
        hasEmisMap: !!mats.doorFront.emissiveMap,
        panelY: panelRefs.current[0] ? +panelRefs.current[0].position.y.toFixed(3) : null,
        glareOp: +mats.glare.opacity.toFixed(2),
        sprites: (() => {
          const out = [];
          scene.traverse((o) => {
            if (o.isSprite) {
              const w = o.getWorldPosition(new THREE.Vector3());
              out.push([+w.x.toFixed(2), +w.y.toFixed(2), +w.z.toFixed(2), o.visible]);
            }
          });
          return out;
        })(),
      };
    }
    const t = timing.freezeT != null
      ? timing.freezeT
      : timing.start == null ? 0 : (performance.now() - timing.start) / 1000;
    const d = doorTravel(t);
    const f = d / DOOR.TRAVEL;
    const L = mainLights(t, f); // interior level rides the door position
    const oL = openerLamp(t);
    const H = headlampLevel(t);
    const moving = d > 0.001 && d < DOOR.TRAVEL - 0.001;

    if (doorGroupRef.current) {
      let jy = 0;
      if (t >= TL.motorStart && t < TL.openStart) {
        const u = clamp01((t - TL.motorStart) / (TL.openStart - TL.motorStart));
        jy = 0.0035 * Math.sin((t - TL.motorStart) * 72) * Math.sin(Math.PI * u);
      }
      if (moving) jy += 0.0011 * Math.sin(t * 47);
      doorGroupRef.current.position.y = DOOR.BOTTOM_GAP + jy;
    }
    panelRefs.current.forEach((g, i) => {
      if (!g) return;
      const s = d + i * DOOR.PANEL_H;
      const lo = trackPoint(s);
      const hi = trackPoint(s + DOOR.PANEL_H);
      g.position.set(0, (lo.y + hi.y) / 2, DOOR.PLANE_Z + (lo.z + hi.z) / 2);
      let rx = Math.atan2(hi.z - lo.z, hi.y - lo.y);
      if (moving) rx += 0.005 * Math.sin(t * (39 + i * 7) + i * 2.1);
      g.rotation.x = rx;
    });

    // Nameplate: emissive while it's "the page", dimming as the door rises so
    // the glyphs stop reading as backlit acrylic (they stay legible as paint).
    const textLevel = 1 - 0.6 * smoothstep(TL.openStart + 0.4, TL.openStart + 2.6, t);
    mats.doorFront.emissiveIntensity =
      t >= TL.motorStart && mats.doorFront.emissiveMap ? textLevel : 0;
    const sIn = smoothstep(TL.motorStart, TL.motorStart + 0.14, t);
    const sOut = 1 - smoothstep(3.5, 4.4, t);
    mats.strip.opacity = 0.95 * sIn * sOut;

    if (spillRef.current) spillRef.current.intensity = 230 * L;
    if (keyRef.current) keyRef.current.intensity = 34 * L;
    if (poolARef.current) poolARef.current.intensity = 13 * L;
    if (poolBRef.current) poolBRef.current.intensity = 13 * L;
    if (poolCRef.current) poolCRef.current.intensity = 8 * L;
    // opener lamp hands off to the mains as they rise
    const oHand = oL * (1 - 0.75 * L);
    if (openerRef.current) openerRef.current.intensity = 6.5 * oHand;
    if (headLRef.current) headLRef.current.intensity = 26 * H;
    if (headRRef.current) headRRef.current.intensity = 26 * H;
    mats.headlamp.emissiveIntensity = 9 * H;
    mats.glare.opacity = Math.min(1, 1.15 * H);
    mats.signalLens.emissiveIntensity = 0.85 * H;
    mats.openerLens.emissiveIntensity = 2.2 * oHand;
    mats.fixture.emissiveIntensity = 3.2 * L;
    mats.envList.forEach((m) => { m.envMapIntensity = m.userData.envBase * L; });
    if (floorMatRef.current) floorMatRef.current.envMapIntensity = 0.85 * L;

    // camera holds, then opens up slightly as the room floods in
    gl.toneMappingExposure = 1.0 + 0.12 * smoothstep(0.08, 0.6, f);
  });
  return null;
}

export default function GarageScene({ measure, timing, modelOk }) {
  const mats = useSceneMaterials();
  const doorGroupRef = useRef();
  const panelRefs = useRef([]);
  const spillRef = useRef();
  const keyRef = useRef();
  const poolARef = useRef();
  const poolBRef = useRef();
  const poolCRef = useRef();
  const openerRef = useRef();
  const headLRef = useRef();
  const headRRef = useRef();
  const floorMatRef = useRef();
  const spillTgt = useMemo(() => new THREE.Object3D(), []);
  const keyTgt = useMemo(() => new THREE.Object3D(), []);
  const [floorRough] = useState(() => buildFloorRoughness());

  // Heavy canvas bakes. Normal maps once; the nameplate texture re-bakes per
  // measure (resize/font-settle) and must dispose its predecessor.
  useEffect(() => {
    const ext = buildExteriorNormal();
    const int_ = buildInteriorNormal();
    const brushed = buildBrushedRoughness();
    mats.doorFront.normalMap = ext;
    mats.doorFront.normalScale = new THREE.Vector2(0.7, 0.7);
    mats.doorBack.normalMap = int_;
    mats.doorBack.normalScale = new THREE.Vector2(0.8, 0.8);
    mats.steel.roughnessMap = brushed;
    mats.doorFront.needsUpdate = true;
    mats.doorBack.needsUpdate = true;
    mats.steel.needsUpdate = true;
    return () => { ext.dispose(); int_.dispose(); brushed.dispose(); };
  }, [mats]);

  useEffect(() => {
    let dead = false;
    buildDoorFaceTexture(
      measure.calib, measure.nameRect, measure.subRect,
      measure.nameFontPx, measure.subFontPx
    ).then((tex) => {
      if (dead) { tex.dispose(); return; }
      const old = mats.doorFront.emissiveMap;
      mats.doorFront.emissiveMap = tex;
      mats.doorFront.needsUpdate = true;
      if (old) old.dispose();
    });
    return () => { dead = true; };
  }, [mats, measure]);

  useEffect(() => {
    if (modelOk) useGLTF.preload(CAR.url);
  }, [modelOk]);

  return (
    <>
      <PerspectiveCamera makeDefault fov={CAM_FOV} position={[0, CAM_Y, measure.calib.camZ]} />
      <color attach="background" args={['#000000']} />

      <group ref={doorGroupRef}>
        <Door mats={mats} panelRefs={panelRefs} />
      </group>
      <FrontWall mats={mats} />
      <Room mats={mats} floorRough={floorRough} floorMatRef={floorMatRef} />
      <Outside mats={mats} />

      {modelOk && !Q.has('nocar') ? (
        <Suspense fallback={null}>
          <CarBoundary fallback={<PlaceholderCar mats={mats} />}>
            <CarModel mats={mats} headLRef={headLRef} headRRef={headRRef} />
          </CarBoundary>
        </Suspense>
      ) : (
        <PlaceholderCar mats={mats} />
      )}
      <ContactShadows
        position={[CAR.pos[0], 0.001, CAR.pos[2]]}
        opacity={0.62} scale={7} blur={2.4} far={1.15} resolution={512}
      />

      {/* interior light rig — intensities all driven by Rig */}
      <spotLight
        ref={spillRef}
        position={[0, 2.3, -0.5]}
        angle={0.55} penumbra={0.8} decay={2} intensity={0}
        castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.3} shadow-camera-far={12}
        shadow-bias={-0.00035} shadow-normalBias={0.02}
        target={spillTgt}
      />
      <primitive object={spillTgt} position={[0, 0, 1.1]} />
      {/* key co-located with the front fixture so the car's shadow matches
          the light the eye can actually see */}
      <spotLight
        ref={keyRef}
        position={[0.4, 2.45, -1.75]}
        angle={0.75} penumbra={1} decay={2} intensity={0}
        castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-bias={-0.0004} shadow-normalBias={0.02}
        target={keyTgt}
      />
      <primitive object={keyTgt} position={[-0.1, 0.45, -3.2]} />
      {/* local pools from the shop lights — distance-limited so nothing leaks outside */}
      {!Q.has('nopools') && (
        <>
          <pointLight ref={poolARef} color="#eef3f8" position={[0, 2.45, -1.7]} intensity={0} distance={3.8} decay={2} />
          <pointLight ref={poolBRef} color="#eef3f8" position={[0, 2.45, -3.7]} intensity={0} distance={3.8} decay={2} />
          <pointLight ref={poolCRef} color="#eef3f8" position={[0, 2.2, -5.6]} intensity={0} distance={3.4} decay={2} />
          {/* opener service lamp — warm, dim, first thing to wake */}
          <pointLight ref={openerRef} color="#ffc98a" position={[0, 2.32, -3.05]} intensity={0} distance={4.5} decay={2} />
        </>
      )}

      <Environment frames={1} resolution={256}>
        <Lightformer intensity={7} rotation-x={Math.PI / 2} position={[0, 3, -1.7]} scale={[1.6, 0.3, 1]} />
        <Lightformer intensity={7} rotation-x={Math.PI / 2} position={[0, 3, -3.7]} scale={[1.6, 0.3, 1]} />
        <Lightformer intensity={1.9} color="#eef1f4" rotation-y={Math.PI / 2} position={[-4, 1.3, -2.5]} scale={[5, 2.4, 1]} />
        <Lightformer intensity={1.9} color="#eef1f4" rotation-y={-Math.PI / 2} position={[4, 1.3, -2.5]} scale={[5, 2.4, 1]} />
        <Lightformer intensity={2.4} color="#e8ebee" position={[0, 1.3, -6]} scale={[6, 2.4, 1]} />
        <Lightformer intensity={0.6} color="#9aa0a5" rotation-x={-Math.PI / 2} position={[0, -0.5, -2.5]} scale={[6, 4, 1]} />
      </Environment>

      <Rig
        mats={mats} timing={timing}
        doorGroupRef={doorGroupRef} panelRefs={panelRefs}
        spillRef={spillRef} keyRef={keyRef} floorMatRef={floorMatRef}
        poolARef={poolARef} poolBRef={poolBRef} poolCRef={poolCRef}
        openerRef={openerRef} headLRef={headLRef} headRRef={headRRef}
      />

      {!new URLSearchParams(window.location.search).has('nofx') && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.58} luminanceThreshold={1.05} luminanceSmoothing={0.1} radius={0.8} />
        </EffectComposer>
      )}
    </>
  );
}
