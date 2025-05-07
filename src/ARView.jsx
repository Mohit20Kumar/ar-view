import React from "react";
import { Canvas } from "@react-three/fiber";
import { XR, ARButton, Controllers } from "@react-three/xr";
import { useGLTF } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/model.glb");
  return <primitive object={scene} scale={[0.5, 0.5, 0.5]} />;
}

export default function App() {
  return (
    <>
      <ARButton />
      <Canvas>
        <XR>
          <ambientLight />
          <Model />
          <Controllers />
        </XR>
      </Canvas>
    </>
  );
}
