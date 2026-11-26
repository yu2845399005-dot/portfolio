/* Open the original case-study images and videos in the same viewer. */
(() => {
  const media = document.querySelectorAll([
    'img.hero-stage', '.product-gallery img', '.adoption-gallery img', '.case-study-shot', '.product-capture',
    '.live-case .case-block figure > img[alt]:not([alt=""])', 'video:not([aria-hidden="true"])'
  ].join(','));
  const titleFor = item => item instanceof HTMLImageElement ? item.alt :
    document.getElementById(item.getAttribute('aria-labelledby'))?.textContent.trim() ||
    item.getAttribute('aria-label') || item.closest('figure')?.querySelector('figcaption')?.textContent.trim() || '演示视频';
  const entries = [];
  media.forEach(item => {
    if (item.closest('a, button')) return;
    const isVideo = item instanceof HTMLVideoElement;
    const source = isVideo ?
      item.currentSrc || item.getAttribute('src') || item.dataset.src || item.querySelector('source[src]')?.src :
      item.dataset.fullSrc || item.getAttribute('src');
    if (!source) return;
    const link = document.createElement('a');
    link.className = 'image-zoom-link';
    link.href = source;
    if (isVideo) {
      let frame = item.closest('.motion-device, .screen-shell, .workflow-screen');
      if (!frame) {
        frame = document.createElement('div');
        frame.className = 'media-preview-frame';
        item.before(frame);
        frame.append(item);
      }
      link.classList.add('video-preview-link');
      frame.append(link);
    } else {
      item.before(link);
      link.append(item);
    }
    link.setAttribute('aria-label', (isVideo ? '放大播放：' : '放大查看：') + titleFor(item));
    entries.push({item, link, isVideo});
  });
  if (!entries.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', '作品资源预览');
  dialog.innerHTML = `<header class="image-viewer-toolbar"><div class="image-viewer-caption" aria-live="polite"></div><div class="image-viewer-controls"><button type="button" class="image-viewer-zoom" data-viewer="out" aria-label="缩小">−</button><button type="button" class="image-viewer-zoom" data-viewer="in" aria-label="放大">＋</button><button type="button" class="image-viewer-zoom" data-viewer="fit">适应屏幕</button><button type="button" class="image-viewer-zoom" data-viewer="actual">原始大小</button><a class="image-viewer-original" target="_blank" rel="noopener">打开原图 ↗</a><button type="button" data-viewer="close" aria-label="关闭预览" autofocus>关闭 ×</button></div></header><div class="image-viewer-stage"><img alt="" draggable="false" hidden /><video controls playsinline preload="metadata" hidden></video><p class="image-viewer-status" role="status">正在加载高清图…</p></div><footer class="image-viewer-footer"><button type="button" data-viewer="previous" aria-label="上一个资源">←</button><span class="image-viewer-count"></span><span class="image-viewer-hint"></span><button type="button" data-viewer="next" aria-label="下一个资源">→</button></footer>`;
  document.body.append(dialog);
  const stage = dialog.querySelector('.image-viewer-stage');
  const full = stage.querySelector('img');
  const player = stage.querySelector('video');
  const caption = dialog.querySelector('.image-viewer-caption');
  const original = dialog.querySelector('.image-viewer-original');
  const count = dialog.querySelector('.image-viewer-count');
  const hint = dialog.querySelector('.image-viewer-hint');
  const status = dialog.querySelector('.image-viewer-status');
  let index = 0, scale = 1, fitScale = 1, panX = 0, panY = 0, requestId = 0, trigger = null;
  const pointers = new Map();
  let gesture = null;
  let gestureMoved = false;
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
    count.textContent = `${index + 1} / ${entries.length} · ${Math.round(scale * 100)}%`;
  };
  const reset = () => { fitScale = fit(); scale = fitScale; panX = panY = 0; render(); };
  const zoom = (factor) => { scale = Math.max(fitScale, Math.min(4, scale * factor)); render(); };
  const releaseVideo = () => {
    if (!player.hasAttribute('src')) return;
    player.onerror = null;
    player.onloadedmetadata = null;
    player.pause();
    player.removeAttribute('src');
    player.removeAttribute('poster');
    player.load();
  };
  const show = async (nextIndex) => {
    index = (nextIndex + entries.length) % entries.length;
    const id = ++requestId;
    pointers.clear(); gesture = null; full.hidden = true;
    gestureMoved = false;
    releaseVideo();
    const {item, link, isVideo} = entries[index];
    const title = titleFor(item);
    caption.textContent = title;
    original.href = link.href;
    original.textContent = isVideo ? '打开原视频 ↗' : '打开原图 ↗';
    count.textContent = (index + 1) + ' / ' + entries.length;
    hint.textContent = isVideo ? '点击空白关闭' : '点击图片或空白关闭 · 滚轮缩放 · 拖动查看';
    dialog.classList.toggle('is-video', isVideo);
    player.hidden = !isVideo;

    if (isVideo) {
      full.removeAttribute('src');
      status.hidden = true;
      player.setAttribute('aria-label', title);
      if (item.poster) player.poster = item.poster;
      player.muted = item.muted;
      player.loop = item.loop;
      player.onerror = () => {
        if (id !== requestId || !dialog.open) return;
        status.textContent = '视频暂时加载失败，可以点击“打开原视频”重试。';
        status.hidden = false;
      };
      const playbackTime = item.currentTime;
      player.onloadedmetadata = () => {
        if (id === requestId && playbackTime > 0 && playbackTime < player.duration) player.currentTime = playbackTime;
      };
      player.src = link.href;
      player.play().catch(() => {});
      return;
    }

    status.hidden = false;
    status.textContent = '正在加载高清图…';
    full.alt = title;
    full.src = link.href;
    try {
      await full.decode();
      if (id !== requestId || !dialog.open) return;
      status.hidden = true; full.hidden = false; reset();
    } catch (_) {
      if (id === requestId) status.textContent = '图片暂时加载失败，可以点击“打开原图”重试。';
    }
  };
  entries.forEach(({link}, i) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); trigger = link;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('image-viewer-open');
    document.dispatchEvent(new Event('media-preview-change'));
    show(i);
  }));
  dialog.addEventListener('click', (event) => {
    const action = event.target.closest('[data-viewer]')?.dataset.viewer;
    // A normal click anywhere outside the controls dismisses the enlarged image.
    // Ignore the synthetic click emitted after dragging or a pinch gesture.
    if (!action && !event.target.closest('button, a, video')) {
      if (!gestureMoved) dialog.close();
      gestureMoved = false;
      return;
    }
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
    releaseVideo();
    document.documentElement.classList.remove('image-viewer-open');
    document.dispatchEvent(new Event('media-preview-change'));
    trigger?.focus({preventScroll:true});
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.target === player) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (!player.hidden) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.25); }
    if (event.key === '-') { event.preventDefault(); zoom(.8); }
  });
  stage.addEventListener('wheel', (event) => {
    if (full.hidden) return;
    event.preventDefault(); zoom(Math.exp(-event.deltaY * .0015));
  }, {passive:false});
  const measureGesture = () => {
    const points = [...pointers.values()];
    gesture = { x:points[0]?.x || 0, y:points[0]?.y || 0, panX, panY, scale,
      distance: points.length > 1 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0 };
  };
  stage.addEventListener('pointerdown', (event) => {
    if (full.hidden) return;
    if (!pointers.size) gestureMoved = false;
    stage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, {x:event.clientX,y:event.clientY}); measureGesture();
    if (pointers.size > 1) gestureMoved = true;
  });
  stage.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, {x:event.clientX,y:event.clientY});
    const points = [...pointers.values()];
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 6) gestureMoved = true;
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
