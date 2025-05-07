import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";

const store = createXRStore();

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

const Scene = ({ modelUrl }) => {
  return (
    <Suspense fallback={null}>
      <Model url={modelUrl} pointerEventsType={{ deny: "grab" }} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      <hemisphereLight intensity={0.8} groundColor='black' />
      <OrbitControls />
    </Suspense>
  );
};

const ModelViewer = ({ modelUrl }) => {
  const [isARSupported, setIsARSupported] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && navigator.xr) {
      navigator.xr
        .isSessionSupported("immersive-ar")
        .then((supported) => setIsARSupported(supported))
        .catch(() => setIsARSupported(false));
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {isARSupported && (
        <button
          onClick={() => store.enterAR()}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            padding: "10px 20px",
          }}>
          Enter AR
        </button>
      )}
      <Canvas camera={{ position: [0, 0, 5] }}>
        <XR store={store}>
          <Scene modelUrl={modelUrl} />
        </XR>
      </Canvas>
    </div>
  );
};

export default ModelViewer;
