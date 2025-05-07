import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const store = createXRStore();

export function App() {
  const [videoTexture, setVideoTexture] = useState(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoScale, setVideoScale] = useState(1); // state for scale
  const initialPinchDistance = useRef(null); // New ref for pinch distance
  const initialVideoScale = useRef(1); // New ref for initial video scale

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

  useEffect(() => {
    function onTouchStart(e) {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
        initialVideoScale.current = videoScale;
      }
    }
    function onTouchMove(e) {
      if (e.touches.length === 2 && initialPinchDistance.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        const scaleFactor = newDistance / initialPinchDistance.current;
        setVideoScale(initialVideoScale.current * scaleFactor);
      }
    }
    function onTouchEnd(e) {
      if (e.touches.length < 2) {
        initialPinchDistance.current = null;
        initialVideoScale.current = videoScale;
      }
    }
    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [videoScale]);

  const playVideo = () => {
    if (videoRef.current && videoReady) {
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <button onClick={playVideo}>Play Video</button>
      {/* Existing slider remains for manual control */}
      <div>
        <label>Scale: {videoScale}</label>
        <input
          type='range'
          min='0.5'
          max='3'
          step='0.1'
          value={videoScale}
          onChange={(e) => setVideoScale(parseFloat(e.target.value))}
        />
      </div>
      <Canvas>
        <XR store={store}>
          <mesh
            position={[0, 1, -2]}
            rotation={[0, 0, 0]}
            // Base scale multiplied by videoScale
            scale={[1.77 * videoScale, 1 * videoScale, 1 * videoScale]}
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
