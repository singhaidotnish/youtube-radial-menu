import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, Html, useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. TEXTURE PATHS
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

    const texturePath = TEXTURE_PATHS[index % TEXTURE_PATHS.length];
    const texture = useTexture(texturePath);

    // Calculate position
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    return (
        <group ref={groupRef} position={[x, 0, z]}>
            
            {/* Dashed Orbit Line (Only for children) */}
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
                {/* Child planets are much smaller (0.6) */}
                <sphereGeometry args={[isChild ? 0.6 : 1.2, 32, 32]} />
                <meshStandardMaterial 
                    map={texture} 
                    color={hovered ? '#ffaa00' : 'white'} 
                    roughness={0.8}
                />
            </mesh>
            
            // inside function Planet(...)

            <Html position={[0, isChild ? -1.2 : -2.2, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                <div style={{ 
                    color: hovered ? '#ffaa00' : 'white', 
                    
                    /* --- CHANGE THIS LINE --- */
                    fontSize: isChild ? '24px' : '24px',  // Was '10px' : '14px'
                    
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 4px black',
                    userSelect: 'none',
                    fontFamily: 'sans-serif' // Ensures clean look
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
    
    // --- CALCULATE PARENT POSITION ---
    // If a group is active, we need to know WHERE it is to put the children around it.
    let parentPosition = [0, 0, 0];
    if (activeGroup) {
        const parentIndex = items.findIndex(i => i.id === activeGroupId);
        const parentAngle = (parentIndex / items.length) * Math.PI * 2;
        // MUST match the radiusX/Z of the main planets (12)
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
                    
                    {/* 1. INNER RING (Main Planets) */}
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

                    {/* 2. SATELLITES (Children of Active Group) */}
                    {activeGroup && activeGroup.children && (
                        // We shift this entire group to the Parent's [x, 0, z] coordinates
                        <group position={parentPosition}>
                            {activeGroup.children.map((child, index) => (
                                <Planet 
                                    key={child.id || index}
                                    item={child} 
                                    index={index} 
                                    total={activeGroup.children.length} 
                                    radiusX={4}  // Small radius (orbiting the parent)
                                    radiusZ={4} 
                                    onClick={handlePlanetClick}
                                    isChild={true}
                                />
                            ))}
                        </group>
                    )}
                </Suspense>
            </Canvas>
        </div>
    );
}