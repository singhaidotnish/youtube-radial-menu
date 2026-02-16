import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, Html, useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURATION ---
// 1. GENERIC PLANET TEXTURES (For Main Categories like "AI Tools", "Coding")
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

// 2. FALLBACK IMAGE (Used if a specific logo is missing)
const PLACEHOLDER_LOGO = "/youtube-radial-menu/logos/placeholder.png"; 

function Planet({ item, index, total, radiusX, radiusZ, onClick, isChild }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hovered, setHover] = useState(false);

    // --- LOGIC: TEXTURE VS LOGO ---
    
    // Step A: Determine the "Ideal" path
    let idealPath;
    if (isChild && item.label) {
        // It is a SATELLITE -> It needs a specific LOGO
        const filename = item.label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png';
        idealPath = `/youtube-radial-menu/logos/${filename}`;
    } else {
        // It is a MAIN PLANET -> It needs a generic PLANET TEXTURE
        idealPath = PLANET_TEXTURES[index % PLANET_TEXTURES.length];
    }

    // Step B: Set the initial state
    // - Main planets? We assume they exist (safe).
    // - Satellites? Start with placeholder while we check if the real logo exists.
    const [activeTexture, setActiveTexture] = useState(
        isChild ? PLACEHOLDER_LOGO : idealPath
    );

    // Step C: Image Checker (Only for Satellites)
    useEffect(() => {
        if (!isChild) return; // Don't check main planets

        const img = new Image();
        img.src = idealPath;

        img.onload = () => {
            // Found it! Use the real logo.
            setActiveTexture(idealPath);
        };

        img.onerror = () => {
            // Missing! Keep using the placeholder (or switch to generic planet).
            console.warn(`Logo missing: ${item.label}. Using placeholder.`);
            // Optional: If you prefer missing logos to look like planets instead of placeholders:
            // setActiveTexture(PLANET_TEXTURES[index % PLANET_TEXTURES.length]); 
        };
    }, [idealPath, isChild, index]); // Re-run if item changes

    // Load the decided texture
    const texture = useTexture(activeTexture);

    // Position Math
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    return (
        <group ref={groupRef} position={[x, 0, z]}>
            {/* Orbit Ring (Visual aid for satellites) */}
            {isChild && (
                 <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-x, 0, -z]}>
                    <ringGeometry args={[radiusX - 0.05, radiusX + 0.05, 32]} />
                    <meshBasicMaterial color="#444" transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
            )}

            <mesh 
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation(); 
                    onClick(item);
                }}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
            >
                {/* Satellites are smaller (0.6). 
                   Main planets are larger (1.2).
                */}
                <sphereGeometry args={[isChild ? 0.6 : 1.2, 32, 32]} />
                <meshStandardMaterial 
                    map={texture} 
                    color={hovered ? '#ffaa00' : 'white'} 
                    roughness={0.8}
                />
            </mesh>
            
            <Html 
                position={[0, isChild ? -1.5 : -2.5, 0]} 
                center 
                distanceFactor={10} 
                style={{ pointerEvents: 'none' }}
            >
                <div style={{ 
                    color: hovered ? '#ffaa00' : 'white', 
                    fontSize: isChild ? '18px' : '30px',
                    fontWeight: '900', 
                    whiteSpace: 'nowrap',
                    textShadow: '0 4px 8px black',
                    userSelect: 'none',
                    fontFamily: 'sans-serif',
                    letterSpacing: '1px'
                }}>
                    {item.label}
                </div>
            </Html>
        </group>
    );
}

export default function Galaxy({ showSolarSystem, items }) {
    const [activeGroupId, setActiveGroupId] = useState(null);

    if (!showSolarSystem) return null;

    const handlePlanetClick = (item) => {
        if (item.children && item.children.length > 0) {
            setActiveGroupId(activeGroupId === item.id ? null : item.id);
        } else if (item.url) {
            window.open(item.url, '_blank');
        }
    };

    const activeGroup = items.find(i => i.id === activeGroupId);
    
    // Calculate Center for Satellites
    let parentPosition = [0, 0, 0];
    if (activeGroup) {
        const parentIndex = items.findIndex(i => i.id === activeGroupId);
        const parentAngle = (parentIndex / items.length) * Math.PI * 2;
        parentPosition = [
            Math.cos(parentAngle) * 12,
            0,
            Math.sin(parentAngle) * 12
        ];
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, background: 'black' }}>
            <Canvas camera={{ position: [0, 25, 30], fov: 45 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[0, 0, 0]} intensity={250} color="#ffaa00" distance={50} decay={2} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                
                <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />

                <Suspense fallback={null}>
                    <Sun onReset={() => setActiveGroupId(null)} />
                    
                    {/* 1. MAIN PLANETS (Generic Textures) */}
                    {items.map((item, index) => (
                        <Planet 
                            key={item.id || index}
                            item={item} 
                            index={index} 
                            total={items.length} 
                            radiusX={12} 
                            radiusZ={12} 
                            onClick={handlePlanetClick}
                            isChild={false} // <--- Forces use of PLANET_TEXTURES
                        />
                    ))}

                    {/* 2. SATELLITES (Specific Logos) */}
                    {activeGroup && activeGroup.children && (
                        <group position={parentPosition}>
                            {activeGroup.children.map((child, index) => (
                                <Planet 
                                    key={child.id || index}
                                    item={child} 
                                    index={index} 
                                    total={activeGroup.children.length} 
                                    radiusX={4} 
                                    radiusZ={4} 
                                    onClick={handlePlanetClick}
                                    isChild={true} // <--- Forces use of LOGOS (or Placeholder)
                                />
                            ))}
                        </group>
                    )}
                </Suspense>
            </Canvas>
        </div>
    );
}