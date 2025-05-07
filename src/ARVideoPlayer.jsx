import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

const ARVideoPlayer = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
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
    const video = document.createElement("video");
    video.src = "path/to/your/video.mp4"; // Replace with your video URL
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    videoRef.current = video;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // Create video plane
    const geometry = new THREE.PlaneGeometry(1, 0.5625); // 16:9 aspect ratio
    const material = new THREE.MeshBasicMaterial({ map: videoTexture });
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
      video.play();
    });

    // AR session end event
    renderer.xr.addEventListener("sessionend", () => {
      video.pause();
    });

    // Animation loop
    renderer.setAnimationLoop(() => {
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

  return (
    <div className='ar-container' ref={containerRef}>
      <div className='instructions'>
        <p>Tap the "Start AR" button and point your camera at a surface.</p>
      </div>
    </div>
  );
};

export default ARVideoPlayer;
