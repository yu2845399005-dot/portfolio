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
  let active = null, serial = 0, progress = 0, bobAnimation = null, slowTimer = 0;
  let handoff = null, handoffTimer = 0, resumeDialog = null;

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
  function begin(initial = 0) {
    const id = ++serial;
    progress = 0;
    active = {id,trigger:document.activeElement};
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
    active = null;
    clearTimeout(handoffTimer); handoff = null;
    clearTimeout(slowTimer);
    bobAnimation?.cancel(); bobAnimation = null;
    dialog.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    if (dialog.open) dialog.close();
    dialog.dataset.phase = 'idle';
    ROOT.classList.remove('page-loader-active','page-enter-pending');
    clearTimeout(window.__yuceanEntryFallback);
    storage.clear();
    document.dispatchEvent(new Event('yucean:page-revealed'));
  }
  async function reveal(id) {
    if (id !== serial) return;
    clearTimeout(slowTimer); cancel.hidden = true;
    dialog.dataset.phase = 'complete';
    await tweenProgress(100,120,id);
    if (id !== serial) return;
    bobAnimation?.pause();
    const transform = getComputedStyle(bob).transform;
    bob.style.transform = transform;
    bobAnimation?.cancel(); bobAnimation = null;
    await motion(bob,[{transform},{transform:'translateY(5px) scale(1.06,.94)'}],{duration:80,easing:'ease-in-out'});
    if (id !== serial) return;
    dialog.dataset.phase = 'departing';
    dots.style.opacity = '0'; value.style.opacity = '0';
    ROOT.classList.remove('page-enter-pending');
    const main = document.querySelector('main,.contact-page');
    if (main && !reduced.matches) motion(main,[{opacity:.85,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'});
    // The page reveals while the mascot leaves; neither waits for offscreen media.
    await Promise.all([
      motion(bob,[
        {transform:'translate(0,5px) scale(1.06,.94) rotate(0deg)',offset:0},
        {transform:'translate(18px,-26px) scale(.96,1.04) rotate(4deg)',offset:.22},
        {transform:`translate(${Math.min(innerWidth*.4,360)}px,${-innerHeight*.65}px) scale(.8) rotate(22deg)`,offset:1}
      ],{duration:260,easing:'cubic-bezier(.35,0,.75,1)'}),
      motion(dialog,[{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(0 0 100% 0)'}],{duration:260,easing:'cubic-bezier(.76,0,.24,1)'})
    ]);
    if (id !== serial) return;
    const trigger = active?.trigger;
    reset();
    if (window.__yuceanIncoming) {
      const heading = document.querySelector('main h1,main h2,.contact-page h1');
      if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
    } else if (trigger?.isConnected) trigger.focus({preventScroll:true});
    window.__yuceanIncoming = null;
    return true;
  }
  function navigate(url) {
    if (active || handoff) return;
    const ticket = {to:url.href,at:Date.now(),progress:0,shown:false};
    if (storage.set(ticket)) {
      handoff = ticket;
      handoffTimer = setTimeout(() => {
        if (handoff !== ticket) return;
        const id = begin();
        dialog.dataset.phase = 'handoff';
        ticket.shown = true;
        storage.set(ticket);
        tweenProgress(85,2500,id);
      },320);
    }
    // Start the browser's request immediately, without fetching the page twice.
    try { location.assign(url.href); } catch { reset(); }
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
    if (dialog.dataset.phase === 'handoff') window.stop();
    const trigger=active?.trigger;
    reset();
    if(trigger?.isConnected) trigger.focus({preventScroll:true});
  };
  dialog.addEventListener('cancel',event => { event.preventDefault(); abort(); });
  cancel.addEventListener('click',abort);
  window.addEventListener('pagehide',() => {
    clearTimeout(handoffTimer);
    if (handoff) storage.set({...handoff,progress:active ? Math.floor(progress) : 0});
  });
  window.addEventListener('pageshow',event => { if (event.persisted) reset(); });
  window.YuceanTransition = {navigate:href => navigate(new URL(href,location.href)),get busy(){ return Boolean(active); }};
  if (window.__yuceanIncoming) {
    const ticket = window.__yuceanIncoming;
    storage.clear();
    clearTimeout(window.__yuceanEntryFallback);
    if (ticket.slow) {
      const id = begin(Math.min(90,Math.max(5,Number(ticket.progress) || 5)));
      reveal(id);
    } else {
      ROOT.classList.remove('page-enter-pending');
      window.__yuceanIncoming = null;
      document.dispatchEvent(new Event('yucean:page-revealed'));
    }
  }
})();
