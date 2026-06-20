/* =========================================================
   Sentient Partners — 3D Platinum SP Monogram (Three.js)
   Self-contained. Exposes window.SPMonogram.create(selector, opts).
   - Abstract interlocking S+P torus knot forms in metallic platinum
   - Slow auto-rotation + cursor-tilt camera
   - prefers-reduced-motion → static pose
   - IntersectionObserver pause when offscreen
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
    // Avoids creating a degenerate 0x0 WebGL context.
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
    camera.position.set(0, 0, 7);

    // ---- Lighting (3-point + environment-ish) ----
    scene.add(new THREE.AmbientLight(0x6677aa, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 5, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xb8d4e3, 1.4);
    rim.position.set(-6, -2, -4); scene.add(rim);
    const fill = new THREE.PointLight(0xc7cdd6, 1.0, 30);
    fill.position.set(0, -4, 4); scene.add(fill);

    // ---- Platinum material ----
    const mat = new THREE.MeshStandardMaterial({
      color: 0xc7cdd6, metalness: 0.92, roughness: 0.22,
      envMapIntensity: 1.0,
    });

    // Theme-aware material: platinum reads well on navy, but a lighter tint
    // with more roughness holds contrast on the warm-ivory light theme.
    function applyTheme() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      mat.color.setHex(light ? 0x8a93a5 : 0xc7cdd6);
      mat.roughness = light ? 0.35 : 0.22;
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ---- Abstract interlocking "S" + "P" forms ----
    // S: a torus knot that evokes the curve of an S
    const sGeo = new THREE.TorusKnotGeometry(1.25, 0.34, 180, 24, 2, 3);
    const sMesh = new THREE.Mesh(sGeo, mat);
    sMesh.position.x = -0.9;
    // P: a torus (the loop) + a cylinder (the stem) grouped, offset right
    const pGroup = new THREE.Group();
    const pLoop = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.3, 28, 60), mat);
    pLoop.position.set(0.85, 0.45, 0);
    const pStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.9, 28), mat
    );
    pStem.position.set(0.85, -0.5, 0);
    pGroup.add(pLoop, pStem);
    pGroup.position.x = 1.5;

    const group = new THREE.Group();
    group.add(sMesh, pGroup);
    group.scale.setScalar(opts.scale || 0.95);
    scene.add(group);

    // soft inner glow plane behind
    const glowGeo = new THREE.CircleGeometry(3.2, 48);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xb8d4e3, transparent: true, opacity: 0.06, side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -2;
    scene.add(glow);

    // ---- Interaction ----
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
    function onMove(e) {
      const r = mount.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      targetRY = nx * 0.5;
      targetRX = -ny * 0.3;
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    // ---- Resize ----
    function resize() {
      W = mount.clientWidth; H = mount.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });

    // ---- Loop ----
    let running = false, rafId = null, t = 0;
    function frame() {
      if (!running) return;
      t += 0.005;
      if (!reduced) {
        group.rotation.y += 0.004;
        group.rotation.x = Math.sin(t * 0.5) * 0.08;
        curRX += (targetRX - curRX) * 0.06;
        curRY += (targetRY - curRY) * 0.06;
        camera.position.x = curRY * 1.2;
        camera.position.y = curRX * 1.2;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; rafId = requestAnimationFrame(frame); }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

    if (reduced) renderer.render(scene, camera);
    else {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => e.isIntersecting ? start() : stop());
      }, { threshold: 0.05 });
      io.observe(mount);
    }
    return { start, stop, resize };
  }

  window.SPMonogram = { create };
})();
