import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

const ARVideoPlayer = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isARMode, setIsARMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    // Create video element first to start loading
    const video = document.createElement("video");
    video.src = "/chef.mp4"; // Replace with your video URL
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.playsInline = true; // Important for iOS
    video.muted = false; // Enable sound
    video.preload = "auto";
    videoRef.current = video;

    // Add event listeners to monitor video loading
    video.addEventListener("loadedmetadata", () => {
      console.log("Video metadata loaded");
      setIsVideoReady(true);
    });

    // Explicitly pause the video initially
    video.pause();

    video.addEventListener("error", (e) => {
      console.error("Video loading error:", e);
    });

    // Attempt to preload the video without playing
    video.load();

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

    // Add AR session button with custom styles
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body },
      onSessionStart: () => {
        // Set AR mode flag to true when session starts
        setIsARMode(true);
        setShowInstructions(false);

        // Play video with sound when AR starts
        video.muted = false;
        console.log("AR session started, attempting to play video with sound");
        video.play().catch((err) => {
          console.error("Error playing video in AR:", err);
          // If autoplay with sound fails, try with muted first then unmute
          video.muted = true;
          video
            .play()
            .then(() => {
              // Try to unmute after successful play
              video.muted = false;
            })
            .catch((e) => {
              console.error("Even muted autoplay failed:", e);
            });
        });
      },
      onSessionEnd: () => {
        // Set AR mode flag to false when session ends
        setIsARMode(false);
        setShowInstructions(true);

        // Ensure video stops playing when AR ends
        console.log("AR session ended, pausing video");
        video.pause();
      },
    });

    // Style the AR button
    arButton.style.padding = "12px 24px";
    arButton.style.border = "none";
    arButton.style.borderRadius = "30px";
    arButton.style.background = "linear-gradient(135deg, #6e8efb, #a777e3)";
    arButton.style.color = "white";
    arButton.style.fontWeight = "bold";
    arButton.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
    arButton.style.cursor = "pointer";
    arButton.style.marginBottom = "20px";
    arButton.style.fontSize = "16px";
    arButton.style.transition = "transform 0.2s";
    arButton.addEventListener("mouseover", () => {
      arButton.style.transform = "scale(1.05)";
    });
    arButton.addEventListener("mouseout", () => {
      arButton.style.transform = "scale(1)";
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

    // Animation loop
    renderer.setAnimationLoop(() => {
      // Update the video texture in each frame if video is playing and in AR mode
      if (isARMode && video.readyState >= 2 && !video.paused) {
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
  }, [isARMode]); // Add isARMode to the dependency array

  // Helper function to prepare for AR experience
  const prepareForAR = () => {
    if (videoRef.current) {
      // Just ensure video is loaded but not playing
      console.log("Preparing for AR...");
      videoRef.current.load();
      // Hide instructions when starting AR
      setShowInstructions(false);
    }
  };

  return (
    <div className='ar-container' ref={containerRef}>
      <style>
        {`
            .ar-container {
                position: relative;
                height: 100vh;
                width: 100vw;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(to bottom, #1a2a6c, #b21f1f, #fdbb2d);
                color: white;
                font-family: 'Arial', sans-serif;
                overflow: hidden;
            }
            
            .content-wrapper {
                text-align: center;
                z-index: 10;
                padding: 20px;
                border-radius: 15px;
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                max-width: 80%;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            }
            
            .hero-title {
                font-size: 2rem;
                margin-bottom: 1rem;
                background: linear-gradient(to right, #ffffff, #c0c0c0);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                font-weight: bold;
            }
            
            .instructions {
                font-size: 1rem;
                line-height: 1.5;
                margin-bottom: 2rem;
                opacity: 0.9;
            }
            
            .status-message {
                font-size: 0.9rem;
                color: #4CAF50;
                margin-top: 1rem;
                font-style: italic;
            }
            
            .loading-indicator {
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top: 4px solid #ffffff;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
                margin: 10px auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .prepare-button {
                background: linear-gradient(135deg, #00b4db, #0083b0);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 30px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                margin-top: 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .prepare-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 7px 20px rgba(0, 0, 0, 0.25);
            }
            
            .prepare-button:active {
                transform: translateY(1px);
            }
            
            /* Decorative elements */
            .ar-icon {
                position: absolute;
                opacity: 0.1;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M9.4 10.5l4.77-8.26C13.47 2.09 12.75 2 12 2c-2.4 0-4.6.85-6.32 2.25l3.66 6.35.06-.1zM21.54 9c-.92-2.92-3.15-5.26-6-6.34L11.88 9h9.66zm.26 1h-7.49l.29.5 4.76 8.25C21 16.97 22 14.61 22 12c0-.69-.07-1.35-.2-2zM8.54 12l-3.9-6.75C3.01 7.03 2 9.39 2 12c0 .69.07 1.35.2 2h7.49l-1.15-2zm-6.08 3c.92 2.92 3.15 5.26 6 6.34L12.12 15H2.46zm11.27 0l-3.9 6.76c.7.15 1.42.24 2.17.24 2.4 0 4.6-.85 6.32-2.25l-3.66-6.35-.93 1.6z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 50%;
                pointer-events: none;
                z-index: 1;
            }
        `}
      </style>

      <div className='ar-icon'></div>

      {showInstructions && (
        <div className='content-wrapper'>
          <h1 className='hero-title'>AR Video Experience</h1>
          <div className='instructions'>
            <p>Experience a video in augmented reality! Follow these steps:</p>
            <ol style={{ textAlign: "left", paddingInlineStart: "20px" }}>
              <li>Tap the "Start AR" button below</li>
              <li>Point your camera at a flat surface</li>
              <li>When prompted, tap on the surface to place the video</li>
              <li>Enjoy the immersive video with sound!</li>
            </ol>
          </div>

          {!isVideoReady && (
            <>
              <div className='loading-indicator'></div>
              <p className='status-message'>Loading video assets...</p>
            </>
          )}

          <button className='prepare-button' onClick={prepareForAR}>
            Prepare for AR Experience
          </button>
        </div>
      )}
    </div>
  );
};

export default ARVideoPlayer;
