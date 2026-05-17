import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';

const ROBOT_MODEL_PATH = '/robot.glb';

function RobotModel() {
	const { scene } = useGLTF(ROBOT_MODEL_PATH);

	return <primitive object={scene} />;
}

function LoadingSpinner() {
	return (
		<Html center>
			<div
				role="status"
				aria-label="Loading 3D robot model"
				style={{
					display: 'grid',
					placeItems: 'center',
					color: 'var(--yellow)',
				}}
			>
				<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
					<circle
						cx="24"
						cy="24"
						r="19"
						fill="none"
						stroke="currentColor"
						strokeWidth="4"
						strokeLinecap="round"
						strokeDasharray="90 40"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="0 24 24"
							to="360 24 24"
							dur="0.9s"
							repeatCount="indefinite"
						/>
					</circle>
				</svg>
			</div>
		</Html>
	);
}

useGLTF.preload(ROBOT_MODEL_PATH);

export default function RobotScene() {
	return (
		<Canvas
			camera={{ position: [0, 0.6, 3], fov: 38 }}
			dpr={[1, 2]}
			gl={{ alpha: true, antialias: true }}
			style={{ height: '100%', width: '100%' }}
		>
			<ambientLight intensity={1.2} />
			<directionalLight position={[3, 4, 5]} intensity={2.5} />
			<Suspense fallback={<LoadingSpinner />}>
				<Bounds fit clip observe margin={1.2}>
					<Center>
						<RobotModel />
					</Center>
				</Bounds>
				<Environment preset="city" />
			</Suspense>
			<OrbitControls autoRotate autoRotateSpeed={3} enablePan={false} enableZoom={false} />
		</Canvas>
	);
}
