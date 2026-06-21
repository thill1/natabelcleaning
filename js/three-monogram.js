/* =========================================================
   Sentient Partners — 3D Platinum SP Monogram (Three.js)
   Uses the actual sentient-mark.png logo as a 3D textured
   plane with metallic material, subtle depth, slow rotation,
   and cursor-tilt camera.

   Self-contained. Exposes window.SPMonogram.create(selector, opts).
   ========================================================= */
(function () {
  'use strict';
  if (!window.THREE) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function create(selector, opts) {
    opts = opts || {};
    const mount = document.querySelector(selector);
    if (!mount) return null;

    let W = mount.clientWidth, H = mount.clientHeight;
    // Bail out for unsized/hidden mounts (e.g. mobile where mount is `hidden`).
    if (W < 2 || H < 2) return null;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    /* ---- Lighting (3-point) ---- */
    scene.add(new THREE.AmbientLight(0x6677aa, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xb8d4e3, 1.2);
    rim.position.set(-4, -2, -3); scene.add(rim);
    const fill = new THREE.PointLight(0xc7cdd6, 0.8, 25);
    fill.position.set(0, -3, 3); scene.add(fill);

    /* ---- Logo texture ---- */
    const texLoader = new THREE.TextureLoader();
    // Resolve relative to index.html root
    const logoURL = (opts.logoURL || 'assets/img/sentient-mark.png');

    texLoader.load(logoURL, function (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      buildLogo(texture);
    }, undefined, function () {
      // Fallback: show a simple platinum disc if image fails
      console.warn('[SPMonogram] Failed to load logo image, using fallback');
      buildLogo(null);
    });

    let logoGroup = null;

    function buildLogo(texture) {
      /* --- Front face: the actual logo image --- */
      const aspect = 1; // logo is roughly square
      const size = opts.size || 2.8;
      const half = size / 2;

      const logoGeo = new THREE.PlaneGeometry(size, size);
      let logoMat;
      if (texture) {
        logoMat = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          metalness: 0.15,
          roughness: 0.45,
          side: THREE.FrontSide,
        });
      } else {
        logoMat = new THREE.MeshStandardMaterial({
          color: 0xc7cdd6,
          metalness: 0.85,
          roughness: 0.25,
        });
      }
      const logoMesh = new THREE.Mesh(logoGeo, logoMat);
      logoMesh.position.z = 0.01; // slightly in front of backer

      /* --- Backer plane: gives the logo a "slab" feel with subtle depth --- */
      const backerGeo = new THREE.PlaneGeometry(size * 1.05, size * 1.05);
      const backerMat = new THREE.MeshStandardMaterial({
        color: 0x1a2744,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.5,
        side: THREE.FrontSide,
      });
      const backerMesh = new THREE.Mesh(backerGeo, backerMat);
      backerMesh.position.z = -0.02;

      /* --- Edge frame: thin platinum border ring --- */
      const edgeGeo = new THREE.RingGeometry(size * 0.52, size * 0.535, 64);
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xc7cdd6,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
      edgeMesh.position.z = 0.005;

      /* --- Assemble --- */
      logoGroup = new THREE.Group();
      logoGroup.add(backerMesh, logoMesh, edgeMesh);
      logoGroup.scale.setScalar(opts.scale || 0.95);
      scene.add(logoGroup);

      /* --- Soft glow disc behind everything --- */
      const glowGeo = new THREE.CircleGeometry(size * 1.2, 64);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xb8d4e3,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -1.5;
      scene.add(glow);

      if (!reduced) startLoop();
      else renderer.render(scene, camera);
    }

    /* ---- Theme-aware adjustments ---- */
    function applyTheme() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      // In light mode, reduce glow and adjust backer
      // (handled on rebuild — simple approach: just adjust glow opacity)
    }

    /* ---- Cursor interaction ---- */
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
    function onMove(e) {
      const r = mount.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      targetRY = nx * 0.35;
      targetRX = -ny * 0.2;
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    /* ---- Resize ---- */
    function resize() {
      W = mount.clientWidth; H = mount.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });

    /* ---- Animation loop ---- */
    let running = false, rafId = null, t = 0;
    function frame() {
      if (!running) return;
      t += 0.004;

      if (logoGroup && !reduced) {
        // Gentle floating oscillation — NOT full spin (we want the logo readable)
        logoGroup.rotation.y = Math.sin(t * 0.6) * 0.12 + curRY * 0.8;
        logoGroup.rotation.x = Math.sin(t * 0.4) * 0.06 + curRX * 0.5;
        logoGroup.position.y = Math.sin(t * 0.5) * 0.08;

        // Smooth cursor follow
        curRX += (targetRX - curRX) * 0.05;
        curRY += (targetRY - curRY) * 0.05;

        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }

    function startLoop() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    /* ---- IntersectionObserver: pause when offscreen ---- */
    if (!reduced) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.isIntersecting ? startLoop() : stop();
        });
      }, { threshold: 0.05 });
      io.observe(mount);
    }

    return { start: startLoop, stop: stop, resize: resize };
  }

  window.SPMonogram = { create };
})();
