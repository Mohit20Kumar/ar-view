import { Canvas, useFrame } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Text, useGLTF } from "@react-three/drei"; // added useGLTF

const store = createXRStore();

// New Model component
function Model({ url, position, rotation = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
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
          <directionalLight
            color='#ffffff'
            intensity={0.7}
            position={[3, 5, 4]}
          />
          {/* added directional light */}
          {/* Video Plane */}
          <mesh
            position={[0, 1, -2]}
            rotation={[0, 0, 0]}
            scale={[1 * videoScale, 1.77 * videoScale, 1 * videoScale]} // changed to portrait mode ratio
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
          {/* AR Text */}
          <Text
            position={[0.8, 1, -2]} // repositioned closer to the video
            fontSize={0.2}
            color='white'
            anchorX='left'
            anchorY='middle'>
            See your special&#10;chef cooking your&#10;amazing dish
          </Text>
          {/* GLB Models */}
          <Model
            url='/public/chicken_wings.glb'
            position={[-0.6, 0.2, -2]}
            scale={0.5} // adjust as needed
          />
          <Model
            url='/public/momos.glb'
            position={[0.6, 0.2, -2]}
            scale={0.5} // adjust as needed
          />
        </XR>
      </Canvas>
    </>
  );
}

export default App;
