import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

// All geometry is generated here; the reference site's models are not reused.
export function createPlanet(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const swatchCanvas = document.createElement('canvas');
  swatchCanvas.width = swatchCanvas.height = 1;
  const context = swatchCanvas.getContext('2d', { willReadFrequently: true });
  const color = (value) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
  };
  const palette = {
    snow: color('oklch(0.95 0.018 195)'),
    snowShadow: color('oklch(0.75 0.036 220)'),
    ice: color('oklch(0.68 0.088 196)'),
    deepIce: color('oklch(0.42 0.065 205)'),
    pine: color('oklch(0.33 0.053 175)'),
    pineTip: color('oklch(0.43 0.063 175)'),
    bark: color('oklch(0.32 0.028 35)'),
    cabin: color('oklch(0.43 0.065 40)'),
    roof: color('oklch(0.55 0.16 14)'),
    window: color('oklch(0.87 0.12 70)'),
    starlight: color('oklch(0.83 0.035 190)'),
    starWarm: color('oklch(0.78 0.055 65)'),
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const rig = new THREE.Group();
  const world = new THREE.Group();
  scene.add(rig);
  rig.add(world);
  const initial = { x: 0.13, y: -0.24 };
  world.rotation.set(initial.x, initial.y, -0.1);

  const hemisphere = new THREE.HemisphereLight(color('oklch(0.85 0.045 205)'), color('oklch(0.3 0.025 220)'), 2.1);
  const key = new THREE.DirectionalLight(color('oklch(0.95 0.025 195)'), 3.3);
  key.position.set(-3, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -4;
  key.shadow.camera.right = key.shadow.camera.top = 4;
  key.shadow.normalBias = 0.035;
  const rim = new THREE.DirectionalLight(color('oklch(0.79 0.07 180)'), 2.3);
  rim.position.set(4, 1, -3);
  scene.add(hemisphere, key, rim);

  let seed = 1727;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const noise = new ImprovedNoise();
  const axis = new THREE.Vector3(0, 1, 0);
  const lakeCenter = new THREE.Vector3(0.48, 0.08, 0.87).normalize();
  const lakeDistance = (normal) => normal.distanceTo(lakeCenter) + noise.noise(normal.x * 8, normal.y * 8, normal.z * 8) * 0.055;
  const terrain = (normal) => {
    const broad = noise.noise(normal.x * 2.4 + 13, normal.y * 2.4, normal.z * 2.4);
    const detail = noise.noise(normal.x * 8, normal.y * 8 + 8, normal.z * 8) * 0.018;
    const mountain = Math.pow(Math.max(0, noise.noise(normal.x * 3.7 + 4, normal.y * 3.7, normal.z * 3.7)), 2) * 0.5;
    const radius = 2.08 + broad * 0.075 + detail + mountain;
    return lakeDistance(normal) < 0.5 ? Math.min(2.075, radius) : radius;
  };
  const surface = new THREE.IcosahedronGeometry(1, 24);
  const position = surface.getAttribute('position');
  const vertexColors = new Float32Array(position.count * 3);
  const normal = new THREE.Vector3();
  const faceColor = new THREE.Color();
  for (let i = 0; i < position.count; i += 3) {
    normal.fromBufferAttribute(position, i).normalize();
    const lake = lakeDistance(normal);
    if (lake < 0.49) {
      faceColor.copy(palette.deepIce).lerp(palette.ice, 0.2 + lake * 1.35 + random() * 0.1);
    } else {
      faceColor.copy(palette.snowShadow).lerp(palette.snow, 0.58 + random() * 0.42);
    }
    for (let j = 0; j < 3; j++) {
      normal.fromBufferAttribute(position, i + j).normalize();
      normal.multiplyScalar(terrain(normal));
      position.setXYZ(i + j, normal.x, normal.y, normal.z);
      vertexColors[(i + j) * 3] = faceColor.r;
      vertexColors[(i + j) * 3 + 1] = faceColor.g;
      vertexColors[(i + j) * 3 + 2] = faceColor.b;
    }
  }
  surface.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
  surface.computeVertexNormals();
  const globe = new THREE.Mesh(surface, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.83, flatShading: true }));
  globe.receiveShadow = true;
  world.add(globe);

  const materials = {
    snow: new THREE.MeshStandardMaterial({ color: palette.snow, flatShading: true, roughness: 0.92 }),
    pine: new THREE.MeshStandardMaterial({ color: palette.pine, flatShading: true, roughness: 0.95 }),
    pineTip: new THREE.MeshStandardMaterial({ color: palette.pineTip, flatShading: true }),
    bark: new THREE.MeshStandardMaterial({ color: palette.bark, roughness: 1 }),
    cabin: new THREE.MeshStandardMaterial({ color: palette.cabin, roughness: 0.88 }),
    roof: new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.8 }),
    window: new THREE.MeshStandardMaterial({ color: palette.window, emissive: palette.window, emissiveIntensity: 1.6, roughness: 0.4 }),
    darkWindow: new THREE.MeshStandardMaterial({ color: palette.deepIce, roughness: 0.3 }),
    stone: new THREE.MeshStandardMaterial({ color: palette.snowShadow, flatShading: true }),
  };
  const place = (object, direction, offset = 0) => {
    direction.normalize();
    object.position.copy(direction).multiplyScalar(terrain(direction) + offset);
    object.quaternion.setFromUnitVectors(axis, direction);
    world.add(object);
    return object;
  };
  const mesh = (geometry, material, parent, x = 0, y = 0, z = 0) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };

  const trunkGeometry = new THREE.CylinderGeometry(0.018, 0.027, 0.18, 5);
  const branchGeometry = new THREE.ConeGeometry(0.13, 0.25, 6);
  const snowGeometry = new THREE.ConeGeometry(0.106, 0.19, 6);
  const cabinDirection = new THREE.Vector3(-0.2, 0.67, 0.72).normalize();
  let trees = 0;
  for (let i = 0; i < 500 && trees < 76; i++) {
    const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
    if (lakeDistance(direction) < 0.59 || direction.distanceTo(cabinDirection) < 0.31) continue;
    const tree = new THREE.Group();
    const scale = 0.65 + random() * 0.95;
    tree.scale.setScalar(scale);
    tree.rotation.y = random() * Math.PI;
    mesh(trunkGeometry, materials.bark, tree, 0, 0.08);
    for (let tier = 0; tier < 3; tier++) {
      const branch = mesh(branchGeometry, tier === 2 ? materials.pineTip : materials.pine, tree, 0, 0.19 + tier * 0.1);
      branch.scale.setScalar(1 - tier * 0.2);
      const cap = mesh(snowGeometry, materials.snow, tree, 0, 0.235 + tier * 0.1);
      cap.scale.setScalar(1 - tier * 0.2);
    }
    place(tree, direction, -0.012);
    trees++;
  }

  const cabin = new THREE.Group();
  mesh(new THREE.BoxGeometry(0.61, 0.055, 0.49), materials.stone, cabin, 0, 0.025);
  mesh(new THREE.BoxGeometry(0.53, 0.3, 0.41), materials.cabin, cabin, 0, 0.19);
  for (let i = 0; i < 5; i++) {
    mesh(new THREE.BoxGeometry(0.55, 0.014, 0.425), materials.bark, cabin, 0, 0.075 + i * 0.055);
  }
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.36, 0);
  roofShape.lineTo(0, 0.29);
  roofShape.lineTo(0.36, 0);
  roofShape.closePath();
  const roofGeometry = new THREE.ExtrudeGeometry(roofShape, { depth: 0.55, bevelEnabled: false });
  mesh(roofGeometry, materials.roof, cabin, 0, 0.345, -0.275);
  const snowRoof = mesh(roofGeometry, materials.snow, cabin, 0, 0.375, -0.28);
  snowRoof.scale.set(1, 0.94, 1.02);
  mesh(new THREE.BoxGeometry(0.09, 0.22, 0.1), materials.bark, cabin, 0.19, 0.57, -0.07);
  mesh(new THREE.BoxGeometry(0.13, 0.03, 0.13), materials.snow, cabin, 0.19, 0.69, -0.07);
  mesh(new THREE.BoxGeometry(0.14, 0.23, 0.02), materials.bark, cabin, -0.13, 0.15, 0.218);
  const windowPane = mesh(new THREE.BoxGeometry(0.16, 0.12, 0.02), materials.window, cabin, 0.12, 0.22, 0.221);
  mesh(new THREE.BoxGeometry(0.012, 0.13, 0.028), materials.bark, cabin, 0.12, 0.22, 0.226);
  mesh(new THREE.BoxGeometry(0.17, 0.012, 0.028), materials.bark, cabin, 0.12, 0.22, 0.226);
  const roundWindow = mesh(new THREE.CircleGeometry(0.05, 16), materials.window, cabin, 0, 0.454, 0.283);
  const cabinLight = new THREE.PointLight(palette.window, 0.75, 1.5, 2);
  cabinLight.position.set(0.12, 0.24, 0.38);
  cabin.add(cabinLight);
  place(cabin, cabinDirection);
  cabin.rotateY(-0.16);

  const smoke = new THREE.Group();
  cabin.add(smoke);
  const smokeMaterial = new THREE.MeshBasicMaterial({ color: palette.snow, transparent: true, opacity: 0.12, depthWrite: false });
  const smokeGeometry = new THREE.IcosahedronGeometry(0.055, 1);
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
    puff.position.set(0.19 + i * 0.012, 0.75 + i * 0.085, -0.07);
    puff.scale.setScalar(0.7 + i * 0.22);
    smoke.add(puff);
  }

  const boulderGeometry = new THREE.IcosahedronGeometry(0.09, 0);
  for (let i = 0; i < 32; i++) {
    const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
    if (lakeDistance(direction) < 0.52 || direction.distanceTo(cabinDirection) < 0.24) continue;
    const boulder = new THREE.Group();
    const stone = mesh(boulderGeometry, materials.stone, boulder);
    stone.scale.set(1.2, 0.8, 1);
    mesh(new THREE.IcosahedronGeometry(0.082, 0), materials.snow, boulder, 0, 0.035);
    place(boulder, direction);
  }

  // A small snow figure ties the scene to the owner's chosen name.
  const snowman = new THREE.Group();
  mesh(new THREE.SphereGeometry(0.085, 10, 8), materials.snow, snowman, 0, 0.075);
  mesh(new THREE.SphereGeometry(0.063, 10, 8), materials.snow, snowman, 0, 0.18);
  const coalGeometry = new THREE.SphereGeometry(0.007, 5, 4);
  mesh(coalGeometry, materials.bark, snowman, -0.023, 0.192, 0.055);
  mesh(coalGeometry, materials.bark, snowman, 0.023, 0.192, 0.055);
  mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.018, 10), materials.bark, snowman, 0, 0.234);
  mesh(new THREE.CylinderGeometry(0.049, 0.056, 0.067, 10), materials.bark, snowman, 0, 0.27);
  mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.025, 10), materials.roof, snowman, 0, 0.139);
  place(snowman, new THREE.Vector3(-0.4, 0.54, 0.74));

  const starCount = 950;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (random() - 0.5) * 34;
    starPositions[i * 3 + 1] = (random() - 0.5) * 22;
    starPositions[i * 3 + 2] = -8 - random() * 16;
    const tint = (random() > 0.85 ? palette.starWarm : palette.starlight).clone().multiplyScalar(0.25 + random() * 0.6);
    tint.toArray(starColors, i * 3);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const starMaterial = new THREE.PointsMaterial({ size: 0.023, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true, depthWrite: false });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const snowfallCount = 160;
  const snowPositions = new Float32Array(snowfallCount * 3);
  for (let i = 0; i < snowfallCount; i++) {
    snowPositions[i * 3] = (random() - 0.5) * 8.2;
    snowPositions[i * 3 + 1] = (random() - 0.5) * 6.5;
    snowPositions[i * 3 + 2] = (random() - 0.5) * 4;
  }
  const flakeGeometry = new THREE.BufferGeometry();
  flakeGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
  const flakes = new THREE.Points(flakeGeometry, new THREE.PointsMaterial({ color: palette.snow, size: 0.017, transparent: true, opacity: 0.45, depthWrite: false }));
  rig.add(flakes);

  const orbitCurve = new THREE.EllipseCurve(0, 0, 2.86, 2.86, 0, Math.PI * 2);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitCurve.getPoints(180));
  const orbit = new THREE.LineLoop(orbitGeometry, new THREE.LineBasicMaterial({ color: palette.ice, transparent: true, opacity: 0.16 }));
  orbit.rotation.set(1.24, -0.34, -0.32);
  rig.add(orbit);
  const moon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 1), materials.snow);
  rig.add(moon);

  let paused = reducedMotion;
  let day = false;
  let disposed = false;
  let visible = true;
  let isDragging = false;
  let dragged = false;
  let pointerId = null;
  const pointer = { x: 0, y: 0, lastX: 0, lastY: 0 };
  const target = { x: initial.x, y: initial.y };
  const raycaster = new THREE.Raycaster();
  const hitPoint = new THREE.Vector2();
  let cabinOn = true;
  let accumulatedTime = 0;
  let previousTime = performance.now();
  let dayBlend = 0;

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const mobile = width <= 1000;
    const compact = mobile && window.innerHeight <= 740;
    camera.aspect = width / height;
    camera.fov = mobile ? 43 : 35;
    camera.position.z = mobile ? 11.6 : 10;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    rig.position.x = mobile ? 0 : visibleWidth * 0.205;
    rig.position.y = mobile ? -visibleHeight * (compact ? 0.2 : 0.18) : -0.02;
    const scale = mobile ? Math.min(visibleWidth * (compact ? 0.14 : 0.16), 0.9) : Math.min(1.07, visibleWidth * 0.073);
    rig.scale.setScalar(scale);
    renderStill();
  }

  function renderStill() {
    if (disposed) return;
    renderer.render(scene, camera);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  visibilityObserver.observe(canvas);

  const onPointerDown = (event) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    pointerId = event.pointerId;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    isDragging = true;
    dragged = false;
  };
  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
    pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
    if (!isDragging || event.pointerId !== pointerId) return;
    const dx = event.clientX - pointer.lastX;
    const dy = event.clientY - pointer.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
    target.y += dx * 0.006;
    target.x = THREE.MathUtils.clamp(target.x + dy * 0.004, -0.8, 0.85);
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    renderStill();
  };
  const onPointerUp = (event) => {
    if (!isDragging || event.pointerId !== pointerId) return;
    isDragging = false;
    pointerId = null;
    if (dragged) return;
    const rect = canvas.getBoundingClientRect();
    hitPoint.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(hitPoint, camera);
    if (raycaster.intersectObject(cabin, true).length) {
      cabinOn = !cabinOn;
      windowPane.material = roundWindow.material = cabinOn ? materials.window : materials.darkWindow;
      document.querySelector('#scene-announcement').textContent = cabinOn ? '木屋亮灯了' : '木屋的灯熄灭了';
      renderStill();
    }
  };
  const onPointerCancel = () => { isDragging = false; pointerId = null; };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);

  function animate(time) {
    if (disposed) return;
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    if (!visible || document.hidden) return;
    const active = !paused && !reducedMotion;
    if (active) {
      accumulatedTime += delta;
      if (!isDragging) target.y += delta * 0.045;
      for (let i = 0; i < snowfallCount; i++) {
        snowPositions[i * 3 + 1] -= delta * (0.085 + i % 5 * 0.015);
        if (snowPositions[i * 3 + 1] < -3.25) snowPositions[i * 3 + 1] = 3.25;
      }
      flakes.geometry.attributes.position.needsUpdate = true;
      stars.rotation.z = Math.sin(accumulatedTime * 0.02) * 0.007;
      for (let i = 0; i < smoke.children.length; i++) {
        const puff = smoke.children[i];
        const phase = (accumulatedTime * 0.18 + i * 0.2) % 1;
        puff.position.y = 0.72 + phase * 0.5;
        puff.position.x = 0.19 + phase * 0.13;
        puff.scale.setScalar(0.55 + phase * 1.2);
        puff.material.opacity = cabinOn ? (1 - phase) * 0.15 : 0;
      }
    }
    const damping = reducedMotion ? 1 : 1 - Math.exp(-delta * 7);
    world.rotation.x += (target.x - world.rotation.x) * damping;
    world.rotation.y += (target.y - world.rotation.y) * damping;
    world.position.y = active ? Math.sin(accumulatedTime * 0.5) * 0.035 : world.position.y;
    dayBlend += ((day ? 1 : 0) - dayBlend) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 3));
    hemisphere.intensity = 2.1 + dayBlend * 1.9;
    key.intensity = 3.3 + dayBlend * 1.7;
    rim.intensity = 2.3 - dayBlend * 0.8;
    renderer.toneMappingExposure = 1.13 + dayBlend * 0.13;
    starMaterial.opacity = 0.7 - dayBlend * 0.52;
    cabinLight.intensity = cabinOn ? 0.75 * (1 - dayBlend * 0.8) : 0;
    moon.position.set(Math.cos(accumulatedTime * 0.1 + 0.4) * 2.86, Math.sin(accumulatedTime * 0.1 + 0.4) * 0.7, Math.sin(accumulatedTime * 0.1 + 0.4) * 2.5);
    renderStill();
  }
  resize();
  renderer.setAnimationLoop(animate);

  return {
    get paused() { return paused; },
    get day() { return day; },
    setPaused(value) {
      paused = value;
      if (value) {
        target.x = world.rotation.x;
        target.y = world.rotation.y;
      } else {
        reducedMotion = false;
      }
    },
    setDay(value) { day = value; },
    setReducedMotion(value) { reducedMotion = value; paused = value; },
    reset() {
      target.x = initial.x;
      target.y = initial.y;
      accumulatedTime = 0;
      if (reducedMotion) { world.rotation.x = target.x; world.rotation.y = target.y; }
      renderStill();
    },
    nudge(key) {
      if (key === 'ArrowLeft') target.y -= 0.15;
      if (key === 'ArrowRight') target.y += 0.15;
      if (key === 'ArrowUp') target.x = Math.max(-0.8, target.x - 0.1);
      if (key === 'ArrowDown') target.x = Math.min(0.85, target.x + 0.1);
      if (reducedMotion) { world.rotation.x = target.x; world.rotation.y = target.y; }
      renderStill();
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      const geometries = new Set();
      const materialSet = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materialSet.add(object.material);
      });
      geometries.forEach((geometry) => geometry.dispose());
      materialSet.forEach((material) => material.dispose());
      renderer.dispose();
    },
  };
}
