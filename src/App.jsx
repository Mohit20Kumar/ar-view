import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const store = createXRStore();

export function App() {
  const [videoTexture, setVideoTexture] = useState(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = document.createElement("video");
    videoRef.current = video;
    video.src =
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false; // Start muted to allow autoplay
    video.playsInline = true;

    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      texture.encoding = THREE.sRGBEncoding;
      setVideoTexture(texture);
      setVideoReady(true);
      // Try to play only after user interaction
      video.play().catch(console.error);
    });

    return () => {
      video.remove();
      if (videoTexture) videoTexture.dispose();
    };
  }, []);

  const playVideo = () => {
    if (videoRef.current && videoReady) {
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <button onClick={playVideo}>Play Video</button>
      <Canvas>
        <XR store={store}>
          <mesh
            position={[0, 1, -2]}
            rotation={[0, 0, 0]}
            scale={[1.77, 1, 1]}
            onClick={playVideo}>
            <planeGeometry />
            {videoTexture && (
              <meshBasicMaterial
                map={videoTexture}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            )}
          </mesh>
        </XR>
      </Canvas>
    </>
  );
}

export default App;
