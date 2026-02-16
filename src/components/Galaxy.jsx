import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, Html, useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURATION ---

// 1. GENERIC PLANET TEXTURES (Your Exact List)
const PLANET_TEXTURES = [
    "/youtube-radial-menu/textures/one.jpg",
    "/youtube-radial-menu/textures/02.png",   // .png
    "/youtube-radial-menu/textures/03.jpeg",  // .jpeg
    "/youtube-radial-menu/textures/04.jpg",
    "/youtube-radial-menu/textures/05.jpg",
    "/youtube-radial-menu/textures/06.jpg",
    "/youtube-radial-menu/textures/07.jpg",
    "/youtube-radial-menu/textures/08.jpg",
    "/youtube-radial-menu/textures/09.jpeg"   // .jpeg
];

// 2. FALLBACK IMAGE (Prevents white screen/crash if a specific logo is missing)
const PLACEHOLDER_LOGO = "/youtube-radial-menu/logos/placeholder.png"; 

// --- COMPONENT: THE SUN (Center Button) ---
function Sun({ onReset }) {
    const sunRef = useRef();
    return (
        <group onClick={onReset} ref={sunRef}>
            {/* White Outline */}
            <mesh>
                <sphereGeometry args={[2.65, 32, 32]} />
                <meshBasicMaterial color="white" side={THREE.BackSide} />
            </mesh>
            {/* Orange Core */}
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

// --- COMPONENT: PLANET (Handles Textures & Logos) ---
function Planet({ item, index, total, radiusX, radiusZ, onClick, isChild }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hovered, setHover] = useState(false);

    // --- LOGIC: TEXTURE VS LOGO ---
    
    // 1. Determine the "Ideal" path (The specific logo we WANT)
    let idealPath;
    if (isChild && item.label) {
        // Example: "AI Tools" -> "ai_tools.png"
        const filename = item.label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png';
        idealPath = `/youtube-radial-menu/logos/${filename}`;
    } else {
        // Main planets use generic textures from your list
        idealPath = PLANET_TEXTURES[index % PLANET_TEXTURES.length];
    }

    // 2. State: Start with Placeholder (Safe) for children, or Texture for parents
    const [activeTexture, setActiveTexture] = useState(
        isChild ? PLACEHOLDER_LOGO : idealPath
    );

    // 3. Image Checker: Secretly try to load the logo. If found, swap it in.
    useEffect(() => {
        if (!isChild) return; 

        const img = new Image();
        img.src = idealPath;

        img.onload = () => {
            setActiveTexture(idealPath); // Success! Show real logo.
        };

        img.onerror = () => {
            // Failed! Keep showing placeholder.
            // console.warn(`Logo missing: ${item.label}`); 
        };
    }, [idealPath, isChild]);

    // Load the texture (Suspense handles the waiting)
    const texture = useTexture(activeTexture);

    // Position Math
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    return (
        <group ref={groupRef} position={[x, 0, z]}>
            {/* Orbit Ring for Satellites */}
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
                {/* Child = Smaller (0.6)
                    Parent = Larger (1.2)
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

// --- MAIN COMPONENT: GALAXY ---
export default function Galaxy({ showSolarSystem, items }) {
    const [activeGroupId, setActiveGroupId] = useState(null);

    if (!showSolarSystem) return null;

    const handlePlanetClick = (item) => {
        if (item.children && item.children.length > 0) {
            // Toggle folder open/close
            setActiveGroupId(activeGroupId === item.id ? null : item.id);
        } else if (item.url) {
            // Open Link
            window.open(item.url, '_blank');
        }
    };

    const activeGroup = items.find(i => i.id === activeGroupId);
    
    // Calculate Parent Position to center satellites around the active planet
    let parentPosition = [0, 0, 0];
    if (activeGroup) {
        const parentIndex = items.findIndex(i => i.id === activeGroupId);