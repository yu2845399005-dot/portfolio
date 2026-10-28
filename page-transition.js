/* Shared Figma loader, using native navigation so each case study keeps its own lifecycle. */
(() => {
  const ROOT = document.documentElement;
  const KEY = 'yucean:transition';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ASSETS = {
    start:'./assets/page-loader/face-start.svg', wait:'./assets/page-loader/face-wait.svg',
    focus:'./assets/page-loader/face-focus.svg', ready:'./assets/page-loader/face-ready.svg',
    dotsStart:'./assets/page-loader/dots-start.svg', dotsWait:'./assets/page-loader/dots-wait.svg',
    dotsFocus:'./assets/page-loader/dots-focus.svg', dotsReady:'./assets/page-loader/dots-ready.svg'
  };
  const PDF = './assets/resume/yuqiang-resume.pdf';
  const PAGES = new Set(['index.html','contact.html','onboarding.html','live-assistant.html','dialog-agent.html','arena.html','live-assistant-demo.html']);
  const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
  const storage = {
    set(ticket) { try { sessionStorage.setItem(KEY,JSON.stringify(ticket)); return true; } catch { return false; } },
    clear() { try { sessionStorage.removeItem(KEY); } catch { /* Storage is optional. */ } }
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'page-loader';
  dialog.setAttribute('aria-label','页面切换');
  dialog.innerHTML = `<div class="page-loader-scene"><div class="page-loader-bob"><div class="page-loader-faces">${['start','wait','focus','ready'].map((key,i)=>`<img data-face="${key}" class="${i ? '' : 'is-active'}" src="${ASSETS[key]}" width="104" height="80" alt="" />`).join('')}</div></div><div class="page-loader-dots" aria-hidden="true">${['dotsStart','dotsWait','dotsFocus','dotsReady'].map((key,i)=>`<img data-dots="${i}" class="${i ? '' : 'is-active'}" src="${ASSETS[key]}" width="94" height="6" alt="" />`).join('')}</div><p class="page-loader-value" role="progressbar" aria-label="页面切换进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">0%</p></div><p class="page-loader-message" role="status"></p><button class="page-loader-cancel" type="button" hidden>取消</button>`;
  document.body.append(dialog);
  const bob = dialog.querySelector('.page-loader-bob');
  const faces = dialog.querySelector('.page-loader-faces');
  const dots = dialog.querySelector('.page-loader-dots');
  const value = dialog.querySelector('.page-loader-value');
  const message = dialog.querySelector('.page-loader-message');
  const cancel = dialog.querySelector('.page-loader-cancel');
  const artworkReady = Promise.allSettled([...dialog.querySelectorAll('img')].map(img => img.decode()));
  let active = null, serial = 0, progress = 0, bobAnimation = null, slowTimer = 0;
  let preparation = null, resumeDialog = null;
  const heroSelector = '.contact-qr img, .hero-stage, .arena-hero-art img, .project-hero img[width], .hero-image img';

  const motion = async (element,frames,options) => {
    if (reduced.matches) return;
    const animation = element.animate(frames,{...options,fill:'both'});
    try { await animation.finished; } catch { /* A cancelled navigation releases its animations. */ }
    animation.cancel();
  };
  function setFace(name) {
    faces.querySelectorAll('[data-face]').forEach(img => img.classList.toggle('is-active',img.dataset.face === name));
    dialog.dataset.face = name;
  }
  function setProgress(next) {
    progress = Math.max(progress,Math.min(100,next));
    const integer = Math.floor(progress);
    value.textContent = `${integer}%`;
    value.setAttribute('aria-valuenow',integer);
    dialog.dataset.progress = integer;
    const face = progress >= 70 ? 'ready' : progress >= 45 ? 'focus' : progress >= 20 ? 'wait' : 'start';
    setFace(face);
    const dot = Math.min(3,Math.floor(progress/25));
    dots.querySelectorAll('img').forEach(img => img.classList.toggle('is-active',Number(img.dataset.dots) === dot));
  }
  function tweenProgress(to,duration,id) {
    if (reduced.matches) { setProgress(to); return Promise.resolve(); }
    const from = progress;
    const began = performance.now();
    return new Promise(resolve => {
      const tick = time => {
        if (id !== serial) { resolve(); return; }
        const t = Math.min(1,(time-began)/duration);
        setProgress(from+(to-from)*(1-Math.pow(1-t,2)));
        if (t < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
  }
  function begin(initial = 0,controller = new AbortController()) {
    const id = ++serial;
    progress = 0;
    active = {id,controller,trigger:document.activeElement};
    dialog.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    dialog.style.clipPath = ''; dialog.style.opacity = '';
    bob.style.visibility = ''; bob.style.transform = '';
    dots.style.opacity = ''; value.style.opacity = '';
    message.textContent = ''; cancel.hidden = true;
    setProgress(initial);
    if (!dialog.open) dialog.showModal();
    ROOT.classList.add('page-loader-active');
    dialog.setAttribute('aria-busy','true');
    dialog.dataset.phase = 'loading';
    if (!reduced.matches) bobAnimation = bob.animate([
      {transform:'translateY(0) scale(1,1)'},
      {transform:'translateY(-4px) scale(.985,1.015)'},
      {transform:'translateY(0) scale(1,1)'}
    ],{duration:1400,iterations:Infinity,easing:'ease-in-out'});
    clearTimeout(slowTimer);
    slowTimer = setTimeout(() => { if (active?.id === id) cancel.hidden = false; },6000);
    return id;
  }
  function reset() {
    serial++;
    active?.controller.abort(); active = null;
    clearTimeout(slowTimer);
    bobAnimation?.cancel(); bobAnimation = null;
    dialog.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    if (dialog.open) dialog.close();
    ROOT.classList.remove('page-loader-active','page-enter-pending');
    clearTimeout(window.__yuceanEntryFallback);
    storage.clear();
    document.dispatchEvent(new Event('yucean:page-revealed'));
  }
  async function reveal(id,action) {
    if (id !== serial) return;
    clearTimeout(slowTimer); cancel.hidden = true;
    dialog.dataset.phase = 'complete';
    await tweenProgress(100,reduced.matches ? 0 : 1000,id);
    if (id !== serial) return;
    bobAnimation?.pause();
    const transform = getComputedStyle(bob).transform;
    bob.style.transform = transform;
    bobAnimation?.cancel(); bobAnimation = null;
    await motion(bob,[{transform},{transform:'translateY(0) scale(1)'}],{duration:120,easing:'ease-out'});
    bob.style.transform = 'translateY(0) scale(1)';
    if (id !== serial) return;
    await delay(reduced.matches ? 0 : 160);
    await motion(bob,[{transform:'translateY(0) scale(1)'},{transform:'translateY(6px) scale(1.09,.91)'}],{duration:140,easing:'ease-in-out'});
    if (id !== serial) return;
    dialog.dataset.phase = 'departing';
    dots.style.opacity = '0'; value.style.opacity = '0';
    await motion(bob,[
      {transform:'translate(0,6px) scale(1.09,.91) rotate(0deg)',offset:0},
      {transform:'translate(22px,-30px) scale(.94,1.06) rotate(4deg)',offset:.18},
      {transform:`translate(${Math.min(innerWidth*.2,180)}px,${-innerHeight*.23}px) scale(1) rotate(15deg)`,offset:.55},
      {transform:`translate(${Math.min(innerWidth*.5,460)}px,${-innerHeight*.7}px) scale(.76) rotate(25deg)`,offset:1}
    ],{duration:520,easing:'cubic-bezier(.35,0,.75,1)'});
    if (id !== serial) return;
    bob.style.visibility = 'hidden';
    action?.();
    ROOT.classList.remove('page-enter-pending');
    dialog.dataset.phase = 'revealing';
    const main = document.querySelector('main,.contact-page');
    if (main && !reduced.matches) motion(main,[{opacity:.76,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
    await motion(dialog,[{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(0 0 100% 0)'}],{duration:340,easing:'cubic-bezier(.76,0,.24,1)'});
    if (id !== serial) return;
    const trigger = active?.trigger;
    reset();
    if (!action && window.__yuceanIncoming) {
      const heading = document.querySelector('main h1,main h2,.contact-page h1');
      if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
    } else if (trigger?.isConnected) trigger.focus({preventScroll:true});
    window.__yuceanIncoming = null;
    return true;
  }
  function failure(error,id) {
    if (id !== serial) return;
    if (error.name === 'AbortError') { reset(); return; }
    bobAnimation?.cancel();
    dialog.dataset.phase = 'error';
    message.textContent = '暂时无法打开，请取消后重试。';
    cancel.hidden = false;
    ROOT.classList.remove('page-enter-pending');
  }
  function imageReady(url) {
    const image = new Image(); image.src = url;
    return image.decode();
  }
  async function preparePage(url,signal) {
    const response = await fetch(url,{signal,credentials:'same-origin'});
    if (!response.ok) throw new Error(`Page ${response.status}`);
    const source = new DOMParser().parseFromString(await response.text(),'text/html');
    const resources = [...source.querySelectorAll('link[rel="stylesheet"],script[src]')].map(el => new URL(el.getAttribute('href') || el.getAttribute('src'),url));
    const images = [...source.querySelectorAll(heroSelector)].filter(img => img.getAttribute('src') && (Number(img.getAttribute('width')) >= 100 || img.matches('.contact-qr img,.hero-stage'))).slice(0,3);
    await Promise.allSettled([
      ...resources.filter(resource => resource.origin === location.origin).map(resource => fetch(resource,{signal,credentials:'same-origin'}).then(response => response.arrayBuffer())),
      ...images.map(img => imageReady(new URL(img.getAttribute('src'),url).href))
    ]);
    if (signal.aborted) throw new DOMException('Aborted','AbortError');
  }
  async function pageReady() {
    const images = [...document.querySelectorAll(heroSelector)].filter(img => img.getAttribute('src') && (Number(img.getAttribute('width')) >= 100 || img.matches('.contact-qr img,.hero-stage'))).slice(0,3);
    await Promise.allSettled([document.fonts.ready,...images.map(img => img.decode()),artworkReady]);
  }
  async function navigate(url) {
    if (active || preparation) return;
    const controller = new AbortController();
    preparation = controller;
    let id = null;
    const timeout = setTimeout(() => controller.abort(),14000);
    try {
      const ready = Promise.race([
        preparePage(url,controller.signal),
        new Promise((_,reject) => controller.signal.addEventListener('abort',() => reject(new DOMException('Aborted','AbortError')),{once:true}))
      ]);
      const fast = await Promise.race([ready.then(() => true),delay(320).then(() => false)]);
      if (fast) { location.assign(url.href); return; }
      id = begin(0,controller);
      preparation = null;
      await Promise.all([ready,tweenProgress(90,650,id),artworkReady]);
      if (id !== serial) return;
      const ticket = {to:url.href,at:Date.now(),progress:90};
      if (storage.set(ticket)) { dialog.dataset.phase = 'handoff'; location.assign(url.href); }
      else { await reveal(id); location.assign(url.href); }
    } catch(error) {
      if (id !== null) failure(error,id);
      else if (error.name !== 'AbortError') location.assign(url.href);
    } finally { clearTimeout(timeout); preparation = null; }
  }
  function showResume() {
    if (!resumeDialog) {
      resumeDialog = document.createElement('dialog');
      resumeDialog.className = 'resume-picker';
      resumeDialog.setAttribute('aria-labelledby','resume-picker-title');
      resumeDialog.innerHTML = `<div class="resume-picker-header"><h2 id="resume-picker-title">Resume</h2><button class="resume-picker-close" type="button" aria-label="Close resume selection">×</button></div><div class="resume-file"><span class="resume-file-icon" aria-hidden="true">PDF</span><div><p class="resume-file-name">YUQIANG 简历</p><p class="resume-file-meta">PDF · 2.4 MB</p></div></div><div class="resume-picker-actions"><a href="${PDF}" target="_blank" rel="noopener">Open PDF ↗</a><a href="${PDF}" download="YUQIANG 简历.pdf">Download PDF</a></div>`;
      document.body.append(resumeDialog);
      resumeDialog.querySelector('button').addEventListener('click',() => resumeDialog.close());
      resumeDialog.addEventListener('click',event => { if (event.target === resumeDialog) { const r=resumeDialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) resumeDialog.close(); } });
    }
    resumeDialog.showModal();
    if (!reduced.matches) motion(resumeDialog,[{opacity:0,transform:'translateY(10px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  document.addEventListener('click',event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const resume = event.target.closest('[data-resume-picker]');
    if (resume) {
      event.preventDefault(); event.stopImmediatePropagation();
      showResume();
      return;
    }
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || link.target && link.target !== '_self' || link.closest('.image-viewer,.resume-picker')) return;
    const url = new URL(link.href,location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (!PAGES.has(url.pathname.split('/').pop())) return;
    event.preventDefault(); event.stopImmediatePropagation(); navigate(url);
  },true);
  const abort = () => {
    // Once native navigation has started, let the incoming document finish the handoff.
    if (dialog.dataset.phase === 'handoff') return;
    const trigger=active?.trigger;
    reset();
    if(trigger?.isConnected) trigger.focus({preventScroll:true});
  };
  dialog.addEventListener('cancel',event => { event.preventDefault(); abort(); });
  cancel.addEventListener('click',abort);
  window.addEventListener('pageshow',event => { if (event.persisted) reset(); });
  window.YuceanTransition = {navigate:href => navigate(new URL(href,location.href)),get busy(){ return Boolean(active); }};
  if (window.__yuceanIncoming) {
    storage.clear();
    const id = begin(90);
    clearTimeout(window.__yuceanEntryFallback);
    const timeout = setTimeout(() => failure(new Error('Page readiness timeout'),id),14000);
    pageReady().then(() => { clearTimeout(timeout); return reveal(id); }).catch(error => { clearTimeout(timeout); failure(error,id); });
  }
})();
