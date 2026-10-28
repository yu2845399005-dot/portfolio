import * as THREE from './assets/vendor/three.module.min.js';

const stage = document.querySelector('[data-badge-stage]');
const button = stage?.querySelector('.badge-interaction');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Print layout: 377:2805. Original expression layers: 383:3868.
const PRINT = { width:311.905, height:454.7, slotY:17.6235, artY:93.915, artHeight:239.927 };
const EXPRESSION_ASSETS = {
  normal:'./assets/home-badge/expressions/26745.svg',
  dizzy:'./assets/home-badge/expressions/5838f.svg',
  drag:'./assets/home-badge/expressions/f095b.svg',
  leftMask:'./assets/home-badge/expressions/98fae.svg',
  leftEye:'./assets/home-badge/expressions/a225d.svg',
  rightMask:'./assets/home-badge/expressions/6b3a4.svg',
  rightEye:'./assets/home-badge/expressions/d2974.svg',
  spiral:'./assets/home-badge/expressions/6fa09.svg'
};
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
  let bodyImage;
  const decodeSvg = async svg => {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
    try { image.src = url; await image.decode(); return image; }
    finally { URL.revokeObjectURL(url); }
  };
  const images = Object.fromEntries(await Promise.all(Object.entries(EXPRESSION_ASSETS).map(async ([key,src]) => {
    const image = new Image();
    if (['normal','dizzy','drag'].includes(key)) {
      // Separate original Figma body and eyes so both can move without changing the print.
      const response = await fetch(src);
      if (!response.ok) throw new Error('Cannot load badge expression: ' + key);
      const svg = new DOMParser().parseFromString(await response.text(),'image/svg+xml');
      if (key === 'normal') {
        const bodySvg = svg.cloneNode(true);
        bodySvg.querySelectorAll('g[id^="Frame "]').forEach(eye => eye.remove());
        bodyImage = await decodeSvg(bodySvg);
      }
      svg.getElementById('Vector 319')?.remove();
      svg.getElementById('Vector 320')?.remove();
      return [key,await decodeSvg(svg)];
    } else { image.src = src; await image.decode(); }
    return [key,image];
  })));
  await document.fonts.ready;
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
  ctx.textAlign = 'center';
  ctx.font = '600 29.494px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText('APIPKA', PRINT.width / 2, 369.516);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const bodyCanvas = document.createElement('canvas');
  bodyCanvas.width = Math.min(2048,maxTextureSize);
  bodyCanvas.height = Math.round(bodyCanvas.width*80/104);
  bodyCanvas.getContext('2d').drawImage(bodyImage,0,0,bodyCanvas.width,bodyCanvas.height);
  const bodyTexture = new THREE.CanvasTexture(bodyCanvas);
  bodyTexture.colorSpace = THREE.SRGBColorSpace;
  // Compose the second face from the exact exported eye layers and Figma alpha masks.
  const maskedEye = (eye, mask, imageRect, maskRect) => {
    const x = Math.min(imageRect[0], maskRect[0]), y = Math.min(imageRect[1], maskRect[1]);
    const width = Math.max(imageRect[0]+imageRect[2],maskRect[0]+maskRect[2])-x;
    const height = Math.max(imageRect[1]+imageRect[3],maskRect[1]+maskRect[3])-y;
    const pixels = resolution * PRINT.width / 104;
    const eyeCanvas = document.createElement('canvas');
    eyeCanvas.width = Math.ceil(width*pixels); eyeCanvas.height = Math.ceil(height*pixels);
    const eyeContext = eyeCanvas.getContext('2d');
    eyeContext.setTransform(pixels,0,0,pixels,-x*pixels,-y*pixels);
    eyeContext.drawImage(eye,...imageRect);
    eyeContext.globalCompositeOperation = 'destination-in';
    eyeContext.drawImage(mask,...maskRect);
    return { image:eyeCanvas,x,y,width,height };
  };
  const leftEye = maskedEye(images.leftEye,images.leftMask,[37.94,24,16,16],[37.773,24.152,23.2292,12.8484]);
  const rightEye = maskedEye(images.rightEye,images.rightMask,[51.06,24,16,16],[49.997,23,18,14]);
  const eyeTextures = Object.fromEntries(['normal','tap','dizzy','drag'].map(name => {
    const layer = document.createElement('canvas');
    layer.width = Math.min(1024,maxTextureSize);
    layer.height = Math.round(layer.width*80/104);
    const eyes = layer.getContext('2d');
    eyes.scale(layer.width/104,layer.height/80);
    if (name === 'tap') {
      for (const eye of [leftEye,rightEye]) eyes.drawImage(eye.image,eye.x,eye.y,eye.width,eye.height);
    } else {
      eyes.drawImage(images[name],0,0,104,80);
      if (name === 'dizzy') eyes.drawImage(images.spiral,54.5,27.5,9,8.50013);
    }
    const eyeTexture = new THREE.CanvasTexture(layer);
    eyeTexture.colorSpace = THREE.SRGBColorSpace;
    return [name,eyeTexture];
  }));
  return {texture,bodyTexture,eyeTextures};
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
  const {texture:print,bodyTexture,eyeTextures} = await makePrint(renderer.capabilities.maxTextureSize);
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
  const artHeight = PRINT.artHeight/100;
  // Animate around the character's lower body, keeping text and the badge rigid.
  const character = new THREE.Group();
  character.position.set(0,h/2-PRINT.artY/100-artHeight*.82,.032);
  const characterGeometry = new THREE.PlaneGeometry(w,artHeight);
  const characterBody = new THREE.Mesh(characterGeometry,new THREE.MeshBasicMaterial({
    map:bodyTexture,transparent:true,depthWrite:false,toneMapped:false
  }));
  characterBody.position.y = artHeight*(.82-.5);
  character.add(characterBody);
  card.add(character);
  const eyesPivot = new THREE.Group();
  eyesPivot.position.set(0,artHeight*(.82-32/80),.001);
  const eyesMaterial = new THREE.MeshBasicMaterial({
    map:eyeTextures.normal, transparent:true, depthWrite:false, toneMapped:false
  });
  const eyesMesh = new THREE.Mesh(new THREE.PlaneGeometry(w,artHeight),eyesMaterial);
  eyesMesh.position.y = -artHeight*(.5-32/80);
  eyesPivot.add(eyesMesh);
  character.add(eyesPivot);
  for (const eyeTexture of [bodyTexture,...Object.values(eyeTextures)]) {
    eyeTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    renderer.initTexture(eyeTexture);
  }
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
  let expressionName = 'normal', expressionTimer = 0, idleTimer = 0;
  let eyeTransition = null, eyeOpenness = 1;
  let squash = 0, squashVelocity = 0, lean = 0, leanVelocity = 0;
  let targetSquash = 0, targetLean = 0;
  const entrance = {phase:'pending',y:0,velocity:0,gravity:0,age:0,bounces:0,greeted:false,bounceSpeed:0};
  let lastTapTime = -Infinity, lastTapX = 0, lastTapY = 0;
  const restAngle = -.012;
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const start = new THREE.Vector3(), end = new THREE.Vector3();
  const path = new THREE.CubicBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());

  function scheduleIdle() {
    clearTimeout(idleTimer);
    if (!visible || document.hidden || reducedMotion.matches || dragging || expressionName !== 'normal' || entrance.phase !== 'settled') return;
    idleTimer = setTimeout(() => {
      idleTimer = 0;
      if (visible && !document.hidden && !dragging && expressionName === 'normal') {
        transitionEyes('normal');
        scheduleIdle();
      }
    },4000 + Math.random()*3500);
  }
  function transitionEyes(name) {
    if (reducedMotion.matches) {
      eyesMaterial.map = eyeTextures[name];
      eyesPivot.scale.y = eyeOpenness = 1;
      eyeTransition = null;
    } else if (eyeTransition?.phase === 'closing') {
      // A second tap changes the destination of the current blink, not its clock.
      eyeTransition.destination = name;
    } else {
      eyeTransition = {phase:'closing',start:performance.now(),from:eyeOpenness,destination:name};
    }
    wake();
  }
  function updateEyes(time) {
    if (!eyeTransition) return;
    if (reducedMotion.matches) {
      eyesMaterial.map = eyeTextures[eyeTransition.destination];
      eyesPivot.scale.y = eyeOpenness = 1;
      eyeTransition = null;
      return;
    }
    const elapsed = time-eyeTransition.start;
    if (eyeTransition.phase === 'closing') {
      const progress = clamp(elapsed/90,0,1);
      eyeOpenness = eyeTransition.from*Math.cos(progress*Math.PI/2);
      if (progress === 1) {
        eyesMaterial.map = eyeTextures[eyeTransition.destination];
        eyeTransition = {...eyeTransition,phase:'opening',start:time+20};
      }
    } else {
      const progress = clamp(elapsed/170,0,1);
      // Slow down into the final pose; the artwork never crossfades or doubles up.
      eyeOpenness = 1-Math.pow(1-progress,3);
      if (progress === 1) eyeTransition = null;
    }
    eyesPivot.scale.y = Math.max(.015,eyeOpenness);
    button.dataset.eyeTransition = eyeTransition?.phase || 'settled';
  }
  function setExpression(name,duration = 0) {
    clearTimeout(expressionTimer); expressionTimer = 0;
    clearTimeout(idleTimer); idleTimer = 0;
    if (name !== expressionName) {
      expressionName = name;
      transitionEyes(name);
      button.dataset.expression = name;
      wake();
    }
    if (duration) {
      expressionTimer = setTimeout(() => {
        expressionTimer = 0;
        setExpression('normal');
      },duration+(reducedMotion.matches ? 0 : 280));
    } else if (name === 'normal') scheduleIdle();
  }
  function reactToTap(direction,x = 0,y = 0) {
    interruptEntrance();
    const now = performance.now();
    const doubleTap = now - lastTapTime < 420 && Math.hypot(x-lastTapX,y-lastTapY) < 45;
    lastTapTime = doubleTap ? -Infinity : now;
    lastTapX = x; lastTapY = y;
    setExpression(doubleTap ? 'dizzy' : 'tap',doubleTap ? 2200 : 1200);
    reactBody(direction,doubleTap ? 1.35 : 1);
    swing(direction);
  }
  function reactBody(direction = 1,strength = 1) {
    if (reducedMotion.matches) return;
    squashVelocity = clamp(squashVelocity-1.25*strength,-1.75,1.75);
    leanVelocity = clamp(leanVelocity+direction*strength,-1.75,1.75);
    wake();
  }
  function finishEntrance() {
    entrance.phase = 'settled';
    entrance.y = entrance.velocity = 0;
    button.dataset.entrance = 'settled';
    scheduleIdle();
  }
  function interruptEntrance() {
    if (entrance.phase === 'settled' || entrance.phase === 'recovering') return;
    // Hold its current position while grabbed, then ease into the resting length.
    entrance.phase = 'recovering';
    entrance.velocity = 0;
    entrance.age = 0;
    entrance.greeted = true;
    button.dataset.entrance = 'recovering';
  }
  function updateEntrance(dt) {
    if (entrance.phase === 'settled' || entrance.phase === 'pending') return;
    if (reducedMotion.matches) { finishEntrance(); return; }
    if (entrance.phase === 'recovering' && dragging) return;
    entrance.age += dt;
    if (entrance.phase === 'falling') {
      entrance.velocity -= entrance.gravity*dt;
      entrance.y += entrance.velocity*dt;
      if (entrance.y <= 0) {
        entrance.y = 0;
        entrance.velocity = -entrance.bounceSpeed;
        entrance.phase = 'rebounding'; entrance.age = 0;
        velocity += .32; twistVelocity -= .18; tipVelocity += .06;
        reactBody(-1,.7);
        transitionEyes('normal');
      }
    } else {
      const recovering = entrance.phase === 'recovering';
      const oldVelocity = entrance.velocity;
      entrance.velocity += -entrance.y*(recovering ? 80 : 110)*dt;
      entrance.velocity *= Math.exp(-(recovering ? 18 : 5.4)*dt);
      if (recovering) entrance.velocity = clamp(entrance.velocity,-500/pixelScale,500/pixelScale);
      entrance.y += entrance.velocity*dt;
      if (!recovering && oldVelocity < 0 && entrance.velocity >= 0) entrance.bounces++;
      if (!recovering && !entrance.greeted && entrance.age > .55) {
        entrance.greeted = true;
        reactBody(1,.18);
        transitionEyes('normal');
      }
      if ((entrance.age > 1.55 && Math.abs(entrance.y)*pixelScale < .3 && Math.abs(entrance.velocity)*pixelScale < 3) || entrance.age > 2.4) finishEntrance();
    }
    button.dataset.entrance = entrance.phase;
    button.dataset.entranceOffset = (entrance.y*pixelScale).toFixed(1);
    button.dataset.entranceBounces = entrance.bounces;
  }

  function resize() {
    const bounds = stage.getBoundingClientRect();
    const screenBounds = firstScreen.getBoundingClientRect();
    const surfaceBounds = surface.getBoundingClientRect();
    stageWidth = bounds.width; stageHeight = bounds.height;
    const mobile = matchMedia('(max-width:720px)').matches;
    const previousScale = pixelScale;
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
    const exploreTop = firstScreen.querySelector('.explore-wrap').getBoundingClientRect().top;
    entrance.bounceSpeed = clamp((exploreTop-cardTop-h*pixelScale-16)*14,180,440)/pixelScale;
    if (entrance.phase === 'pending') {
      entrance.y = (cardTop-screenBounds.top+h*pixelScale+48)/pixelScale;
      entrance.gravity = 2*entrance.y/(.62*.62);
    } else if (entrance.phase !== 'settled') {
      const ratio = previousScale/pixelScale;
      entrance.y *= ratio; entrance.velocity *= ratio; entrance.gravity *= ratio;
    }
    wake();
  }

  function updateGeometry(time) {
    const length = strapLength;
    pivot.position.set(anchorX + Math.sin(angle) * length, anchorY - Math.cos(angle) * length + entrance.y, 0);
    pivot.rotation.set(tip, twist, angle);
    shine.material.opacity = .14 + Math.min(.35, Math.abs(twist) * .6);
    start.set(anchorX, anchorY, -.015);
    end.copy(pivot.position);
    end.z += .043;
    const span = start.y-end.y;
    const slack = Math.max(0,length-Math.max(0,span));
    ribbon.visible = span > .01;
    ribbon.material.opacity = clamp(span/Math.max(.25,length*.35),0,1);
    path.v0.copy(start);
    path.v1.set(start.x + Math.sin(angle) * .18 - slack*.3, start.y - Math.max(.08,span*.35), -.025);
    path.v2.set(end.x - Math.sin(angle) * .12 + slack*.25, end.y + Math.min(.32,Math.max(.02,span*.5)), end.z + .06);
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
    if (document.documentElement.classList.contains('page-enter-pending') && entrance.phase !== 'settled') return;
    const dt = Math.min((time - previous) / 1000 || .016, .032);
    previous = time;
    const advance = (value, speed, target, spring, damping) => {
      speed += (target - value) * spring * dt;
      speed *= Math.exp(-damping * dt);
      return [value + speed * dt, speed];
    };
    updateEntrance(dt);
    if (!reducedMotion.matches) {
      [angle, velocity] = advance(angle, velocity, targetAngle, dragging ? 100 : 24, dragging ? 12 : 2.5);
      [twist, twistVelocity] = advance(twist, twistVelocity, targetTwist, dragging ? 70 : 19, 3.2);
      [tip, tipVelocity] = advance(tip, tipVelocity, targetTip, 30, 4);
      [squash,squashVelocity] = advance(squash,squashVelocity,targetSquash,130,7);
      [lean,leanVelocity] = advance(lean,leanVelocity,targetLean,100,6);
      if (Math.abs(angle) > .34) { angle = clamp(angle, -.34, .34); velocity *= -.3; }
    } else {
      angle = targetAngle; twist = targetTwist; tip = targetTip;
      velocity = twistVelocity = tipVelocity = 0;
      squash = lean = squashVelocity = leanVelocity = 0;
    }
    const moving = entrance.phase !== 'settled' || dragging || Math.abs(velocity) + Math.abs(twistVelocity) + Math.abs(tipVelocity) > .0007
      || Math.abs(angle - targetAngle) + Math.abs(twist - targetTwist) + Math.abs(tip - targetTip) > .0005
      || Math.abs(squashVelocity)+Math.abs(leanVelocity) > .0005
      || Math.abs(squash-targetSquash)+Math.abs(lean-targetLean) > .0003;
    if (!moving) {
      squash = targetSquash; lean = targetLean;
      squashVelocity = leanVelocity = 0;
    }
    character.scale.set(1/Math.sqrt(1+squash),1+squash,1);
    character.rotation.z = lean;
    button.dataset.bodyPose = squash.toFixed(3)+','+lean.toFixed(3);
    updateEyes(time);
    updateGeometry(time);
    button.dataset.state = dragging ? 'dragging' : moving ? 'swinging' : 'idle';
    if (!frame && (moving || eyeTransition) && !reducedMotion.matches) frame = requestAnimationFrame(render);
  }

  function wake() {
    if (!frame && visible && !document.hidden) { previous = performance.now(); frame = requestAnimationFrame(render); }
  }
  document.addEventListener('yucean:page-revealed',wake);
  function swing(direction = 1) {
    targetAngle = restAngle; targetTwist = .035; targetTip = 0;
    if (!reducedMotion.matches) { velocity = clamp(velocity + direction * .72, -1.05, 1.05); twistVelocity = clamp(twistVelocity + direction * .45, -.8, .8); tipVelocity += .12; }
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
    interruptEntrance();
    dragging = true; travel = 0;
    dragOrigin = { x:event.clientX, y:event.clientY, angle, twist };
    clearTimeout(idleTimer); idleTimer = 0;
    button.setPointerCapture(event.pointerId);
    button.classList.add('is-dragging');
    wake();
  });
  button.addEventListener('pointermove', event => {
    if (dragging) {
      const dx = event.clientX - dragOrigin.x, dy = event.clientY - dragOrigin.y;
      travel = Math.max(travel, Math.hypot(dx, dy));
      if (travel >= 5) {
        lastTapTime = -Infinity;
        if (expressionName !== 'drag') reactBody(dx < 0 ? -1 : 1,.4);
        setExpression('drag');
        targetSquash = clamp(-dy*.0003,-.045,.045);
        targetLean = clamp(-dx*.0006,-.07,.07);
      }
      const worldPerPixel = 1 / pixelScale;
      targetAngle = clamp(dragOrigin.angle + dx * worldPerPixel / 3.2, -.3, .3);
      targetTwist = clamp(dragOrigin.twist + dx * .003, -.65, .65);
      targetTip = clamp(-dy * .002, -.22, .22);
      event.preventDefault();
      wake();
    } else if (entrance.phase === 'settled' && event.pointerType !== 'touch' && cardHit(event)) {
      const rect = button.getBoundingClientRect();
      targetTwist = .035 + ((event.clientX - rect.left) / rect.width - .5) * .15;
      targetTip = -((event.clientY - rect.top) / rect.height - .5) * .08;
      // Hover only tilts the badge. Crossing an invisible boundary must not swap faces.
      wake();
    }
  });
  const release = event => {
    if (!dragging) return;
    dragging = false; button.classList.remove('is-dragging');
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    targetAngle = restAngle; targetTwist = .035; targetTip = 0;
    targetSquash = targetLean = 0;
    if (travel < 5 && event.type !== 'pointercancel') {
      reactToTap(event.clientX < stage.getBoundingClientRect().left + stageWidth / 2 ? -1 : 1,event.clientX,event.clientY);
    } else {
      lastTapTime = -Infinity;
      setExpression(event.type === 'pointercancel' ? 'normal' : 'drag',event.type === 'pointercancel' ? 0 : 650);
      wake();
    }
    dragOrigin = null;
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('dblclick', event => {
    if (!cardHit(event) || travel >= 5) return;
    event.preventDefault();
    lastTapTime = -Infinity;
    if (expressionName !== 'dizzy') { swing(1); reactBody(1,1.35); }
    setExpression('dizzy',2200);
  });
  button.addEventListener('pointerleave', () => {
    if (!dragging) {
      targetTwist = .035; targetTip = 0;
      wake();
    }
  });
  button.addEventListener('keydown', event => {
    if (['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      interruptEntrance();
      if (event.key.startsWith('Arrow')) {
        setExpression('drag',650);
        lastTapTime = -Infinity;
        swing(event.key === 'ArrowLeft' ? -1 : 1);
        reactBody(event.key === 'ArrowLeft' ? -1 : 1);
      } else if (!event.repeat) reactToTap(1);
    }
  });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); cancelAnimationFrame(frame); frame = 0;
    stage.classList.remove('badge-ready');
    firstScreen.classList.remove('badge-scene-ready');
    stage.classList.add('badge-fallback-ready');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    stage.classList.remove('badge-fallback-ready');
    stage.classList.add('badge-ready'); firstScreen.classList.add('badge-scene-ready'); wake();
  });
  new ResizeObserver(resize).observe(stage);
  new ResizeObserver(resize).observe(firstScreen);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { wake(); scheduleIdle(); } else {
      cancelAnimationFrame(frame); frame = 0;
      clearTimeout(idleTimer); idleTimer = 0;
    }
  }, { rootMargin:'100px' }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; clearTimeout(idleTimer); idleTimer = 0; }
    else { wake(); scheduleIdle(); }
  });
  reducedMotion.addEventListener('change', () => { wake(); scheduleIdle(); });
  resize();
  if (reducedMotion.matches) finishEntrance();
  else {
    entrance.phase = 'falling';
    angle = -.065; twist = .075; tip = -.02;
    button.dataset.entrance = 'falling';
    button.dataset.entranceOffset = (entrance.y*pixelScale).toFixed(1);
  }
  updateGeometry(0);
  stage.classList.add('badge-ready');
  firstScreen.classList.add('badge-scene-ready');
  button.dataset.renderer = 'webgl';
  button.dataset.expression = 'normal';
  scheduleIdle();
  wake();
}

if (stage && button) {
  mountBadge().catch(error => {
    // Keep the accessible HTML card visible if WebGL or its texture is unavailable.
    button.dataset.renderer = 'fallback';
    stage.classList.add('badge-fallback-ready');
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
