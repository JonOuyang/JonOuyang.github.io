import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Mail, Linkedin, Github, FileText } from 'lucide-react';

/* --- Robot Arm Joint --- */
const RobotJoint = ({ position, args, color = '#e0e0e0' }) => (
  <mesh position={position}>
    <cylinderGeometry args={args} />
    <meshPhongMaterial color={color} shininess={80} specular="#666" />
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
const PandaArm = ({ targetRef }) => {
  const baseRef = useRef();
  const shoulder = useRef();
  const elbow = useRef();
  const wrist = useRef();

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
    const vertDist = t.y - 0.6; // height relative to shoulder
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
  });

  const jointColor = '#cccccc';
  const armColor = '#f0f0f0';
  const accentColor = '#2997FF';
  const accentMat = useMemo(() => (
    <meshPhongMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} shininess={100} />
  ), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Base plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 16]} />
        <meshPhongMaterial color="#333" shininess={90} specular="#444" />
      </mesh>
      {/* Base column */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 16]} />
        <meshPhongMaterial color={armColor} shininess={60} specular="#555" />
      </mesh>
      {/* Blue accent ring */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.18, 0.02, 8, 16]} />
        {accentMat}
      </mesh>

      {/* Rotating base (yaw) */}
      <group ref={baseRef} position={[0, 0.6, 0]}>
        <RobotJoint args={[0.15, 0.15, 0.12, 16]} color={jointColor} />

        {/* Shoulder pivot (pitch) */}
        <group ref={shoulder}>
          <RobotSegment length={1.2} radius={0.09} color={armColor} />
          <mesh position={[0, 0.6, 0]}>
            <torusGeometry args={[0.095, 0.015, 8, 16]} />
            {accentMat}
          </mesh>

          {/* Elbow pivot (pitch) */}
          <group ref={elbow} position={[0, 1.2, 0]}>
            <RobotJoint args={[0.13, 0.13, 0.1, 16]} color={jointColor} />
            <RobotSegment length={1.0} radius={0.07} color={armColor} />

            {/* Wrist pivot (pitch) */}
            <group ref={wrist} position={[0, 1.0, 0]}>
              <RobotJoint args={[0.1, 0.1, 0.08, 16]} color={jointColor} />

              {/* Gripper */}
              <group position={[0, 0.12, 0]}>
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.6, 0.985]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.35], [32, 16]);

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
              <PandaArm targetRef={targetRef} />
              <WoodenTable />
            </Canvas>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RobotArmSection;
