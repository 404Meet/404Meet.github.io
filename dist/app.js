import * as THREE from './assets/three.module.js';
import { GLTFLoader } from './assets/GLTFLoader.js';
import { DRACOLoader } from './assets/DRACOLoader.js';
import { vertexShader, fragmentShader } from './assets/ribbon-shaders.js';
import { postVertexShader, postFragmentShader } from './assets/postprocessing-shaders.js';

// Visual tuning constants. Keep the reference scale separate from responsive sizing.
const MODEL_SCALE = 0.8;
// Accessibility and page-level interactions.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reduced;
const motion = document.querySelector('#motion');
motion.textContent = paused ? '▶' : 'Ⅱ';
motion.addEventListener('click', () => {
  paused = !paused;
  motion.textContent = paused ? '▶' : 'Ⅱ';
  motion.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
});
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }),
  { threshold: 0.08 },
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
function metadata() {
  document.querySelector('#time').textContent = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
  });
  document.querySelector('#dimensions').textContent = `${innerWidth} × ${innerHeight}`;
}
metadata();
setInterval(metadata, 1000);
document.querySelector('#year').textContent = new Date().getFullYear();
// Use section positions so the active tab stays correct for tall sections.
const navigationSections = ['index', 'about', 'work', 'contact'].map((id) =>
  document.getElementById(id),
);
function updateNavigation() {
  let activeSection = 'index';
  navigationSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= innerHeight * 0.45) {
      activeSection = section.id;
    }
  });
  document.querySelectorAll('nav a').forEach((link) => {
    const active = link.getAttribute('href') === `#${activeSection}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
// Scroll-linked overlay: the canvas remains behind the About copy.
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const story = document.querySelector('.intro-story'),
  about = document.querySelector('#about'),
  sceneElement = document.querySelector('.scene');
function scrollTransition() {
  updateNavigation();
  const y = scrollY,
    h = innerHeight;
  const end = story.offsetHeight - h * 0.25;
  const fade = smooth(h * 0.25, h * 0.95, y);
  sceneElement.style.setProperty(
    '--shade',
    String(fade * 0.9 + smooth(end - h * 0.4, end, y) * 0.1),
  );
  document.querySelector('.hero-title').style.opacity = 1 - smooth(0, h * 0.6, y);
  document.querySelector('.scene-note').style.opacity =
    (1 - smooth(0, h * 0.5, y)) * 0.65;
  document.querySelector('.ruler').style.opacity =
    (1 - smooth(h * 0.3, h * 0.8, y)) * 0.35;
  const appearance = smooth(h * 0.25, h * 0.85, y);
  about.style.opacity = appearance;
  about.style.transform = `translateY(${(1 - appearance) * 50}px)`;
  about.querySelectorAll('p').forEach((paragraph, index) => {
    const progress = reduced
      ? 1
      : smooth(h * (0.2 + index * 0.08), h * (0.65 + index * 0.08), y);
    paragraph.style.opacity = 0.15 + progress * 0.85;
    paragraph.style.transform = `translateY(${(1 - progress) * 24}px)`;
  });
  sceneElement.style.visibility = y > story.offsetHeight ? 'hidden' : 'visible';
}
addEventListener('scroll', scrollTransition, { passive: true });
addEventListener('resize', scrollTransition);
scrollTransition();
// Original three-part M scene, refraction passes, and post-processing.
try {
  const canvas = document.querySelector('#hero');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0353B7');
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 200);
  camera.position.set(12, 6, 12);
  camera.lookAt(0, 0, 0);
  const group = new THREE.Group();
  scene.add(group);
  group.rotation.y = reduced ? 0 : -Math.PI;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshBasicMaterial({ color: '#0353B7' }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -27;
  scene.add(plane);
  const grid = new THREE.GridHelper(250, 50, 0xffffff, 0xffffff);
  grid.position.set(-10, -20, -10);
  grid.material.transparent = true;
  grid.material.opacity = 0.05;
  scene.add(grid);
  const matTexture = new THREE.TextureLoader().load('./assets/cutting-mat.svg');
  matTexture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshBasicMaterial({
      map: matTexture,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    }),
  );
  mat.position.set(-47.4, -20.5, -36);
  mat.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  scene.add(mat);
  function label(text, position, rotation = 0, width = 24) {
    const c = document.createElement('canvas');
    c.width = 1536;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.font = `${(1536 * 0.6) / width}px monospace`;
    ctx.fillStyle = '#C4C9D4';
    text.split('\n').forEach((line, i) => ctx.fillText(line, 10, 76 + i * 80));
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, width / 6),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(c),
        transparent: true,
        depthWrite: false,
      }),
    );
    mesh.position.set(...position);
    mesh.rotation.set(-Math.PI / 2, 0, rotation);
    scene.add(mesh);
    return { ctx, c, mesh };
  }
  label('commit: meet-popat / portfolio-2026', [-45, -20, -65.5]);
  label('x0: 0.00000\ny0: 0.00000\nz0: 0.00000', [-52, -20, -32.5], Math.PI / 2, 12);
  label('x1: 0.00000\ny1: 0.00000\nz1: 0.00000', [-52, -20, -38], Math.PI / 2, 12);
  label('x2: 0.00000\ny2: 0.00000\nz2: 0.00000', [-47, -20, -32.5], Math.PI / 2, 12);
  label('camera:\n-0.33983690\n 0.78539816', [-22, -20, -40], Math.PI / 2, 12);
  // Render the background, back faces, and front faces into separate textures.
  const targetA = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const targetB = targetA.clone(),
    finalTarget = targetA.clone();
  const materials = Array.from(
    { length: 3 },
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uSceneTex: { value: null },
          uTransparent: { value: 0 },
          uRefractPower: { value: 0 },
          winResolution: { value: new THREE.Vector2() },
          uLight: { value: new THREE.Vector3(0, 5, 0) },
        },
      }),
  );
  const draco = new DRACOLoader().setDecoderPath('./assets/draco/');
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const gltf = await loader.loadAsync('./assets/m-logo.glb');
  const nodes = ['M', 'M001', 'M002'].map((name) => gltf.scene.getObjectByName(name));
  if (nodes.some((n) => !n)) throw new Error('Original M geometry missing');
  const destinations = [
      [7, 3.75, 7],
      [-5, -2.75, -5],
      [2.5, 1.375, 2.5],
    ],
    starts = [
      [5, -20, 5],
      [-5, -10, -5],
      [-7, -15, -8],
    ];
  const meshes = nodes.map((n, i) => {
    const m = new THREE.Mesh(n.geometry, materials[i]);
    m.scale.setScalar(4.8);
    m.position.set(...(reduced ? destinations[i] : starts[i]));
    group.add(m);
    return m;
  });
  // Compose the refraction result with blueprint post-processing.
  const postScene = new THREE.Scene(),
    postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const post = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      map: { value: finalTarget.texture },
      time: { value: 0 },
      pixel: { value: new THREE.Vector2() },
    },
    vertexShader: postVertexShader,
    fragmentShader: postFragmentShader,
  });
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
  let pointer = 0,
    time = 0,
    last = 0,
    elapsed = 0,
    rotation = 0;
  const controller = document.querySelector('#scene-controller');
  controller?.addEventListener('input', () => {
    rotation = (Number(controller.value) - 0.5) * Math.PI * 4;
  });
  addEventListener('pointermove', (e) => {
    pointer = (e.clientX / innerWidth - 0.5) * 2;
  });
  // Keep geometry and screen-space refraction aligned on viewport changes.
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.left = -w / 60;
    camera.right = w / 60;
    camera.top = h / 60;
    camera.bottom = -h / 60;
    camera.updateProjectionMatrix();
    group.scale.setScalar(Math.max(Math.min((1.25 * w) / h, 1.15), 0.75) * MODEL_SCALE);
    const d = renderer.getPixelRatio();
    [targetA, targetB, finalTarget].forEach((t) => t.setSize(w * d, h * d));
    materials.forEach((m) => m.uniforms.winResolution.value.set(w * d, h * d));
    post.uniforms.pixel.value.set(1 / (w * d), 1 / (h * d));
  }
  resize();
  addEventListener('resize', resize);
  // Frame-rate-independent entrance, float, rotation, and pointer parallax.
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!paused) {
      time += dt;
      elapsed += dt;
    }
    const damping = 1 - Math.exp(-dt * 3);
    if (!paused) {
      group.rotation.y += (rotation - group.rotation.y) * (1 - Math.exp(-dt * 2));
      meshes.forEach((m, i) => {
        m.position.lerp(new THREE.Vector3(...destinations[i]), 1 - Math.exp(-dt * 2.4));
        const r = group.rotation.y;
        m.rotation.set(i === 1 ? -r : r, i === 2 ? -r : 0, 0);
      });
      group.position.y = Math.sin(time) * 0.85;
      group.rotation.x = Math.cos(time) / 80;
      group.rotation.z = Math.sin(time) / 80;
      const intro = reduced ? 0 : (-Math.PI / 3) * Math.exp(-elapsed * 1.8);
      camera.position.lerp(
        new THREE.Vector3(
          12 - 12 * Math.sin(intro) + pointer * 1.75,
          6 - 15 * Math.sin(intro),
          12 * Math.cos(intro) - pointer * 1.75,
        ),
        damping,
      );
      camera.lookAt(0, 0, 0);
    }
    if (scrollY > story.offsetHeight) return;
    post.uniforms.time.value = time;
    meshes.forEach((m) => (m.visible = false));
    renderer.setRenderTarget(targetB);
    renderer.render(scene, camera);
    meshes.forEach((m, i) => {
      m.visible = true;
      const u = materials[i].uniforms;
      u.uSceneTex.value = targetB.texture;
      u.uRefractPower.value = 0.9;
      u.uTransparent.value = 0.05 * (innerWidth < innerHeight ? 2 : 1);
      materials[i].side = THREE.BackSide;
    });
    renderer.setRenderTarget(targetA);
    renderer.render(scene, camera);
    meshes.forEach((m, i) => {
      const u = materials[i].uniforms;
      u.uSceneTex.value = targetA.texture;
      u.uRefractPower.value = 0.7;
      u.uTransparent.value = 0.05 * (innerWidth < innerHeight ? 2 : 1);
      materials[i].side = THREE.FrontSide;
    });
    renderer.setRenderTarget(finalTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }
  requestAnimationFrame(frame);
} catch (error) {
  console.error('3D scene unavailable', error);
  motion.hidden = true;
  document.querySelector('.scene').classList.add('scene-error');
}
