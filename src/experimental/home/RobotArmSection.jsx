import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Mail, Linkedin, Github, FileText } from 'lucide-react';

/* --- Robot Arm Joint --- */
const RobotJoint = ({ args, rotation = [0, 0, 0], color = '#000000' }) => (
  <mesh rotation={rotation}>
    <cylinderGeometry args={args} />
    <meshPhongMaterial color={color} shininess={90} specular="#666" />
  </mesh>
);

/* --- Robot Arm Segment --- */
const RobotSegment = ({ length, radius = 0.08, color = '#f5f5f5' }) => (
  <mesh position={[0, length / 2, 0]}>
    <capsuleGeometry args={[radius, length, 4, 12]} />
    <meshPhongMaterial color={color} shininess={60} specular="#555" />
  </mesh>
);

/* --- Panda-style Robot Arm --- */
const PandaArm = ({ targetRef, endEffectorRef }) => {
  const baseRef = useRef();
  const shoulder = useRef();
  const elbow = useRef();
  const wrist = useRef();
  const gripperRef = useRef();
  const shoulderBaseY = 0.24;

  // Start with a reasonable forward-reaching position
  const smoothTarget = useRef(new THREE.Vector3(1, 1, 1));

  useFrame((_, delta) => {
    if (!targetRef.current) return;

    smoothTarget.current.lerp(targetRef.current, 5 * delta);
    const t = smoothTarget.current;

    // Base yaw — rotate entire arm to face the target in the XZ plane
    const baseAngle = Math.atan2(t.x, t.z);
    if (baseRef.current) {
      baseRef.current.rotation.y = THREE.MathUtils.lerp(baseRef.current.rotation.y, baseAngle, 5 * delta);
    }

    // IK in the plane of the arm (radial distance from base axis, vertical height)
    const horizDist = Math.sqrt(t.x * t.x + t.z * t.z);
    const vertDist = t.y - shoulderBaseY; // height relative to shoulder
    const dist = Math.sqrt(horizDist * horizDist + vertDist * vertDist);

    const L1 = 1.2; // upper arm
    const L2 = 1.0; // forearm
    const maxReach = L1 + L2 - 0.05;
    const reach = Math.max(0.3, Math.min(dist, maxReach));

    // Law of cosines for elbow angle
    const cosElbow = THREE.MathUtils.clamp(
      (L1 * L1 + L2 * L2 - reach * reach) / (2 * L1 * L2), -1, 1
    );
    const elbowBend = Math.acos(cosElbow); // angle at elbow joint (0 = straight)

    // Shoulder angle: angle to target + offset for triangle
    const cosShoulderOffset = THREE.MathUtils.clamp(
      (L1 * L1 + reach * reach - L2 * L2) / (2 * L1 * reach), -1, 1
    );
    const shoulderOffset = Math.acos(cosShoulderOffset);
    const angleToTarget = Math.atan2(vertDist, horizDist);

    // Shoulder rotates in the arm's local Z plane (pitch forward/back)
    // 0 = pointing up, PI/2 = pointing forward, PI = pointing down
    const shoulderPitch = Math.PI / 2 - (angleToTarget + shoulderOffset);
    // Elbow bends inward
    const elbowPitch = Math.PI - elbowBend;

    if (shoulder.current) {
      shoulder.current.rotation.x = THREE.MathUtils.lerp(
        shoulder.current.rotation.x, shoulderPitch, 5 * delta
      );
    }
    if (elbow.current) {
      elbow.current.rotation.x = THREE.MathUtils.lerp(
        elbow.current.rotation.x, elbowPitch, 5 * delta
      );
    }
    // Wrist compensates to keep gripper pointing horizontally (total rotation = PI/2)
    if (wrist.current) {
      const sh = shoulder.current ? shoulder.current.rotation.x : 0;
      const el = elbow.current ? elbow.current.rotation.x : 0;
      const wristTarget = Math.PI / 2 - sh - el;
      wrist.current.rotation.x = THREE.MathUtils.lerp(wrist.current.rotation.x, wristTarget, 5 * delta);
    }

    if (endEffectorRef?.current && gripperRef.current) {
      gripperRef.current.getWorldPosition(endEffectorRef.current);
    }
  });

  const jointColor = '#000000';
  const armColor = '#f0f0f0';

  return (
    <group position={[0, 0, 0]}>
      {/* Base plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 16]} />
        <meshPhongMaterial color="#333" shininess={90} specular="#444" />
      </mesh>
      {/* Base column */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.16, 16]} />
        <meshPhongMaterial color={armColor} shininess={60} specular="#555" />
      </mesh>
      {/* Rotating base (yaw) */}
      <group ref={baseRef} position={[0, shoulderBaseY, 0]}>
        {/* Base rotates around Y, so keep cylinder on Y axis */}
        <RobotJoint args={[0.085, 0.085, 0.22, 20]} color={jointColor} />

        {/* Shoulder pivot (pitch) */}
        <group ref={shoulder}>
          {/* Shoulder rotates around X, so joint cylinder is aligned to X */}
          <RobotJoint args={[0.07, 0.07, 0.22, 20]} rotation={[0, 0, Math.PI / 2]} color={jointColor} />
          <RobotSegment length={1.2} radius={0.09} color={armColor} />

          {/* Elbow pivot (pitch) */}
          <group ref={elbow} position={[0, 1.2, 0]}>
            <RobotJoint args={[0.062, 0.062, 0.19, 18]} rotation={[0, 0, Math.PI / 2]} color={jointColor} />
            <RobotSegment length={1.0} radius={0.07} color={armColor} />

            {/* Wrist pivot (pitch) */}
            <group ref={wrist} position={[0, 1.0, 0]}>
              <RobotJoint args={[0.052, 0.052, 0.16, 16]} rotation={[0, 0, Math.PI / 2]} color={jointColor} />
              {/* Gripper */}
              <group ref={gripperRef} position={[0, 0.12, 0]}>
                <mesh>
                  <boxGeometry args={[0.18, 0.06, 0.12]} />
                  <meshPhongMaterial color={jointColor} shininess={80} />
                </mesh>
                <mesh position={[-0.06, 0.08, 0]}>
                  <boxGeometry args={[0.03, 0.12, 0.08]} />
                  <meshPhongMaterial color={armColor} shininess={60} />
                </mesh>
                <mesh position={[0.06, 0.08, 0]}>
                  <boxGeometry args={[0.03, 0.12, 0.08]} />
                  <meshPhongMaterial color={armColor} shininess={60} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/* --- Cursor tracker — maps screen position directly to target around the robot --- */
const CursorTracker = ({ mouseRef, targetRef }) => {
  const { camera } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const interactionPlaneRef = useRef(new THREE.Plane());
  const planeNormalRef = useRef(new THREE.Vector3());
  const hitPointRef = useRef(new THREE.Vector3());
  const planeAnchorRef = useRef(new THREE.Vector3(0, 1.0, 0.9));

  useFrame(() => {
    if (!mouseRef.current) return;

    const { x: ndcX, y: ndcY } = mouseRef.current;
    const raycaster = raycasterRef.current;
    const interactionPlane = interactionPlaneRef.current;
    const planeNormal = planeNormalRef.current;
    const hitPoint = hitPointRef.current;

    camera.getWorldDirection(planeNormal);
    interactionPlane.setFromNormalAndCoplanarPoint(planeNormal, planeAnchorRef.current);
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);

    if (!raycaster.ray.intersectPlane(interactionPlane, hitPoint)) return;

    hitPoint.x = THREE.MathUtils.clamp(hitPoint.x, -1.45, 1.45);
    hitPoint.y = THREE.MathUtils.clamp(hitPoint.y, 0.25, 1.85);
    hitPoint.z = THREE.MathUtils.clamp(hitPoint.z, 0.2, 1.9);

    const radial = Math.hypot(hitPoint.x, hitPoint.z);
    const clampedRadial = THREE.MathUtils.clamp(radial, 0.35, 1.9);
    if (radial > 1e-5 && clampedRadial !== radial) {
      const scale = clampedRadial / radial;
      hitPoint.x *= scale;
      hitPoint.z *= scale;
    }

    if (!targetRef.current) targetRef.current = new THREE.Vector3();
    targetRef.current.copy(hitPoint);
  });

  return null;
};

/* --- Wooden Table --- */
const WoodenTable = () => {
  const woodColor = '#c4a882';
  const woodDark = '#a08060';
  const legPositions = [
    [-1.3, -0.4, -0.6],
    [1.3, -0.4, -0.6],
    [-1.3, -0.4, 0.6],
    [1.3, -0.4, 0.6],
  ];

  return (
    <group position={[0, -0.05, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[3.2, 0.1, 1.8]} />
        <meshPhongMaterial color={woodColor} shininess={30} specular="#886644" />
      </mesh>
      {legPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshPhongMaterial color={woodDark} shininess={20} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.22, 0.02, 1.82]} />
        <meshPhongMaterial color={woodDark} shininess={15} />
      </mesh>
    </group>
  );
};

/* --- Table props with lightweight collision response --- */
const TableProps = ({ endEffectorRef }) => {
  const itemRefs = useRef([]);

  const itemDefs = useMemo(() => ([
    {
      id: 'book-bottom',
      type: 'book',
      base: [0.88, 0.06, 0.54],
      size: [0.56, 0.096, 0.34],
      color: '#8f3e36',
      pageColor: '#e7dccb',
      hitRadius: 0.3,
      stability: 0.92,
      maxFall: 1.2,
      baseRotY: -0.14,
    },
    {
      id: 'book-middle',
      type: 'book',
      base: [0.91, 0.16, 0.52],
      size: [0.5, 0.09, 0.3],
      color: '#3b587b',
      pageColor: '#e8e1d4',
      hitRadius: 0.28,
      stability: 0.88,
      maxFall: 1.15,
      baseRotY: -0.08,
    },
    {
      id: 'book-top',
      type: 'book',
      base: [0.94, 0.256, 0.5],
      size: [0.46, 0.088, 0.29],
      color: '#446045',
      pageColor: '#e7e0d2',
      hitRadius: 0.26,
      stability: 0.84,
      maxFall: 1.1,
      baseRotY: -0.2,
    },
    {
      id: 'plant',
      type: 'plant',
      base: [1.38, 0.13, 0.73],
      hitRadius: 0.38,
      stability: 0.6,
      maxFall: 1.35,
      baseRotY: 0.08,
    },
  ]), []);

  const itemStateRef = useRef([]);
  const supportEulerRef = useRef(new THREE.Euler(0, 0, 0, 'XYZ'));
  const supportMatrixRef = useRef(new THREE.Matrix4());
  if (itemStateRef.current.length !== itemDefs.length) {
    itemStateRef.current = itemDefs.map((def) => ({
      x: def.base[0],
      y: def.base[1],
      z: def.base[2],
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      avX: 0,
      avZ: 0,
      impact: 0,
      fallen: false,
      offTable: false,
      fallX: 0,
      fallZ: 0,
    }));
  }

  useFrame((_, delta) => {
    const endEffector = endEffectorRef?.current;
    const tableEdgeX = 1.58;
    const tableEdgeZ = 0.88;
    const tableTopY = 0.01;
    const floorY = -0.5;

    itemDefs.forEach((def, i) => {
      const s = itemStateRef.current[i];
      const colliderY = def.type === 'plant' ? s.y + 0.14 : s.y + def.size[1] * 0.5;

      if (endEffector) {
        const dx = s.x - endEffector.x;
        const dz = s.z - endEffector.z;
        const horizontalDist = Math.hypot(dx, dz);
        const verticalDist = Math.abs(colliderY - endEffector.y);

        if (horizontalDist < def.hitRadius && verticalDist < 0.56) {
          const force = (1 - horizontalDist / def.hitRadius) * (1 - verticalDist / 0.56);
          const invLen = horizontalDist > 1e-5 ? 1 / horizontalDist : 0;
          const pushX = horizontalDist > 1e-5 ? dx * invLen : (Math.random() > 0.5 ? 1 : -1);
          const pushZ = horizontalDist > 1e-5 ? dz * invLen : 1;
          const pushStrength = def.type === 'plant' ? 0.62 : 0.5;

          s.vx += pushX * force * pushStrength;
          s.vz += pushZ * force * pushStrength;
          s.avX += pushZ * force * 3.2;
          s.avZ += -pushX * force * 3.2;
          s.rotY += (Math.random() - 0.5) * force * 0.08;
          s.impact = Math.min(2.5, s.impact + force * 1.5);

          if (!s.fallen && s.impact > def.stability) {
            s.fallen = true;
            s.fallX = THREE.MathUtils.clamp(pushZ * def.maxFall, -def.maxFall, def.maxFall);
            s.fallZ = THREE.MathUtils.clamp(-pushX * def.maxFall, -def.maxFall, def.maxFall);
          }
        }
      }

      s.impact = Math.max(0, s.impact - delta * 0.65);

      const targetX = s.fallen ? s.fallX : 0;
      const targetZ = s.fallen ? s.fallZ : 0;
      s.avX += (targetX - s.rotX) * delta * (s.fallen ? 5.5 : 8.5);
      s.avZ += (targetZ - s.rotZ) * delta * (s.fallen ? 5.5 : 8.5);
      s.avX *= Math.exp(-5.5 * delta);
      s.avZ *= Math.exp(-5.5 * delta);
      s.rotX += s.avX * delta;
      s.rotZ += s.avZ * delta;

      if (!s.offTable) {
        const halfX = def.type === 'plant' ? 0.14 : def.size[0] * 0.5;
        const halfZ = def.type === 'plant' ? 0.14 : def.size[2] * 0.5;
        const overX = Math.abs(s.x) + halfX > tableEdgeX;
        const overZ = Math.abs(s.z) + halfZ > tableEdgeZ;

        if (overX || overZ) {
          s.offTable = true;
          s.fallen = true;
          s.vy = Math.min(s.vy, -0.22);

          if (overX) {
            const outwardX = Math.sign(s.x) || 1;
            s.vx += outwardX * 0.22;
            s.fallZ += -outwardX * 0.35;
          }
          if (overZ) {
            const outwardZ = Math.sign(s.z) || 1;
            s.vz += outwardZ * 0.22;
            s.fallX += outwardZ * 0.35;
          }
        }
      }

      s.vx *= Math.exp(-(s.offTable ? 2.5 : 8) * delta);
      s.vz *= Math.exp(-(s.offTable ? 2.5 : 8) * delta);
      s.x += s.vx * delta;
      s.z += s.vz * delta;

      if (s.offTable) {
        s.vy -= 3.8 * delta;
        s.y += s.vy * delta;
        if (s.y < floorY) {
          s.y = floorY;
          s.vy = 0;
          s.vx *= Math.exp(-12 * delta);
          s.vz *= Math.exp(-12 * delta);
        }
      } else {
        const hx = def.type === 'book' ? def.size[0] * 0.5 : 0.16;
        const hy = def.type === 'book' ? def.size[1] * 0.5 : 0.22;
        const hz = def.type === 'book' ? def.size[2] * 0.5 : 0.16;
        const euler = supportEulerRef.current;
        const matrix = supportMatrixRef.current;
        euler.set(s.rotX, def.baseRotY + s.rotY, s.rotZ);
        matrix.makeRotationFromEuler(euler);
        const m = matrix.elements;
        const supportHalfY = Math.abs(m[1]) * hx + Math.abs(m[5]) * hy + Math.abs(m[9]) * hz;
        const minCenterY = tableTopY + supportHalfY + 0.001;
        s.y = Math.max(def.base[1], minCenterY);
      }

      if (!s.fallen) {
        s.x = THREE.MathUtils.lerp(s.x, def.base[0], 4 * delta);
        s.z = THREE.MathUtils.lerp(s.z, def.base[2], 4 * delta);
      }
    });

    // Prevent props from interpenetrating while on-table.
    for (let i = 0; i < itemDefs.length; i++) {
      const aDef = itemDefs[i];
      const a = itemStateRef.current[i];
      if (a.offTable) continue;

      const aCenterY = aDef.type === 'book' ? a.y : a.y + 0.16;
      const aHalfH = aDef.type === 'book' ? aDef.size[1] * 0.5 + 0.008 : 0.3;
      const aRadius = aDef.type === 'book' ? Math.max(aDef.size[0], aDef.size[2]) * 0.42 : 0.24;

      for (let j = i + 1; j < itemDefs.length; j++) {
        const bDef = itemDefs[j];
        const b = itemStateRef.current[j];
        if (b.offTable) continue;

        const bCenterY = bDef.type === 'book' ? b.y : b.y + 0.16;
        const bHalfH = bDef.type === 'book' ? bDef.size[1] * 0.5 + 0.008 : 0.3;
        const bRadius = bDef.type === 'book' ? Math.max(bDef.size[0], bDef.size[2]) * 0.42 : 0.24;

        const verticalOverlap = aHalfH + bHalfH - Math.abs(aCenterY - bCenterY);
        if (verticalOverlap <= 0.01) continue;

        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const dist = Math.hypot(dx, dz);
        const minDist = aRadius + bRadius;
        if (dist >= minDist) continue;

        const nx = dist > 1e-5 ? dx / dist : 1;
        const nz = dist > 1e-5 ? dz / dist : 0;
        const penetration = minDist - dist;
        const push = penetration * 0.5 + 0.0005;

        a.x -= nx * push;
        a.z -= nz * push;
        b.x += nx * push;
        b.z += nz * push;

        const relVx = b.vx - a.vx;
        const relVz = b.vz - a.vz;
        const relAlongNormal = relVx * nx + relVz * nz;
        if (relAlongNormal < 0) {
          const impulse = -relAlongNormal * 0.32;
          a.vx -= nx * impulse;
          a.vz -= nz * impulse;
          b.vx += nx * impulse;
          b.vz += nz * impulse;
        }

        a.avX += nz * penetration * 1.2;
        a.avZ += -nx * penetration * 1.2;
        b.avX -= nz * penetration * 1.2;
        b.avZ -= -nx * penetration * 1.2;
      }
    }

    itemDefs.forEach((def, i) => {
      const s = itemStateRef.current[i];
      s.x = THREE.MathUtils.clamp(s.x, -2.2, 2.2);
      s.z = THREE.MathUtils.clamp(s.z, -1.8, 1.8);
      s.rotX = THREE.MathUtils.clamp(s.rotX, -1.35, 1.35);
      s.rotZ = THREE.MathUtils.clamp(s.rotZ, -1.35, 1.35);

      const obj = itemRefs.current[i];
      if (obj) {
        obj.position.set(s.x, s.y, s.z);
        obj.rotation.set(s.rotX, def.baseRotY + s.rotY, s.rotZ);
      }
    });
  });

  return (
    <group>
      {itemDefs.map((def, i) => (
        <group
          key={def.id}
          ref={(node) => { itemRefs.current[i] = node; }}
          position={def.base}
          rotation={[0, def.baseRotY, 0]}
        >
          {def.type === 'book' ? (
            <group>
              <mesh castShadow receiveShadow>
                <boxGeometry args={def.size} />
                <meshPhongMaterial color={def.color} shininess={25} />
              </mesh>
              <mesh position={[0, def.size[1] / 2 + 0.002, 0]} castShadow>
                <boxGeometry args={[def.size[0] * 0.88, 0.004, def.size[2] * 0.86]} />
                <meshPhongMaterial color={def.pageColor} shininess={12} />
              </mesh>
            </group>
          ) : (
            <group>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.12, 0.16, 0.24, 20]} />
                <meshPhongMaterial color="#b16541" shininess={32} />
              </mesh>
              <mesh position={[0, 0.14, 0]} castShadow>
                <cylinderGeometry args={[0.028, 0.036, 0.3, 10]} />
                <meshPhongMaterial color="#2f7f47" shininess={18} />
              </mesh>
              <mesh position={[0.08, 0.27, 0.04]} castShadow>
                <sphereGeometry args={[0.14, 10, 10]} />
                <meshPhongMaterial color="#3c9654" shininess={16} />
              </mesh>
              <mesh position={[-0.1, 0.26, 0]} castShadow>
                <sphereGeometry args={[0.15, 10, 10]} />
                <meshPhongMaterial color="#3a8f50" shininess={16} />
              </mesh>
              <mesh position={[0, 0.31, -0.08]} castShadow>
                <sphereGeometry args={[0.13, 10, 10]} />
                <meshPhongMaterial color="#47a45f" shininess={16} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
};

/* --- Contact typing animation --- */
const ContactTyping = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const fullText = "Contact me";
  const [typed, setTyped] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [cursorFading, setCursorFading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    setTyped('');
    setShowCursor(false);
    setCursorFading(false);
    setShowButtons(false);

    // Show cursor blinking first
    const cursorTimeout = setTimeout(() => setShowCursor(true), 200);
    // Start typing
    const startTimeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTyped(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(interval);
          // Fade cursor and show buttons
          setTimeout(() => setCursorFading(true), 600);
          setTimeout(() => setShowButtons(true), 400);
        }
      }, 45);
    }, 800);

    return () => {
      clearTimeout(cursorTimeout);
      clearTimeout(startTimeout);
    };
  }, [isInView]);

  const buttons = [
    { label: 'Email', icon: Mail, href: 'mailto:hello@example.com' },
    { label: 'LinkedIn', icon: Linkedin, href: '#' },
    { label: 'GitHub', icon: Github, href: '#' },
    { label: 'Resume', icon: FileText, href: '#' },
  ];

  return (
    <div ref={ref} className="flex flex-col justify-center h-full px-8 md:px-12">
      <h2 className="text-4xl md:text-6xl font-semibold mb-8 bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent">
        <span>{typed}</span>
        {showCursor && (
          <span
            className="inline-block w-0 overflow-visible"
            style={{
              animation: cursorFading ? 'none' : 'blink 1s step-end infinite',
              color: '#2997FF',
              textShadow: '0 0 8px #2997FF, 0 0 20px rgba(41,151,255,0.4)',
              transition: 'opacity 0.6s ease',
              opacity: cursorFading ? 0 : 1,
            }}
          >|</span>
        )}
        <span className="invisible">{fullText.slice(typed.length)}</span>
      </h2>

      <div className="flex flex-wrap gap-3">
        {buttons.map((btn, i) => (
          <motion.a
            key={btn.label}
            href={btn.href}
            initial={{ opacity: 0, y: 15 }}
            animate={showButtons ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-sm font-medium border border-zinc-700"
          >
            <btn.icon size={16} />
            {btn.label}
          </motion.a>
        ))}
      </div>
    </div>
  );
};

/* --- Expanding Robot Panel --- */
const RobotArmSection = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef(null);
  const targetRef = useRef(new THREE.Vector3(1, 1, 1));
  const endEffectorRef = useRef(new THREE.Vector3(0.8, 1.1, 0.8));

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.6, 0.985]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.35], [96, 48]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseRef.current = { x: nx, y: ny };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null;
  }, []);

  return (
    <section ref={containerRef} className="relative bg-black">
      <div className="flex items-center justify-center px-3">
        <motion.div
          style={{ scale, borderRadius, background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)' }}
          className="overflow-hidden aspect-video w-full relative"
        >
          {/* Left: text + buttons overlay */}
          <div className="absolute inset-y-0 left-0 w-2/5 z-10">
            <ContactTyping />
          </div>

          {/* Full-size 3D robot canvas, shifted right */}
          <div
            className="absolute inset-y-0 right-0 w-3/5 h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Canvas
              camera={{ position: [3, 2.5, 4], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 8, 5]} intensity={1.2} />
              <directionalLight position={[-3, 4, -2]} intensity={0.3} color="#2997FF" />
              <CursorTracker mouseRef={mouseRef} targetRef={targetRef} />
              <PandaArm targetRef={targetRef} endEffectorRef={endEffectorRef} />
              <WoodenTable />
              <TableProps endEffectorRef={endEffectorRef} />
            </Canvas>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RobotArmSection;
