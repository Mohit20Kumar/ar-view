import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

const ARVideoPlayer = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [arSupported, setArSupported] = useState(null);

  useEffect(() => {
    // Check if WebXR is supported
    if (!navigator.xr) {
      setError("WebXR not supported in this browser");
      setArSupported(false);
      return;
    }

    // Check if AR is supported
    navigator.xr
      .isSessionSupported("immersive-ar")
      .then((supported) => {
        setArSupported(supported);
        if (!supported) {
          setError("AR not supported on this device");
          return;
        }

        initAR();
      })
      .catch((err) => {
        setError(`Error checking AR support: ${err.message}`);
        console.error(err);
      });

    function initAR() {
      try {
        // Create scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Add AR session button with error handling
        let arButton;
        try {
          arButton = ARButton.createButton(renderer, {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.body },
          });
          document.body.appendChild(arButton);
        } catch (err) {
          setError(`Error creating AR button: ${err.message}`);
          console.error(err);
          return;
        }

        // Create video texture
        const video = document.createElement("video");
        video.src = "/chef.mp4"; // Replace with your video URL
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = false;
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
          console.log("AR session started");
          video.play().catch((e) => console.error("Video playback error:", e));
        });

        // AR session end event
        renderer.xr.addEventListener("sessionend", () => {
          console.log("AR session ended");
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
          if (arButton && arButton.parentNode) {
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
      } catch (err) {
        setError(`Error initializing AR: ${err.message}`);
        console.error(err);
      }
    }
  }, []);

  return (
    <div className='ar-container' ref={containerRef}>
      {error && (
        <div
          className='error-message'
          style={{ color: "red", padding: "20px" }}>
          <h3>Error:</h3>
          <p>{error}</p>
          <p>Tips:</p>
          <ul>
            <li>Make sure you're using HTTPS</li>
            <li>Try on a compatible mobile device</li>
            <li>Use Chrome or another WebXR-compatible browser</li>
            <li>Check that AR is supported on your device</li>
          </ul>
        </div>
      )}
      {!error && arSupported === false && (
        <div className='not-supported' style={{ padding: "20px" }}>
          <h3>WebXR AR Not Supported</h3>
          <p>Your browser or device doesn't support WebXR Augmented Reality.</p>
          <p>
            Try using a compatible mobile device with Chrome or the WebXR Viewer
            app.
          </p>
        </div>
      )}
      {!error && arSupported && (
        <div className='instructions'>
          <p>Tap the "Start AR" button and point your camera at a surface.</p>
        </div>
      )}
    </div>
  );
};

export default ARVideoPlayer;
