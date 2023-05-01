import { OrbitControls, useGLTF } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { Physics, RigidBody, CuboidCollider, BallCollider, CylinderCollider, InstancedRigidBodies } from '@react-three/rapier';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const App = () => {
    const twisterRef = useRef();
    const cubeRef = useRef();
    const cubesRef = useRef();
    const cubesCount = 100;

    const cubesTransforms = useMemo(() => {

        const scale = 0.2 + Math.random() * 0.8;

        const instances = Array.from({length: cubesCount}).map((_, index) => ({
            key: 'instance_' + index,
            position: [ (Math.random() - 0.5) * 8, 6 + index * 0.2, (Math.random() - 0.5) * 8 ],
            rotation: [ Math.random(), Math.random(), Math.random() ],
            scale: [ scale, scale, scale ]
        }));

        return {instances};
    }, []);

    const [ hitSound, setHitAudio ] = useState(new Audio('./hit.mp3'));
    const burger = useGLTF('./hamburger.glb');


    const cubeClick = () => {
        const mass = cubeRef.current.mass();
        cubeRef.current.applyImpulse({x: 0, y: 5 * mass, z: 0});
        cubeRef.current.applyTorqueImpulse({
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
            z: Math.random() - 0.5
        });
    };

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        const angle = time * 0.5;
        const angleX = Math.cos(angle) * 2;
        const angleZ = Math.sin(angle) * 2;

        const eulerRotation = new THREE.Euler(0, time * 3, 0);
        const quaternionRotation = new THREE.Quaternion();
        quaternionRotation.setFromEuler(eulerRotation);

        twisterRef.current.setNextKinematicRotation(quaternionRotation);
        twisterRef.current.setNextKinematicTranslation({x: angleX, y: -0.8, z: angleZ})
    });

    const collisionEnter = () => {
        // hitSound.currentTime = 0;
        // hitSound.volume = Math.random();
        // hitSound.play();
    };

    return(
        <>
        <Perf position="top-left" />
        <OrbitControls makeDefault />
        <directionalLight castShadow position={[1, 2, 3]} intensity={1.5} />
        <ambientLight intensity={0.5} />

        <Physics gravity={[0, -9.81, 0]} >
            <InstancedRigidBodies
                instances={ cubesTransforms.instances }
            >
                <instancedMesh ref={cubesRef} castShadow args={[null, null, cubesCount]} >
                    <boxGeometry />
                    <meshStandardMaterial color="tomato" />
                </instancedMesh>
            </InstancedRigidBodies>
            <RigidBody colliders="ball" >
                <mesh castShadow position={[-1.5, 2, 0]}>
                    <sphereGeometry />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </RigidBody>
            <RigidBody
                ref={twisterRef}
                position={[0, -0.8, 0]}
                friction={0}
                type="kinematicPosition"
            >
                <mesh castShadow scale={[0.4, 0.4, 3]} >
                    <boxGeometry />
                    <meshStandardMaterial color="red" />
                </mesh>
            </RigidBody>
            <RigidBody
                ref={cubeRef}
                position={[1.5, 2, 0]}
                gravityScale={1}
                restitution={0.5}
                friction={0.7}
                colliders={false}
                onCollisionEnter={collisionEnter}
                // onCollisionExit={() => console.log('exit')}
                // onSleep={() => console.log('sleep')}
                // onWake={() => console.log('wake')}
            >
                <CuboidCollider mass={2} args={[0.5, 0.5, 0.5]} />
                <mesh castShadow onClick={cubeClick} >
                    <boxGeometry />
                    <meshStandardMaterial color="mediumpurple" />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" >
                <mesh receiveShadow position-y={-1.25} >
                    <boxGeometry args={[10, 0.5, 10]} />
                    <meshStandardMaterial color="greenyellow" />
                </mesh>
            </RigidBody>
            <RigidBody colliders={false} position={[0, 4, 0]} >
                <CylinderCollider args={[0.5, 1.25]} />
                <primitive object={burger.scene} scale={0.25} />
            </RigidBody>
            <RigidBody type="fixed" >
                <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, 5.5]} />
                <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, -5.5]} />
                <CuboidCollider args={[0.5, 2, 5]} position={[5.5, 1, 0]} />
                <CuboidCollider args={[0.5, 2, 5]} position={[-5.5, 1, 0]} />
            </RigidBody>
        </Physics>
        </>
    );
};

export default App;

//? Rapier
//* https://rapier.rs/javascript3d/index.html
//* https://github.com/pmndrs/react-three-rapier

//! Colliders
//? Cube collider - default collider shape
{/* <Physics debug >
    <RigidBody>
    <mesh castShadow position={[2, 2, 0]}>
        <boxGeometry args={[3, 2, 1]} />
        <meshStandardMaterial color="mediumpurple" />
    </mesh>
    <mesh castShadow position={[2, 2, 3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="mediumpurple" />
    </mesh>
    </RigidBody>
</Physics> */}

//? Trimesh collider
//* prone to bugs with complex geometries
{/* <Physics>
    <RigidBody colliders="trimesh" >
        <mesh castShadow position={[0, 1, 0]} rotation={[Math.PI * 0.5, 0, 0]} >
            <torusGeometry args={[1, 0.5, 16, 32]} />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>
    </RigidBody>
</Physics> */}

//? Floor collider
{/* <Physics>
    <RigidBody type="fixed" >
        <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="greenyellow" />
        </mesh>
    </RigidBody>
</Physics> */}

//? Custom collider
{/* <Physics>
    <RigidBody colliders={false} position={[0, 1, 0]} rotation={[Math.PI * 0.5, 0, 0]} >
        <BallCollider args={[1.5]} />
        <mesh castShadow >
            <torusGeometry args={[1, 0.5, 16, 32]} />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>
    </RigidBody>
</Physics> */}