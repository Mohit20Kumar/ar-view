import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

const ARVideoPlayer = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    // Check for WebXR support
    if (!navigator.xr) {
      setStatus("WebXR not supported in this browser");
      return;
    }

    let video, videoTexture, videoMaterial;
    let videoPlane, scene, camera, renderer;

    // Create and load video first - this is crucial for mobile browsers
    video = document.createElement("video");
    video.src = "/path/to/your/video.mp4"; // Make sure this path is correct
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true; // Essential for iOS
    video.preload = "auto";
    video.setAttribute("playsinline", ""); // Another way to ensure it works on iOS
    video.setAttribute("webkit-playsinline", "");
    videoRef.current = video;

    // Pre-load the video before AR initialization
    video.load();

    // Add a click event to the document to help with autoplay restrictions
    const handleUserInteraction = () => {
      video.play().catch((e) => console.error("Video play error:", e));
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    // Check if AR is supported
    navigator.xr
      .isSessionSupported("immersive-ar")
      .then((supported) => {
        if (!supported) {
          setStatus("AR not supported on this device");
          return;
        }

        setStatus("AR supported, initializing...");
        initAR();
      })
      .catch((err) => {
        setStatus(`Error checking AR support: ${err.message}`);
        console.error(err);
      });

    function initAR() {
      try {
        // Create scene, camera, and renderer
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true, // May help with video rendering
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        renderer.xr.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Create a debug object to show in scene before video loads
        const debugCube = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.2, 0.2),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        debugCube.position.set(0, 0, -1);
        scene.add(debugCube);

        // Create video texture
        videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.generateMipmaps = false;

        // Create video plane with material
        videoMaterial = new THREE.MeshBasicMaterial({
          map: videoTexture,
          side: THREE.DoubleSide, // Visible from both sides
          transparent: true,
        });

        // Create video plane
        const aspect = video.videoWidth / video.videoHeight || 16 / 9;
        const videoGeometry = new THREE.PlaneGeometry(1 * aspect, 1);
        videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);

        // Position the video in the AR space
        videoPlane.position.set(0, 0, -1.5);
        scene.add(videoPlane);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        // Add AR session button
        const arButton = ARButton.createButton(renderer, {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: document.body },
        });
        document.body.appendChild(arButton);

        // Handle window resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        // AR session events
        renderer.xr.addEventListener("sessionstart", () => {
          console.log("AR session started");
          setStatus("AR session started");

          // Try to play video on session start
          video
            .play()
            .then(() => {
              console.log("Video playing in AR");
              setStatus("Video playing in AR");

              // Update video texture when video is playing
              videoTexture.needsUpdate = true;

              // Make sure red debug cube is removed once video is playing
              scene.remove(debugCube);
            })
            .catch((e) => {
              console.error("Video play error in AR session:", e);
              setStatus(`Video play error: ${e.message}`);
            });
        });

        renderer.xr.addEventListener("sessionend", () => {
          console.log("AR session ended");
          setStatus("AR session ended");
          video.pause();
        });

        // Debug video events
        video.addEventListener("loadedmetadata", () => {
          console.log(
            "Video metadata loaded",
            video.videoWidth,
            video.videoHeight
          );
          setStatus("Video metadata loaded");

          // Update plane aspect ratio with actual video dimensions
          if (videoPlane && video.videoWidth && video.videoHeight) {
            const actualAspect = video.videoWidth / video.videoHeight;
            videoPlane.scale.x = actualAspect;
          }
        });

        video.addEventListener("playing", () => {
          console.log("Video playing event");
          videoTexture.needsUpdate = true;
          setStatus("Video playing");
        });

        video.addEventListener("error", (e) => {
          console.error("Video error:", e);
          setStatus(`Video error: ${e.type}`);
        });

        // Animation loop
        const animate = () => {
          if (videoTexture && video.readyState >= 2) {
            videoTexture.needsUpdate = true;
          }

          // Make debug cube rotate
          if (debugCube) {
            debugCube.rotation.x += 0.01;
            debugCube.rotation.y += 0.01;
          }

          renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(animate);
      } catch (err) {
        console.error("AR initialization error:", err);
        setStatus(`AR error: ${err.message}`);
      }
    }

    // Cleanup
    return () => {
      if (renderer) {
        renderer.setAnimationLoop(null);

        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }

        const arButton = document.querySelector('button[data-type="ar"]');
        if (arButton) {
          arButton.remove();
        }
      }

      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }

      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  return (
    <div
      className='ar-container'
      style={{ position: "relative", width: "100%", height: "100vh" }}
      ref={containerRef}>
      <div
        className='status-overlay'
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          padding: "10px",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          borderRadius: "5px",
          zIndex: 100,
        }}>
        Status: {status}
      </div>

      <div
        className='instructions'
        style={{
          position: "absolute",
          top: "20px",
          left: "0",
          width: "100%",
          textAlign: "center",
          padding: "10px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          zIndex: 100,
        }}>
        <p>Tap the "Start AR" button and point your camera at a surface.</p>
        <p>If video doesn't play, tap the screen once.</p>
      </div>
    </div>
  );
};

export default ARVideoPlayer;
