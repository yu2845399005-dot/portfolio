import * as THREE from './assets/vendor/three.module.min.js';

const stage = document.querySelector('[data-badge-stage]');
const button = stage?.querySelector('.badge-interaction');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// The print uses the original 377:2828 asset, with the Figma dimensions in pixels.
const PRINT = { width:311.905, height:454.7, slotY:17.6235, artY:93.915, artHeight:239.927 };
const mascotUrl = './assets/home-badge/mascot.svg';
const clamp = THREE.MathUtils.clamp;

function roundedPath(PathType, x, y, width, height, radius) {
  const path = new PathType();
  path.moveTo(x + radius, y);
  path.lineTo(x + width - radius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius);
  path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  path.lineTo(x + radius, y + height);
  path.quadraticCurveTo(x, y + height, x, y + height - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

async function makePrint(maxTextureSize) {
  const image = new Image();
  image.src = mascotUrl;
  await Promise.all([image.decode(), document.fonts.ready]);
  const canvas = document.createElement('canvas');
  const textureHeight = Math.min(4096, maxTextureSize);
  const resolution = textureHeight / PRINT.height;
  canvas.width = Math.round(PRINT.width * resolution);
  canvas.height = textureHeight;
  const ctx = canvas.getContext('2d');
  ctx.scale(resolution, resolution);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, PRINT.width, PRINT.height);
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#34383e';
  ctx.font = '400 11.5px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Yucean Design', 17.135, 44.241);
  ctx.textAlign = 'right';
  ctx.fillText('2026101522', PRINT.width - 17.135, 44.241);
  ctx.drawImage(image, 0, PRINT.artY, PRINT.width, PRINT.artHeight);
  ctx.textAlign = 'center';
  ctx.font = '600 29.494px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText('APIPKA', PRINT.width / 2, 369.516);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function clothTextures() {
  const cloth = document.createElement('canvas');
  cloth.width = 128;
  cloth.height = 1024;
  const ctx = cloth.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
  gradient.addColorStop(0, '#020202');
  gradient.addColorStop(.18916, '#050505');
  gradient.addColorStop(.62, '#989b9e');
  gradient.addColorStop(1, '#f7f7f5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 1024);
  for (let x = 0; x < 128; x += 3) {
    ctx.fillStyle = x % 2 ? '#ffffff0c' : '#0000000c';
    ctx.fillRect(x, 0, 1, 1024);
  }
  for (let y = 0; y < 1024; y += 5) {
    ctx.fillStyle = '#ffffff08';
    ctx.fillRect(0, y, 128, 1);
  }
  ctx.fillStyle = '#ffffff24';
  ctx.fillRect(3, 0, 2, 1024);
  ctx.fillRect(123, 0, 2, 1024);
  // Fade the actual ribbon's opacity, including its weave and edges.
  ctx.globalCompositeOperation = 'destination-in';
  const fade = ctx.createLinearGradient(0, 0, 0, 1024);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(.2, 'rgba(0,0,0,0)');
  fade.addColorStop(.48, 'rgba(0,0,0,.35)');
  fade.addColorStop(.8, 'rgba(0,0,0,1)');
  fade.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, 128, 1024);
  const texture = new THREE.CanvasTexture(cloth);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

async function mountBadge() {
  // Keep the last crisp frame available while the animation sleeps.
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, preserveDrawingBuffer:true, powerPreference:'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(3, Math.max(2, devicePixelRatio)));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const firstScreen = stage.closest('.first-screen');
  const surface = document.createElement('div');
  surface.className = 'badge-render-layer';
  surface.setAttribute('aria-hidden', 'true');
  surface.append(renderer.domElement);
  firstScreen.append(surface);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2.7, 2.7, 3.365, -3.365, .1, 50);
  camera.position.z = 16;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x68758a, 1.8));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const rimLight = new THREE.DirectionalLight(0x9cbbff, 2);
  rimLight.position.set(6, 1, -2);
  scene.add(rimLight);
  const lower = new THREE.DirectionalLight(0xffffff, .8);
  lower.position.set(0, -4, 6);
  scene.add(lower);

  const w = PRINT.width / 100, h = PRINT.height / 100;
  const slotCenter = h / 2 - PRINT.slotY / 100;
  const bodyShape = roundedPath(THREE.Shape, -w / 2, -h / 2, w, h, .19663);
  bodyShape.holes.push(roundedPath(THREE.Path, -.24578, slotCenter - .073735, .49156, .14747, .073));
  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
    depth:.036, bevelEnabled:true, bevelSegments:4, steps:1,
    bevelSize:.012, bevelThickness:.012, curveSegments:20
  });
  bodyGeometry.translate(0, 0, -.018);
  const pvc = new THREE.MeshPhysicalMaterial({
    color:0xf4f5f7, roughness:.28, metalness:.12, clearcoat:.8, clearcoatRoughness:.2
  });
  const card = new THREE.Group();
  const body = new THREE.Mesh(bodyGeometry, pvc);
  card.add(body);
  const print = await makePrint(renderer.capabilities.maxTextureSize);
  print.anisotropy = renderer.capabilities.getMaxAnisotropy();
  button.dataset.textureSize = print.image.width + 'x' + print.image.height;
  const faceGeometry = new THREE.ShapeGeometry(bodyShape, 32);
  const positions = faceGeometry.attributes.position;
  const uv = faceGeometry.attributes.uv;
  for (let i = 0; i < positions.count; i++) {
    uv.setXY(i, (positions.getX(i) + w / 2) / w, (positions.getY(i) + h / 2) / h);
  }
  const face = new THREE.Mesh(faceGeometry, new THREE.MeshBasicMaterial({ map:print, toneMapped:false }));
  face.position.z = .031;
  card.add(face);
  const back = new THREE.Mesh(faceGeometry, new THREE.MeshPhysicalMaterial({
    color:0xf2f4f6, roughness:.4, clearcoat:.5, side:THREE.BackSide
  }));
  back.position.z = -.031;
  card.add(back);

  // A real through-hole with a recessed inner wall and a very small raised rim.
  const eyelet = roundedPath(THREE.Shape, -.263, slotCenter - .091, .526, .182, .09);
  eyelet.holes.push(roundedPath(THREE.Path, -.24578, slotCenter - .073735, .49156, .14747, .073));
  const eyeletGeometry = new THREE.ExtrudeGeometry(eyelet, {
    depth:.007, bevelEnabled:true, bevelSize:.003, bevelThickness:.003, bevelSegments:2, curveSegments:20
  });
  const eyeletMesh = new THREE.Mesh(eyeletGeometry, new THREE.MeshPhysicalMaterial({
    color:0xbac0c6, roughness:.3, metalness:.65, clearcoat:.7
  }));
  eyeletMesh.position.z = .031;
  card.add(eyeletMesh);

  // Soft specular sheen only, leaving the original printed artwork unaltered.
  const glossCanvas = document.createElement('canvas');
  glossCanvas.width = 256; glossCanvas.height = 512;
  const gloss = glossCanvas.getContext('2d');
  const glossGradient = gloss.createLinearGradient(0, 0, 256, 512);
  glossGradient.addColorStop(0, '#ffffff00');
  glossGradient.addColorStop(.38, '#ffffff00');
  glossGradient.addColorStop(.5, '#ffffff25');
  glossGradient.addColorStop(.62, '#ffffff00');
  glossGradient.addColorStop(1, '#ffffff00');
  gloss.fillStyle = glossGradient; gloss.fillRect(0, 0, 256, 512);
  const shine = new THREE.Mesh(faceGeometry, new THREE.MeshBasicMaterial({
    map:new THREE.CanvasTexture(glossCanvas), transparent:true, opacity:.25,
    depthWrite:false, toneMapped:false
  }));
  shine.position.z = .035;
  card.add(shine);

  const pivot = new THREE.Group();
  card.position.y = -slotCenter;
  pivot.add(card);
  scene.add(pivot);

  const segments = 36;
  const ribbonGeometry = new THREE.BufferGeometry();
  const ribbonPositions = new Float32Array((segments + 1) * 2 * 3);
  const ribbonUv = new Float32Array((segments + 1) * 2 * 2);
  const ribbonIndices = [];
  for (let i = 0; i <= segments; i++) {
    ribbonUv.set([0, 1 - i / segments, 1, 1 - i / segments], i * 4);
    if (i < segments) {
      const a = i * 2;
      ribbonIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  ribbonGeometry.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3));
  ribbonGeometry.setAttribute('uv', new THREE.BufferAttribute(ribbonUv, 2));
  ribbonGeometry.setIndex(ribbonIndices);
  const ribbon = new THREE.Mesh(ribbonGeometry, new THREE.MeshStandardMaterial({
    map:clothTextures(), roughness:.9, metalness:.02, side:THREE.DoubleSide,
    transparent:true, depthWrite:false
  }));
  ribbon.renderOrder = 2;
  scene.add(ribbon);
  // Folded return tab passes behind the card instead of ending on its surface.
  const returnTab = new THREE.Mesh(new THREE.PlaneGeometry(.235, .23), new THREE.MeshStandardMaterial({
    color:0xd8d9d7, roughness:.9, side:THREE.DoubleSide
  }));
  returnTab.position.set(0, slotCenter + .035, -.055);
  returnTab.rotation.x = -.25;
  card.add(returnTab);

  let frame = 0, previous = 0, visible = true, dragging = false;
  let angle = -.012, velocity = 0, twist = .035, twistVelocity = 0, tip = 0, tipVelocity = 0;
  let targetAngle = -.012, targetTwist = .035, targetTip = 0;
  let stageWidth = 540, stageHeight = 673, worldHeight = 6.73;
  let pixelScale = 100, anchorX = 0, anchorY = 3.365, strapLength = 1.4;
  let dragOrigin = null, travel = 0;
  const restAngle = -.012;
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const start = new THREE.Vector3(), end = new THREE.Vector3();
  const path = new THREE.CubicBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());

  function resize() {
    const bounds = stage.getBoundingClientRect();
    const screenBounds = firstScreen.getBoundingClientRect();
    const surfaceBounds = surface.getBoundingClientRect();
    stageWidth = bounds.width; stageHeight = bounds.height;
    const mobile = matchMedia('(max-width:720px)').matches;
    pixelScale = mobile
      ? Math.min(stageHeight / 6.45, stageWidth / 5.2)
      : clamp(screenBounds.height * .56, 360, 510) / h;
    const anchorPx = mobile ? bounds.top - surfaceBounds.top : screenBounds.top - surfaceBounds.top + 70;
    const slotPx = mobile ? anchorPx + 1.61 * pixelScale
      : screenBounds.top - surfaceBounds.top + Math.max(130, screenBounds.height * .21) + PRINT.slotY / 100 * pixelScale;
    strapLength = (slotPx - anchorPx) / pixelScale;
    anchorX = (bounds.left + bounds.width / 2 - surfaceBounds.left - surfaceBounds.width / 2) / pixelScale;
    worldHeight = surfaceBounds.height / pixelScale;
    anchorY = worldHeight / 2 - anchorPx / pixelScale;
    camera.left = -surfaceBounds.width / pixelScale / 2; camera.right = surfaceBounds.width / pixelScale / 2;
    camera.top = worldHeight / 2; camera.bottom = -worldHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(surfaceBounds.width, surfaceBounds.height, false);
    button.dataset.cardPixels = Math.round(h * pixelScale);
    const cardTop = surfaceBounds.top + slotPx - PRINT.slotY / 100 * pixelScale;
    stage.style.setProperty('--badge-help-top', (cardTop - bounds.top + h * pixelScale + 14) + 'px');
    wake();
  }

  function updateGeometry(time) {
    const length = strapLength;
    pivot.position.set(anchorX + Math.sin(angle) * length, anchorY - Math.cos(angle) * length, 0);
    pivot.rotation.set(tip, twist, angle);
    shine.material.opacity = .14 + Math.min(.35, Math.abs(twist) * .6);
    start.set(anchorX, anchorY, -.015);
    end.copy(pivot.position);
    end.z += .043;
    path.v0.copy(start);
    path.v1.set(start.x + Math.sin(angle) * .18, start.y - length * .35, -.025);
    path.v2.set(end.x - Math.sin(angle) * .12, end.y + .32, end.z + .06);
    path.v3.copy(end);
    const attribute = ribbonGeometry.attributes.position;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments, point = path.getPoint(t);
      const tangent = path.getTangent(t);
      const normal = new THREE.Vector3(tangent.y, -tangent.x, 0).normalize();
      const width = .125, turn = twist * t;
      normal.multiplyScalar(Math.cos(turn));
      normal.z = Math.sin(turn);
      const ridge = Math.sin(t * Math.PI) * .015;
      for (let side = 0; side < 2; side++) {
        const sign = side === 0 ? 1 : -1;
        attribute.setXYZ(i * 2 + side,
          point.x + normal.x * width * sign, point.y + normal.y * width * sign,
          point.z + normal.z * width * sign + ridge);
      }
    }
    attribute.needsUpdate = true;
    ribbonGeometry.computeVertexNormals();
    button.dataset.pose = angle.toFixed(3) + ',' + twist.toFixed(3);
    renderer.render(scene, camera);
  }

  function render(time) {
    frame = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min((time - previous) / 1000 || .016, .032);
    previous = time;
    const advance = (value, speed, target, spring, damping) => {
      speed += (target - value) * spring * dt;
      speed *= Math.exp(-damping * dt);
      return [value + speed * dt, speed];
    };
    if (!reducedMotion.matches) {
      [angle, velocity] = advance(angle, velocity, targetAngle, dragging ? 100 : 24, dragging ? 12 : 2.5);
      [twist, twistVelocity] = advance(twist, twistVelocity, targetTwist, dragging ? 70 : 19, 3.2);
      [tip, tipVelocity] = advance(tip, tipVelocity, targetTip, 30, 4);
      if (Math.abs(angle) > .34) { angle = clamp(angle, -.34, .34); velocity *= -.3; }
    } else {
      angle = targetAngle; twist = targetTwist; tip = targetTip;
      velocity = twistVelocity = tipVelocity = 0;
    }
    updateGeometry(time);
    const moving = dragging || Math.abs(velocity) + Math.abs(twistVelocity) + Math.abs(tipVelocity) > .0007
      || Math.abs(angle - targetAngle) + Math.abs(twist - targetTwist) + Math.abs(tip - targetTip) > .0005;
    button.dataset.state = dragging ? 'dragging' : moving ? 'swinging' : 'idle';
    if (moving && !reducedMotion.matches) frame = requestAnimationFrame(render);
  }

  function wake() {
    if (!frame && visible && !document.hidden) { previous = performance.now(); frame = requestAnimationFrame(render); }
  }
  function swing(direction = 1) {
    targetAngle = restAngle; targetTwist = .035; targetTip = 0;
    if (!reducedMotion.matches) { velocity = clamp(velocity + direction * 1.1, -1.4, 1.4); twistVelocity = clamp(twistVelocity + direction * .8, -1.1, 1.1); tipVelocity += .22; }
    wake();
  }
  function cardHit(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([body, face], false).length > 0;
  }
  button.addEventListener('pointerdown', event => {
    if (!cardHit(event) || event.button !== 0) return;
    dragging = true; travel = 0;
    dragOrigin = { x:event.clientX, y:event.clientY, angle, twist };
    button.setPointerCapture(event.pointerId);
    button.classList.add('is-dragging');
    wake();
  });
  button.addEventListener('pointermove', event => {
    if (dragging) {
      const dx = event.clientX - dragOrigin.x, dy = event.clientY - dragOrigin.y;
      travel = Math.max(travel, Math.hypot(dx, dy));
      const worldPerPixel = 1 / pixelScale;
      targetAngle = clamp(dragOrigin.angle + dx * worldPerPixel / 3.2, -.3, .3);
      targetTwist = clamp(dragOrigin.twist + dx * .003, -.65, .65);
      targetTip = clamp(-dy * .002, -.22, .22);
      event.preventDefault();
      wake();
    } else if (event.pointerType !== 'touch' && cardHit(event)) {
      const rect = button.getBoundingClientRect();
      targetTwist = .035 + ((event.clientX - rect.left) / rect.width - .5) * .15;
      targetTip = -((event.clientY - rect.top) / rect.height - .5) * .08;
      wake();
    }
  });
  const release = event => {
    if (!dragging) return;
    dragging = false; button.classList.remove('is-dragging');
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    targetAngle = restAngle; targetTwist = .035; targetTip = 0;
    if (travel < 5 && event.type !== 'pointercancel') swing(event.clientX < stage.getBoundingClientRect().left + stageWidth / 2 ? -1 : 1);
    else wake();
    dragOrigin = null;
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('pointerleave', () => {
    if (!dragging) { targetTwist = .035; targetTip = 0; wake(); }
  });
  button.addEventListener('keydown', event => {
    if (['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); swing(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); cancelAnimationFrame(frame); frame = 0;
    stage.classList.remove('badge-ready');
    firstScreen.classList.remove('badge-scene-ready');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    stage.classList.add('badge-ready'); firstScreen.classList.add('badge-scene-ready'); wake();
  });
  new ResizeObserver(resize).observe(stage);
  new ResizeObserver(resize).observe(firstScreen);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin:'100px' }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake();
  });
  reducedMotion.addEventListener('change', wake);
  resize();
  updateGeometry(0);
  stage.classList.add('badge-ready');
  firstScreen.classList.add('badge-scene-ready');
  button.dataset.renderer = 'webgl';
  if (!reducedMotion.matches) { velocity = -.12; twistVelocity = .1; wake(); }
}

if (stage && button) {
  mountBadge().catch(error => {
    // Keep the accessible HTML card visible if WebGL or its texture is unavailable.
    button.dataset.renderer = 'fallback';
    button.addEventListener('click', () => {
      const card = stage.querySelector('.badge-fallback-card');
      card?.animate(reducedMotion.matches ? [{ opacity:1 }, { opacity:.9 }, { opacity:1 }] : [
        { transform:'rotate(-.69deg) rotateY(0deg)' },
        { transform:'rotate(-9deg) rotateY(12deg)', offset:.25 },
        { transform:'rotate(7deg) rotateY(-8deg)', offset:.5 },
        { transform:'rotate(-3deg) rotateY(4deg)', offset:.75 },
        { transform:'rotate(-.69deg) rotateY(0deg)' }
      ], { duration:reducedMotion.matches ? 200 : 1100, easing:'ease-out' });
    });
    console.warn('Badge uses the HTML fallback:', error.message);
  });
}
