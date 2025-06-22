import { useEffect } from "react";
import * as THREE from "three";

export default function App() {
  useEffect(() => {
    let renderer, scene, camera, reelPlane, videoTexture;
    let raycaster = new THREE.Raycaster();
    let touch = new THREE.Vector2();
    let canvas, xrSession, video;
    let startBtn;

    const createStartButton = () => {
      startBtn = document.createElement("button");
      startBtn.innerText = "Start AR";
      startBtn.style.position = "absolute";
      startBtn.style.top = "20px";
      startBtn.style.left = "20px";
      startBtn.style.padding = "10px 20px";
      startBtn.style.fontSize = "18px";
      startBtn.style.background = "rgba(255,255,255,0.9)";
      startBtn.style.border = "none";
      startBtn.style.borderRadius = "8px";
      startBtn.style.zIndex = 1000;
      startBtn.onclick = startAR;
      document.body.appendChild(startBtn);
    };

    const startAR = async () => {
      if (!navigator.xr) {
        alert("WebXR not supported");
        return;
      }

      startBtn.remove();

      xrSession = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local", "dom-overlay"],
        domOverlay: { root: document.body },
      });

      canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      document.body.appendChild(canvas);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.xr.enabled = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera();

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      // 🎥 Video setup
      video = document.createElement("video");
      video.src = "/hehe.mp4";
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = false;
      video.controls = false;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");

      videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;

      const geometry = new THREE.PlaneGeometry(0.45, 0.8); // 9:16
      const material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
      });
      reelPlane = new THREE.Mesh(geometry, material);
      reelPlane.position.set(0, 0, -0.8);
      reelPlane.scale.set(1, 1, 1); // default scale
      scene.add(reelPlane);

      // 👆 Tap to play video
      canvas.addEventListener("click", async (e) => {
        touch.x = (e.clientX / window.innerWidth) * 2 - 1;
        touch.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(touch, camera);
        const intersects = raycaster.intersectObjects([reelPlane]);

        if (intersects.length > 0) {
          try {
            await video.play();
            console.log("Video playing");
          } catch (err) {
            console.warn("Play failed:", err);
          }
        }
      });

      // ✌️ Pinch-to-scale logic
      let initialPinchDistance = null;
      let initialScale = 1;

      canvas.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          initialPinchDistance = Math.hypot(dx, dy);
          initialScale = reelPlane.scale.x;
        }
      });

      canvas.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2 && initialPinchDistance !== null) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentDistance = Math.hypot(dx, dy);
          const scaleFactor = currentDistance / initialPinchDistance;
          const newScale = Math.max(
            0.3,
            Math.min(3, initialScale * scaleFactor)
          );
          reelPlane.scale.set(newScale, newScale, newScale);
        }
      });

      canvas.addEventListener("touchend", (e) => {
        if (e.touches.length < 2) {
          initialPinchDistance = null;
        }
      });

      renderer.xr.setReferenceSpaceType("local");
      renderer.xr.setSession(xrSession);

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

      // ❌ Exit AR
      const exitBtn = document.createElement("button");
      exitBtn.innerText = "Exit AR";
      exitBtn.style.position = "absolute";
      exitBtn.style.bottom = "20px";
      exitBtn.style.left = "20px";
      exitBtn.style.padding = "10px 20px";
      exitBtn.style.fontSize = "18px";
      exitBtn.style.background = "rgba(255,255,255,0.9)";
      exitBtn.style.border = "none";
      exitBtn.style.borderRadius = "8px";
      exitBtn.style.zIndex = 1000;
      exitBtn.onclick = async () => {
        await xrSession.end();
        video.pause();
        renderer.setAnimationLoop(null);
        canvas.remove();
        exitBtn.remove();
        createStartButton();
      };
      document.body.appendChild(exitBtn);
    };

    // 🟢 Initial button
    createStartButton();
  }, []);

  return null;
}
