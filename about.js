(() => {
  const section = document.querySelector('.about-section');
  if (!section) return;
  const track = section.querySelector('.life-track');
  const fan = track.querySelector('.life-fan');
  const cards = [...track.querySelectorAll('.life-card')];
  const initialSides = new Map(cards.map(card => [card,card.dataset.side]));
  const photoNames = new Map(cards.map(card => [card,card.getAttribute('aria-label').replace(/^播放/,'').replace(/实况照片$/,'')]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let phase = 'stacked', inView = false, timer = 0, pending = false;
  let animations = [];
  let switching = false, switchToken = 0, switchAnimations = [], queuedSide = null;
  const announcement = document.createElement('p');
  announcement.className = 'life-preview-status';
  announcement.setAttribute('aria-live','polite');
  announcement.setAttribute('aria-atomic','true');
  fan.append(announcement);
  fan.setAttribute('role','group');
  fan.setAttribute('aria-roledescription','照片轮播');
  document.documentElement.classList.add('about-motion');

  const load = video => {
    if (video.getAttribute('src')) return;
    video.src = video.dataset.src;
    video.load();
  };
  async function play(card, explicit = false) {
    if (document.hidden || (!explicit && (reduced.matches || connection?.saveData))) return;
    const video = card.querySelector('video');
    load(video);
    video.muted = true;
    try { await video.play(); } catch { /* The still remains visible when autoplay is unavailable. */ }
  }
  function syncPlayback() {
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (inView && phase === 'open' && !document.hidden && !reduced.matches && !connection?.saveData && card.dataset.pausedByUser !== 'true') {
        if (video.paused) play(card);
      }
      else video.pause();
    });
  }
  const transform = (x, y, angle, scale) => `translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${angle}deg) scale(${scale})`;
  function updateLabels() {
    cards.forEach(card => {
      const side = card.dataset.side, name = photoNames.get(card);
      card.setAttribute('aria-label', side === 'center' ? `播放或暂停${name}实况照片` : `预览${side === 'left' ? '上一张' : '下一张'}：${name}`);
      if (side === 'center') card.setAttribute('aria-current','true');
      else card.removeAttribute('aria-current');
    });
  }
  updateLabels();
  function stopSwitch() {
    switchToken++;
    switching = false;
    queuedSide = null;
    switchAnimations.forEach(animation => animation.cancel());
    switchAnimations = [];
    cards.forEach(card => { card.style.zIndex = ''; });
  }
  function spreadPixels() {
    const marker = document.createElement('span');
    marker.style.cssText = 'position:absolute;pointer-events:none;width:var(--fan-spread);height:0';
    fan.append(marker);
    const distance = marker.getBoundingClientRect().width;
    marker.remove();
    return distance;
  }
  function previewSide(side) {
    if (phase !== 'open' || !['left','right'].includes(side)) return;
    if (switching) { queuedSide = side; return; }
    const previous = new Map(cards.map(card => [card,card.dataset.side]));
    const selected = cards.find(card => card.dataset.side === side);
    const middle = cards.find(card => card.dataset.side === 'center');
    const wrapped = cards.find(card => card !== selected && card !== middle);
    const start = new Map(cards.map(card => [card,getComputedStyle(card).transform]));
    selected.dataset.side = 'center';
    middle.dataset.side = side === 'left' ? 'right' : 'left';
    wrapped.dataset.side = side;
    selected.dataset.pausedByUser = 'false';
    updateLabels();
    announcement.textContent = `当前预览：${photoNames.get(selected)}`;
    if (reduced.matches) { play(selected,true); return; }
    switching = true;
    const token = ++switchToken, distance = spreadPixels();
    selected.style.zIndex = '4';
    middle.style.zIndex = '3';
    wrapped.style.zIndex = '0';
    switchAnimations = cards.map(card => {
      const direction = card.dataset.side === 'left' ? -1 : card.dataset.side === 'right' ? 1 : 0;
      const end = transform(distance * direction,direction ? 30 : -10,direction * 12,direction ? .94 : 1);
      let frames;
      if (card === selected) {
        frames = [{transform:start.get(card)}, {transform:transform(0,-16,previous.get(card) === 'left' ? .8 : -.8,1.022),offset:.76}, {transform:end}];
      } else if (card === wrapped) {
        frames = [{transform:start.get(card)}, {transform:transform(0,52,0,.86),offset:.5}, {transform:end}];
      } else frames = [{transform:start.get(card)}, {transform:end}];
      return card.animate(frames,{duration:640,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    });
    Promise.allSettled(switchAnimations.map(animation => animation.finished)).then(() => {
      if (token !== switchToken) return;
      const next = queuedSide;
      stopSwitch();
      if (inView) syncPlayback();
      if (next) previewSide(next);
    });
  }
  function resetScene() {
    stopSwitch();
    cards.forEach(card => { card.dataset.side = initialSides.get(card); });
    updateLabels();
    announcement.textContent = '';
    phase = 'stacked';
    track.classList.remove('life-is-open');
    track.dataset.phase = phase;
    cards.forEach(card => {
      const video = card.querySelector('video');
      video.pause();
      card.classList.remove('is-playing');
      if (video.readyState >= 1) video.currentTime = 0;
      if (card.dataset.side !== 'center') { card.setAttribute('tabindex','-1'); card.setAttribute('aria-hidden','true'); }
    });
  }
  function finish() {
    phase = 'open';
    track.classList.add('life-is-open');
    track.dataset.phase = 'open';
    cards.forEach(card => { card.removeAttribute('tabindex'); card.removeAttribute('aria-hidden'); });
    animations.forEach(animation => animation.cancel());
    animations = [];
    syncPlayback();
  }
  function unfold() {
    if (phase !== 'waiting') return;
    if (reduced.matches) { finish(); return; }
    phase = 'opening';
    track.dataset.phase = phase;
    const distance = spreadPixels();
    animations = cards.map(card => {
      const side = card.dataset.side;
      const direction = side === 'left' ? -1 : side === 'right' ? 1 : 0;
      const initial = getComputedStyle(card).transform;
      const x = distance * direction, y = direction ? 30 : -10, angle = direction * 12, scale = direction ? .94 : 1;
      const frames = direction ? [
        {transform:initial,opacity:direction ? 0 : 1,offset:0},
        {transform:transform(0,-7,0,.985),opacity:0,offset:.13,easing:'cubic-bezier(.16,1,.3,1)'},
        {transform:transform(x * 1.025,y - 4,angle * 1.04,scale + .004),opacity:1,offset:.67,easing:'ease-in-out'},
        {transform:transform(x * .995,y + 1,angle * .99,scale),opacity:1,offset:.87,easing:'ease-out'},
        {transform:transform(x,y,angle,scale),opacity:1,offset:1}
      ] : [
        {transform:initial,opacity:1,offset:0},
        {transform:transform(0,-7,0,.985),opacity:1,offset:.16,easing:'cubic-bezier(.22,1,.36,1)'},
        {transform:transform(0,-12,0,1.006),opacity:1,offset:.65,easing:'ease-out'},
        {transform:transform(0,-10,0,1),opacity:1,offset:1}
      ];
      return card.animate(frames,{duration:direction ? 760 : 620,delay:direction > 0 ? 30 : 0,fill:'both',easing:'linear'});
    });
    track.classList.add('life-is-open');
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => { if (phase === 'opening') finish(); });
  }
  function update() {
    pending = false;
    const rect = track.getBoundingClientRect();
    inView = rect.top < innerHeight * .8 && rect.bottom > innerHeight * .2;
    if (phase === 'open' && !reduced.matches && rect.top > innerHeight) resetScene();
    if (phase === 'stacked' && rect.top <= 20 && rect.bottom > 0) {
      phase = 'waiting';
      track.dataset.phase = phase;
      timer = setTimeout(unfold,180);
    } else if (phase === 'waiting' && !inView) {
      clearTimeout(timer); phase = 'stacked'; track.dataset.phase = phase;
    }
    syncPlayback();
  }
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',() => {
    if (phase === 'opening') finish();
    if (switching) stopSwitch();
    schedule();
  },{passive:true});
  document.addEventListener('visibilitychange',syncPlayback);
  const nearby = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !reduced.matches && !connection?.saveData) {
      cards.forEach(card => load(card.querySelector('video')));
      nearby.disconnect();
    }
  },{rootMargin:'400px 0px'});
  nearby.observe(track);
  cards.forEach(card => {
    const video = card.querySelector('video');
    video.addEventListener('playing',() => card.classList.add('is-playing'));
    card.addEventListener('pointerenter',() => { if (phase === 'open' && card.dataset.pausedByUser !== 'true' && matchMedia('(hover:hover)').matches) play(card); });
    card.addEventListener('click',() => {
      if (phase !== 'open') {
        if (phase !== 'opening') { clearTimeout(timer); phase = 'waiting'; unfold(); }
        return;
      }
      if (card.dataset.side !== 'center') { previewSide(card.dataset.side); return; }
      if (video.paused) { card.dataset.pausedByUser = 'false'; play(card,true); }
      else { card.dataset.pausedByUser = 'true'; video.pause(); }
    });
  });
  fan.addEventListener('keydown',event => {
    if (phase !== 'open' || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    previewSide(event.key === 'ArrowLeft' ? 'left' : 'right');
  });
  function preference() {
    if (switching) stopSwitch();
    if (reduced.matches) { clearTimeout(timer); finish(); }
    schedule();
  }
  reduced.addEventListener('change',preference);
  track.dataset.phase = phase;
  if (reduced.matches) finish();
  schedule();
})();
