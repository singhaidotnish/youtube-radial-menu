import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 1. USE LOCAL TEXTURES (Stable & Fast)
const TEXTURE_PATHS = [
    "/public/textures/one.jpg",
    "/public/textures/02.png",
    "/public/textures/03.jpeg",
    "/public/textures/04.jpg",
    "/public/textures/05.jpg",
    "/public/textures/06.jpg",
    "/public/textures/07.jpg",
    "/public/textures/08.jpg",
    "/public/textures/09.jpeg"
];

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
            
            <Text 
                position={[0, 0, 2.7]} 
                fontSize={0.8} 
                color="white" 
                fontWeight="bold"
                anchorX="center" 
                anchorY="middle"
            >
                START
            </Text>
        </group>
    )
}

function Planet({ item, index, total, radiusX, radiusZ }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hovered, setHover] = useState(false);

    // 2. SAFE TEXTURE LOADING
    // We select a path from our local array
    const texturePath = TEXTURE_PATHS[index % TEXTURE_PATHS.length];
    
    // Load the texture
    const texture = useTexture(texturePath);

    // Calculate position
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    return (
        <group ref={groupRef} position={[x, 0, z]}>
            <mesh 
                ref={meshRef}
                onClick={() => item.url && window.open(item.url, '_blank')}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
            >
                <sphereGeometry args={[1.2, 32, 32]} />
                
                <meshStandardMaterial 
                    map={texture} 
                    color={hovered ? '#ffaa00' : 'white'} 
                    roughness={0.8}
                />
            </mesh>

            {/* Floating Label */}
            <Html position={[0, -1.8, 0]} center distanceFactor={10}>
                <div style={{ 
                    color: hovered ? '#ffaa00' : 'white', 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 4px black',
                    pointerEvents: 'none',
                    userSelect: 'none'
                }}>
                    {item.label}
                </div>
            </Html>
        </group>
    );
}

export default function Galaxy({ showSolarSystem, items }) {
    if (!showSolarSystem) return null;

    return (
        <div style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            zIndex: 1, background: 'black' 
        }}>
            <Canvas camera={{ position: [0, 20, 25], fov: 45 }}>
                
                <ambientLight intensity={0.3} />
                <pointLight position={[0, 0, 0]} intensity={250} color="#ffaa00" distance={50} decay={2} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Suspense handles the loading. If a texture is missing, it waits. */}
                <Suspense fallback={null}>
                    <Sun onReset={() => console.log("Reset")} />
                    
                    {items.map((item, index) => (
                        <Planet 
                            key={item.id || index}
                            item={item} 
                            index={index} 
                            total={items.length} 
                            radiusX={12} 
                            radiusZ={8} 
                        />
                    ))}
                </Suspense>

            </Canvas>
        </div>
    );
}