/* Static case-study images only: enlarge the original asset, never simulate the product. */
(() => {
  const images = [...document.querySelectorAll('.hero-stage, .product-gallery img, .adoption-gallery img, .case-study-shot, .product-capture')];
  const links = images.map((img) => {
    const link = document.createElement('a');
    link.className = 'image-zoom-link';
    link.href = img.dataset.fullSrc || img.getAttribute('src');
    link.setAttribute('aria-label', `放大查看：${img.alt}`);
    img.before(link);
    link.append(img);
    return link;
  });
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', '高清图片查看器');
  dialog.innerHTML = `<header class="image-viewer-toolbar"><div class="image-viewer-caption" aria-live="polite"></div><div class="image-viewer-controls"><button type="button" data-viewer="out" aria-label="缩小">−</button><button type="button" data-viewer="in" aria-label="放大">＋</button><button type="button" data-viewer="fit">适应屏幕</button><button type="button" data-viewer="actual">原始大小</button><a class="image-viewer-original" target="_blank" rel="noopener">打开原图 ↗</a><button type="button" data-viewer="close" aria-label="关闭图片" autofocus>关闭 ×</button></div></header><div class="image-viewer-stage"><img alt="" draggable="false" hidden /><p class="image-viewer-status" role="status">正在加载高清图…</p></div><footer class="image-viewer-footer"><button type="button" data-viewer="previous" aria-label="上一张">←</button><span class="image-viewer-count"></span><span>滚轮缩放 · 拖动查看 · Esc 关闭</span><button type="button" data-viewer="next" aria-label="下一张">→</button></footer>`;
  document.body.append(dialog);
  const stage = dialog.querySelector('.image-viewer-stage');
  const full = stage.querySelector('img');
  const status = dialog.querySelector('.image-viewer-status');
  let index = 0, scale = 1, fitScale = 1, panX = 0, panY = 0, requestId = 0, trigger = null;
  const pointers = new Map();
  let gesture = null;
  const fit = () => Math.min(1, (stage.clientWidth - 32) / full.naturalWidth, (stage.clientHeight - 32) / full.naturalHeight);
  const render = () => {
    if (!full.naturalWidth) return;
    const maxX = Math.max(0, (full.naturalWidth * scale - stage.clientWidth) / 2 + 24);
    const maxY = Math.max(0, (full.naturalHeight * scale - stage.clientHeight) / 2 + 24);
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
    full.style.width = `${full.naturalWidth}px`;
    full.style.height = `${full.naturalHeight}px`;
    full.style.transform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${scale})`;
    dialog.querySelector('.image-viewer-count').textContent = `${index + 1} / ${links.length} · ${Math.round(scale * 100)}%`;
  };
  const reset = () => { fitScale = fit(); scale = fitScale; panX = panY = 0; render(); };
  const zoom = (factor) => { scale = Math.max(fitScale, Math.min(4, scale * factor)); render(); };
  const show = async (nextIndex) => {
    index = (nextIndex + links.length) % links.length;
    const id = ++requestId;
    pointers.clear(); gesture = null; full.hidden = true;
    status.hidden = false;
    status.textContent = '正在加载高清图…';
    const link = links[index];
    dialog.querySelector('.image-viewer-caption').textContent = link.querySelector('img').alt;
    dialog.querySelector('.image-viewer-original').href = link.href;
    full.alt = link.querySelector('img').alt;
    full.src = link.href;
    try {
      await full.decode();
      if (id !== requestId || !dialog.open) return;
      status.hidden = true; full.hidden = false; reset();
    } catch (_) {
      if (id === requestId) status.textContent = '图片暂时加载失败，可以点击“打开原图”重试。';
    }
  };
  links.forEach((link, i) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); trigger = link;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('image-viewer-open');
    show(i);
  }));
  dialog.addEventListener('click', (event) => {
    const action = event.target.closest('[data-viewer]')?.dataset.viewer;
    if (action === 'close') dialog.close();
    if (action === 'in') zoom(1.25);
    if (action === 'out') zoom(.8);
    if (action === 'fit') reset();
    if (action === 'actual') { scale = Math.max(1, fitScale); panX = panY = 0; render(); }
    if (action === 'previous') show(index - 1);
    if (action === 'next') show(index + 1);
  });
  dialog.addEventListener('close', () => {
    requestId++; pointers.clear(); gesture = null;
    document.documentElement.classList.remove('image-viewer-open');
    trigger?.focus({preventScroll:true});
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.25); }
    if (event.key === '-') { event.preventDefault(); zoom(.8); }
  });
  stage.addEventListener('wheel', (event) => { event.preventDefault(); zoom(Math.exp(-event.deltaY * .0015)); }, {passive:false});
  stage.addEventListener('dblclick', () => { if (scale > fitScale * 1.1) reset(); else { scale = Math.max(1, fitScale * 2); render(); } });
  const measureGesture = () => {
    const points = [...pointers.values()];
    gesture = { x:points[0]?.x || 0, y:points[0]?.y || 0, panX, panY, scale,
      distance: points.length > 1 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0 };
  };
  stage.addEventListener('pointerdown', (event) => {
    if (full.hidden) return;
    stage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, {x:event.clientX,y:event.clientY}); measureGesture();
  });
  stage.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, {x:event.clientX,y:event.clientY});
    const points = [...pointers.values()];
    if (points.length > 1 && gesture.distance > 0) {
      const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      scale = Math.max(fitScale, Math.min(4, gesture.scale * distance / gesture.distance));
    } else { panX = gesture.panX + event.clientX - gesture.x; panY = gesture.panY + event.clientY - gesture.y; }
    render();
  });
  const release = (event) => { pointers.delete(event.pointerId); measureGesture(); };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  window.addEventListener('resize', () => { if (dialog.open && !full.hidden) reset(); });
})();
