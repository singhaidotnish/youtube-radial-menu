import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Text, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 1. THE SUN (Center "Start" Button)
function Sun({ onReset }) {
    const sunRef = useRef();

    // Note: Rotation removed as requested
    // useFrame((state, delta) => (sunRef.current.rotation.y += delta * 0.2));

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

// 2. THE TEXTURED PLANET
function Planet({ item, index, total, radiusX, radiusZ }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hovered, setHover] = useState(false);

    // --- LOAD TEXTURE ---
    // This loads a rocky moon texture. You can replace this URL with:
    // 1. Another URL
    // 2. A local file (e.g., "/textures/mars.jpg") inside your public folder
    // const texture = useTexture("https://raw.githubusercontent.com/pmndrs/drei-assets/master/moon/moon_1k.jpg");
    const texture = useTexture("/textures/myplanet.jpg");
    // Calculate position
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    // Note: Rotation removed as requested
    /* useFrame((state, delta) => {
      if(meshRef.current) meshRef.current.rotation.y += delta * 0.5;
      if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
    });
    */

    return (
        <group ref={groupRef} position={[x, 0, z]}>
            <mesh 
                ref={meshRef}
                onClick={() => item.url && window.open(item.url, '_blank')}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
            >
                <sphereGeometry args={[1.2, 32, 32]} />
                
                {/* TEXTURE APPLIED HERE */}
                <meshStandardMaterial 
                    map={texture} 
                    color={hovered ? '#ffaa00' : 'white'} // Highlights orange on hover
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
                    transition: 'color 0.2s'
                }}>
                    {item.label}
                </div>
            </Html>
        </group>
    );
}

// 3. MAIN GALAXY COMPONENT
export default function Galaxy({ showSolarSystem, items }) {
    // If not in 3D mode, render nothing (saves performance)
    if (!showSolarSystem) return null;

    return (
        <div style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            zIndex: 1, background: 'black' 
        }}>
            <Canvas camera={{ position: [0, 20, 25], fov: 45 }}>
                
                {/* Lighting is crucial for textures to be visible */}
                <ambientLight intensity={0.3} />
                <pointLight position={[0, 0, 0]} intensity={250} color="#ffaa00" distance={50} decay={2} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* SUSPENSE WRAPPER (Required for loading textures) */}
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