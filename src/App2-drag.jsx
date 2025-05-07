import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const store = createXRStore();

export function App() {
  const [videoTexture, setVideoTexture] = useState(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  const [videoPos, setVideoPos] = useState([0, 1, -2]);
  const dragOffset = useRef([0, 0, 0]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const video = document.createElement("video");
    videoRef.current = video;
    video.src =
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false;
    video.playsInline = true;

    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      texture.encoding = THREE.sRGBEncoding;
      setVideoTexture(texture);
      setVideoReady(true);
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

  const handlePointerDown = (e) => {
    setDragging(true);
    const pointerPos = e.point;
    dragOffset.current = [
      videoPos[0] - pointerPos.x,
      videoPos[1] - pointerPos.y,
      videoPos[2] - pointerPos.z,
    ];
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const pointerPos = e.point;
    setVideoPos([
      pointerPos.x + dragOffset.current[0],
      pointerPos.y + dragOffset.current[1],
      pointerPos.z + dragOffset.current[2],
    ]);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  return (
    <>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <button onClick={playVideo}>Play Video</button>
      <Canvas>
        <XR store={store}>
          <mesh
            position={videoPos}
            rotation={[0, 0, 0]}
            scale={[1.77, 1, 1]}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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
