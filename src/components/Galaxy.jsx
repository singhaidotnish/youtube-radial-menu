import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, Html, useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. TEXTURE PATHS (Using your correct GitHub repo paths)
const TEXTURE_PATHS = [
    "/youtube-radial-menu/textures/one.jpg",
    "/youtube-radial-menu/textures/02.png",
    "/youtube-radial-menu/textures/03.jpeg",
    "/youtube-radial-menu/textures/04.jpg",
    "/youtube-radial-menu/textures/05.jpg",
    "/youtube-radial-menu/textures/06.jpg",
    "/youtube-radial-menu/textures/07.jpg",
    "/youtube-radial-menu/textures/08.jpg",
    "/youtube-radial-menu/textures/09.jpeg"
];

function Sun({ onReset }) {
    const sunRef = useRef();
    return (
        <group onClick={onReset} ref={sunRef}>
            <mesh>
                <sphereGeometry args={[2.65, 32, 32]} />
                <meshBasicMaterial color="white" side={THREE.BackSide} />
            </mesh>
            <mesh>
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshBasicMaterial color="#ffaa00" toneMapped={false} />
            </mesh>
            <Text position={[0, 0, 2.7]} fontSize={0.8} color="white" fontWeight="bold" anchorX="center" anchorY="middle">
                START
            </Text>
        </group>
    )
}

function Planet({ item, index, total, radiusX, radiusZ, onClick, isChild }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hovered, setHover] = useState(false);

    // Texture Logic: Children reuse the parent's texture list logic
    const texturePath = TEXTURE_PATHS[index % TEXTURE_PATHS.length];
    const texture = useTexture(texturePath);

    // Calculate position around the circle
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    return (
        <group ref={groupRef} position={[x, 0, z]}>
            
            {/* Dashed Orbit Line (Only for the outer ring/children) */}
            {isChild && (
                 <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-x, 0, -z]}>
                    <ringGeometry args={[radiusX - 0.05, radiusX + 0.05, 64]} />
                    <meshBasicMaterial color="#444" transparent opacity={0.2} side={THREE.DoubleSide} />
                </mesh>
            )}

            <mesh 
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation(); // Stop click from hitting background
                    onClick(item);
                }}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
            >
                {/* Child planets are slightly smaller (0.8) */}
                <sphereGeometry args={[isChild ? 0.8 : 1.2, 32, 32]} />
                <meshStandardMaterial 
                    map={texture} 
                    color={hovered ? '#ffaa00' : 'white'} 
                    roughness={0.8}
                />
            </mesh>
            
            {/* Label */}
            <Html position={[0, isChild ? -1.4 : -1.8, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                <div style={{ 
                    color: hovered ? '#ffaa00' : 'white', 
                    fontSize: isChild ? '12px' : '14px', 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 4px black',
                    userSelect: 'none'
                }}>
                    {item.label}
                </div>
            </Html>
        </group>
    );
}

export default function Galaxy({ showSolarSystem, items }) {
    // STATE: Tracks which folder is open (e.g., 'ai' or null)
    const [activeGroupId, setActiveGroupId] = useState(null);

    if (!showSolarSystem) return null;

    // --- LOGIC: HANDLE CLICKS ---
    const handlePlanetClick = (item) => {
        if (item.children && item.children.length > 0) {
            // It IS a Folder -> Toggle the "Outer Ring"
            setActiveGroupId(activeGroupId === item.id ? null : item.id);
        } else if (item.url) {
            // It IS a Link -> Open it
            window.open(item.url, '_blank');
        }
    };

    // Find the actual data object for the active group
    const activeGroup = items.find(i => i.id === activeGroupId);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, background: 'black' }}>
            <Canvas camera={{ position: [0, 25, 30], fov: 45 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[0, 0, 0]} intensity={250} color="#ffaa00" distance={50} decay={2} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                
                <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />

                <Suspense fallback={null}>
                    {/* SUN: Clicking Reset closes any open folder */}
                    <Sun onReset={() => setActiveGroupId(null)} />
                    
                    {/* 1. INNER RING (Main Categories like "AI Tools") */}
                    {items.map((item, index) => (
                        <Planet 
                            key={item.id || index}
                            item={item} 
                            index={index} 
                            total={items.length} 
                            radiusX={12} 
                            radiusZ={12} 
                            onClick={handlePlanetClick}
                            isChild={false}
                        />
                    ))}

                    {/* 2. OUTER RING (Sub-items like "ChatGPT", "Gemini") */}
                    {activeGroup && activeGroup.children && activeGroup.children.map((child, index) => (
                        <Planet 
                            key={child.id || index}
                            item={child} 
                            index={index} 
                            total={activeGroup.children.length} 
                            radiusX={20} // Larger orbit for satellites
                            radiusZ={20} 
                            onClick={handlePlanetClick}
                            isChild={true}
                        />
                    ))}
                </Suspense>
            </Canvas>
        </div>
    );
}