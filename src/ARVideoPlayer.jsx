import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

const ARVideoPlayer = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    // Create video element first to start loading
    const video = document.createElement("video");
    video.src = "/chef.mp4"; // Replace with your video URL
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.playsInline = true; // Important for iOS
    video.muted = true;
    video.preload = "auto";
    videoRef.current = video;

    // Add event listeners to monitor video loading
    video.addEventListener("loadedmetadata", () => {
      console.log("Video metadata loaded");
      setIsVideoReady(true);
    });

    video.addEventListener("error", (e) => {
      console.error("Video loading error:", e);
    });

    // Attempt to preload the video
    video.load();

    // Try to play the video (will be paused later, but helps with loading)
    const playPromise = video.play().catch((e) => {
      console.warn("Auto-play prevented:", e);
      // This is expected on most browsers without user interaction
    });

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Add AR session button
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body },
    });
    document.body.appendChild(arButton);

    // Create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    // Create video plane
    const geometry = new THREE.PlaneGeometry(1, 0.5625); // 16:9 aspect ratio
    const material = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide, // Make the video visible from both sides
    });
    const videoPlane = new THREE.Mesh(geometry, material);

    // Position the video in the AR space
    videoPlane.position.set(0, 0, -1);
    scene.add(videoPlane);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // AR session start event
    renderer.xr.addEventListener("sessionstart", () => {
      console.log("AR session started, attempting to play video");
      // Ensure we really try to play the video when AR starts
      video.play().catch((err) => {
        console.error("Error playing video in AR:", err);
      });
    });

    // AR session end event
    renderer.xr.addEventListener("sessionend", () => {
      console.log("AR session ended, pausing video");
      video.pause();
    });

    // Animation loop
    renderer.setAnimationLoop(() => {
      // Update the video texture in each frame if video is playing
      if (video.readyState >= 2 && !video.paused) {
        videoTexture.needsUpdate = true;
      }
      renderer.render(scene, camera);
    });

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.setAnimationLoop(null);
      if (arButton.parentNode) {
        document.body.removeChild(arButton);
      }
      if (
        containerRef.current &&
        containerRef.current.contains(renderer.domElement)
      ) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.remove(videoPlane);
      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
    };
  }, []);

  // Add a button to explicitly play the video (helps with browser autoplay restrictions)
  const handlePlayVideo = () => {
    if (videoRef.current) {
      console.log("Manual video play attempt");
      videoRef.current
        .play()
        .catch((e) => console.error("Manual play failed:", e));
    }
  };

  return (
    <div className='ar-container' ref={containerRef}>
      <style>
        {`
            .ar-container {
                background-image: url('/bgar.jpg'); /* Replace with your background image URL */
            }
            .instructions {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                text-align: center;
                z-index: 100;
            }
            .play-button {
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                background: #2196F3;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                z-index: 100;
            }
        `}
      </style>
      <div className='instructions'>
        <p>Tap the "Start AR" button and point your camera at a surface.</p>
        {!isVideoReady && <p>Loading video, please wait...</p>}
      </div>
      <button className='play-button' onClick={handlePlayVideo}>
        Play Video
      </button>
    </div>
  );
};

export default ARVideoPlayer;
