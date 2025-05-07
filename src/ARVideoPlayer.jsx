import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, ARButton } from "@react-three/xr";
import * as THREE from "three";

export default function ARVideoPlayer() {
  const videoRef = useRef(null);
  const textureRef = useRef(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/chef.mp4"; // Place video.mp4 inside /public
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video.play().catch((err) => console.warn("Video play failed:", err));

    const texture = new THREE.VideoTexture(video);
    textureRef.current = texture;
    videoRef.current = video;
  }, []);

  return (
    <>
      <ARButton sessionInit={{ requiredFeatures: ["hit-test"] }} />
      <Canvas>
        <XR>
          <ambientLight />
          {textureRef.current && (
            <mesh position={[0, 0, -2]}>
              <planeGeometry args={[1, 0.5625]} />
              <meshBasicMaterial
                map={textureRef.current}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </XR>
      </Canvas>
    </>
  );
}
