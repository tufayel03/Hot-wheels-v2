import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Environment, Stars, Float, Image } from '@react-three/drei';
import * as THREE from 'three';
import { OverlayUI } from './OverlayUI';

const curvePoints = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -50),
  new THREE.Vector3(30, 10, -100),
  new THREE.Vector3(0, 0, -150),
  new THREE.Vector3(0, -20, -200),
  new THREE.Vector3(-50, 20, -250),
  new THREE.Vector3(-30, 0, -300),
  new THREE.Vector3(0, 0, -350),
  new THREE.Vector3(0, 0, -400),
];

const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);

const products = [
  { url: 'https://picsum.photos/seed/car1/600/400', t: 0.15, scale: [4, 2.66] as [number, number] },
  { url: 'https://picsum.photos/seed/car2/600/400', t: 0.35, scale: [4, 2.66] as [number, number] },
  { url: 'https://picsum.photos/seed/drop4/400/400', t: 0.55, scale: [3, 3] as [number, number] },
  { url: 'https://picsum.photos/seed/auction/800/800', t: 0.75, scale: [3, 3] as [number, number] },
  { url: 'https://picsum.photos/seed/series1/400/600', t: 0.9, scale: [2.66, 4] as [number, number] },
];

function TrackImages() {
  const frames = useMemo(() => curve.computeFrenetFrames(800, false), []);

  return (
    <group>
      {products.map((prod, i) => {
        const t = prod.t;
        const position = curve.getPointAt(t);
        const frameIndex = Math.min(Math.floor(t * 800), 800);
        const tangent = frames.tangents[frameIndex];
        const normal = frames.normals[frameIndex]; // Side vector
        const binormal = frames.binormals[frameIndex]; // Up vector
        
        // Alternate left and right side of the track
        const sideMultiplier = i % 2 === 0 ? 1 : -1;
        
        // Position it to the side and slightly above the track
        // Track width is 5 (-2.5 to 2.5), so 4 units puts it just outside the track
        const sideOffset = normal.clone().multiplyScalar(4.5 * sideMultiplier);
        const upOffset = binormal.clone().multiplyScalar(1.5); // 1.5 units up
        
        const imagePos = position.clone().add(sideOffset).add(upOffset);
        
        // Make the image face the camera (which travels along the tangent)
        // We angle it slightly inwards towards the track
        const lookDirection = tangent.clone().negate();
        const inwardAngle = normal.clone().multiplyScalar(0.5 * sideMultiplier);
        lookDirection.add(inwardAngle).normalize();
        
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), lookDirection);
        
        return (
          <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
            <Image 
              url={prod.url} 
              position={imagePos} 
              quaternion={quaternion} 
              scale={prod.scale}
              transparent
            />
          </Float>
        );
      })}
    </group>
  );
}

function Track() {
  const { trackGeo, stripeGeo } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.5, 0);
    shape.lineTo(2.5, 0);
    shape.lineTo(2.5, 0.4);
    shape.lineTo(2.1, 0.4);
    shape.lineTo(2.1, 0.1);
    shape.lineTo(-2.1, 0.1);
    shape.lineTo(-2.1, 0.4);
    shape.lineTo(-2.5, 0.4);
    shape.lineTo(-2.5, 0);

    const trackGeo = new THREE.ExtrudeGeometry(shape, {
      steps: 800,
      extrudePath: curve,
      bevelEnabled: false,
    });

    const stripeShape = new THREE.Shape();
    stripeShape.moveTo(-0.2, 0.11);
    stripeShape.lineTo(0.2, 0.11);
    stripeShape.lineTo(0.2, 0.15);
    stripeShape.lineTo(-0.2, 0.15);
    stripeShape.lineTo(-0.2, 0.11);

    const stripeGeo = new THREE.ExtrudeGeometry(stripeShape, {
      steps: 800,
      extrudePath: curve,
      bevelEnabled: false,
    });

    return { trackGeo, stripeGeo };
  }, []);

  return (
    <group>
      <mesh geometry={trackGeo}>
        <meshStandardMaterial color="#FF6A00" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh geometry={stripeGeo}>
        <meshStandardMaterial color="#0D0D0F" roughness={0.8} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const scroll = useScroll();
  const frames = useMemo(() => curve.computeFrenetFrames(800, false), []);

  useFrame((state) => {
    // scroll.offset is between 0 and 1, but can be negative on macOS bounce
    const t = Math.max(0, Math.min(scroll.offset, 1));
    
    const position = curve.getPointAt(t);
    
    // Get the Frenet frames to perfectly align with the track surface
    const frameIndex = Math.min(Math.floor(t * 800), 800);
    // In Three.js ExtrudeGeometry, the shape's Y axis (up) is mapped to the binormal
    const binormal = frames.binormals[frameIndex];
    
    // Track surface is at y=0.15. Place camera at y=0.4 (0.25 units above surface)
    // This gives a low-to-the-ground Hot Wheels POV
    const cameraOffset = binormal.clone().multiplyScalar(0.4);
    state.camera.position.copy(position).add(cameraOffset);
    
    // Look ahead along the track
    const lookAtT = Math.min(t + 0.02, 1);
    const lookAtPosition = curve.getPointAt(lookAtT);
    const lookAtFrameIndex = Math.min(Math.floor(lookAtT * 800), 800);
    const lookAtBinormal = frames.binormals[lookAtFrameIndex];
    
    const lookAtOffset = lookAtBinormal.clone().multiplyScalar(0.4);
    const lookAtPos = lookAtPosition.clone().add(lookAtOffset);
    
    // Lock the camera's up vector to the track's up (binormal)
    state.camera.up.copy(binormal);
    state.camera.lookAt(lookAtPos);
  });

  return null;
}

function SpeedLines() {
  const linesRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const lines = useMemo(() => {
    return Array.from({ length: 200 }).map(() => ({
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      z: -Math.random() * 200,
      speed: Math.random() * 2 + 1,
      length: Math.random() * 10 + 5
    }));
  }, []);
  
  useFrame((state) => {
    if (linesRef.current) {
      // Keep the group centered on the camera
      linesRef.current.position.copy(camera.position);
      
      // Match camera rotation so lines always come from "forward"
      linesRef.current.quaternion.copy(camera.quaternion);
      
      // Animate individual lines
      linesRef.current.children.forEach((child, i) => {
        if (lines[i]) {
          child.position.z += lines[i].speed;
          if (child.position.z > 10) {
            child.position.z = -200;
          }
        }
      });
    }
  });

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, line.z]}>
          <boxGeometry args={[0.05, 0.05, line.length]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function GlowingRings() {
  const rings = useMemo(() => {
    const items = [];
    const numRings = 15;
    for (let i = 1; i < numRings; i++) {
      const t = i / numRings;
      const position = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      
      // Calculate orientation to face along the track
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      
      items.push({ position, quaternion });
    }
    return items;
  }, []);

  return (
    <group>
      {rings.map((r, i) => (
        <mesh key={i} position={r.position} quaternion={r.quaternion}>
          <torusGeometry args={[10, 0.2, 16, 100]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#FF2A00" : "#FFD500"} />
        </mesh>
      ))}
    </group>
  );
}

export function TrackScene() {
  return (
    <div className="w-full h-screen bg-[#0D0D0F]">
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <color attach="background" args={['#0D0D0F']} />
        <fog attach="fog" args={['#0D0D0F', 10, 150]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} color="#FFD500" />
        <pointLight position={[0, 5, -50]} intensity={2} color="#FF2A00" distance={50} />
        <pointLight position={[30, 15, -100]} intensity={2} color="#FF6A00" distance={50} />
        <pointLight position={[-50, 25, -250]} intensity={2} color="#FFD500" distance={50} />

        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <ScrollControls pages={8} damping={0.25}>
          <Track />
          <TrackImages />
          <GlowingRings />
          <CameraRig />
          <SpeedLines />
          <OverlayUI />
        </ScrollControls>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
