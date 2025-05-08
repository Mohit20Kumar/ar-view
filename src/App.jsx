import { Canvas, useFrame } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const store = createXRStore();

function RotatingCube({ position, color }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function App() {
  const [videoTexture, setVideoTexture] = useState(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoScale, setVideoScale] = useState(1);
  const initialPinchDistance = useRef(null);
  const initialVideoScale = useRef(1);

  useEffect(() => {
    const video = document.createElement("video");
    videoRef.current = video;
    // video.src =
    //   "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    video.src = "/public/hehe.mp4";

    // video.crossOrigin = "anonymous";
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
      <Canvas
        onCreated={({ gl }) => {
          gl.xr.addEventListener("sessionend", () => {
            if (videoRef.current) videoRef.current.pause();
          });
        }}>
        <XR store={store}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 2, 2]} />

          {/* Video Plane */}
          <mesh
            position={[0, 1, -2]}
            rotation={[0, 0, 0]}
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

          {/* Rotating Cubes Below */}
          <RotatingCube position={[-0.6, 0.2, -2]} color='red' />
          <RotatingCube position={[0.6, 0.2, -2]} color='blue' />
        </XR>
      </Canvas>
    </>
  );
}

export default App;
