import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import data from '../data.json';

const fallbackImg = "https://placehold.co/64x64/orange/white?text=?";

// --- COMPONENTS (Moon, Planet, Sun) ---
// (Keep these exactly the same as before to save space in this message, 
//  just copy them from your previous file if you need to, 
//  OR just paste the FULL file below which includes them)

function Moon({ item, index, total, radius }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  const imgUrl = item.img ? item.img : fallbackImg;
  const texture = useLoader(THREE.TextureLoader, imgUrl);
  useFrame((state, delta) => { meshRef.current.rotation.y += delta * 1; });
  return (
    <group position={[x, 0, z]}>
      <Float speed={4} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); if(item.url) window.open(item.url, "_blank"); }}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        <Text position={[0, -1, 0]} fontSize={0.2} color="#cccccc" anchorX="center" anchorY="middle">{item.label}</Text>
      </Float>
    </group>
  );
}

function Planet({ item, index, total, radius, isActive, onClick }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  const imgUrl = item.img ? item.img : fallbackImg;
  const texture = useLoader(THREE.TextureLoader, imgUrl);
  useFrame((state, delta) => {
    if(meshRef.current) meshRef.current.rotation.y += delta * 0.5;
    if (isActive && groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });
  return (
    <group position={[x, 0, z]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial map={texture} color={isActive ? "#ffffaa" : "white"} emissive={isActive ? "#222222" : "black"} />
        </mesh>
        <Text position={[0, -2.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">{item.label}</Text>
      </Float>
      {isActive && item.children && (
        <group ref={groupRef}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3.4, 3.5, 64]} />
                <meshBasicMaterial color="#ffffff" opacity={0.2} transparent side={THREE.DoubleSide} />
            </mesh>
            {item.children.map((child, idx) => (
                <Moon key={idx} item={child} index={idx} total={item.children.length} radius={3.5} />
            ))}
        </group>
      )}
    </group>
  );
}

function Sun({ onReset }) {
    const sunRef = useRef();

    // Slowly rotate the sun for a 3D effect, or remove useFrame to make it static like 2D
    useFrame((state, delta) => (sunRef.current.rotation.y += delta * 0.2));

    return (
        <group ref={sunRef} onClick={onReset}>
            {/* 1. THE BODY: Matches 2D Orange Color */}
            <mesh>
                <sphereGeometry args={[2.5, 64, 64]} />
                <meshStandardMaterial 
                    color="#ffaa00" 
                    emissive="#ffaa00" 
                    emissiveIntensity={0.4} 
                    roughness={0.2} 
                />
            </mesh>

            {/* 2. THE RIM: A White Ring to match the 2D border */}
            <mesh>
                {/* Torus args: [radius, tubeThickness, radialSegments, tubularSegments] */}
                <torusGeometry args={[2.5, 0.15, 16, 100]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
            </mesh>

            {/* 3. THE TEXT: "START" */}
            <Text 
                position={[0, 0, 2.7]} // Floats slightly in front of the sphere
                fontSize={0.8} 
                fontWeight="bold"
                color="white" 
                anchorX="center" 
                anchorY="middle"
            >
                START
            </Text>
        </group>
    )
}

// --- MAIN EXPORT ---
// We accept a prop 'showSolarSystem' to control visibility
export default function Galaxy({ showSolarSystem }) {
  const [activeId, setActiveId] = useState(null);

  return (
    // Fixed Background Layer (Z-Index 0)
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'black', zIndex: 0 }}>
      <Canvas camera={{ position: [0, 25, 20], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
        
        {/* STARS ALWAYS VISIBLE */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        
        {/* CONDITIONAL CONTENT: Only show planets if in 3D mode */}
        {showSolarSystem && (
            <>
                <OrbitControls enableZoom={true} minDistance={10} maxDistance={60} />
                <Sun onReset={() => setActiveId(null)} />
                {data.map((item, index) => (
                  <React.Suspense fallback={null} key={item.id || index}>
                     <Planet 
                        item={item} index={index} total={data.length} radius={10} 
                        isActive={activeId === item.id}
                        onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                     />
                  </React.Suspense>
                ))}
            </>
        )}
      </Canvas>
    </div>
  );
}