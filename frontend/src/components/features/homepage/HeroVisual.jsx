import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useTheme } from '@/hooks/use-theme';

const HeroVisual = () => {
    const { theme } = useTheme();

    const sphereColor = theme === 'dark' ? '#3b82f6' : '#60a5fa'; //Blue-600 for dark, Blue-400 for light

    return (
        <Canvas>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
            <ambientLight intensity={1} />
            <directionalLight position={[3, 2, 1]} />
            <Sphere args={[1, 100, 200]} scale={2.5}>
                <MeshDistortMaterial
                    color={sphereColor}
                    attach="material"
                    distort={0.45}
                    speed={1.5}
                />
            </Sphere>
        </Canvas>
    );
};

export default HeroVisual;