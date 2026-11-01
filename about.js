(() => {
  const section = document.querySelector('.about-section');
  if (!section) return;
  const track = section.querySelector('.life-track');
  const fan = track.querySelector('.life-fan');
  const content = track.querySelector('.life-content');
  const copy = track.querySelector('.life-copy');
  const copyText = copy.querySelector('.about-copy-text');
  const heading = copy.querySelector('h3');
  const cards = [...track.querySelectorAll('.life-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let phase = 'stacked', inView = false, timer = 0, textTimer = 0, pending = false;
  let animations = [];
  document.documentElement.classList.add('about-motion');
  function geometry() {
    const mobile = innerWidth <= 720;
    const gap = parseFloat(getComputedStyle(content).columnGap) || 0;
    const cardWidth = cards.find(card => card.dataset.side === 'center').offsetWidth;
    const introGap = innerWidth > 1200 ? 140 : 80;
    const origin = mobile ? 0 : (cardWidth - fan.clientWidth) / 2;
    track.style.setProperty('--intro-photo-x', `${origin}px`);
    track.style.setProperty('--intro-copy-x', `${mobile ? 0 : -(fan.clientWidth - cardWidth + gap - introGap)}px`);
    track.style.setProperty('--intro-copy-width', `${mobile ? copy.clientWidth : Math.min(640, content.clientWidth - cardWidth - introGap)}px`);
  }
  geometry();

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
  function resetScene() {
    phase = 'stacked';
    track.classList.remove('life-is-open');
    track.dataset.phase = phase;
    copy.classList.remove('copy-life');
    heading.textContent = heading.dataset.intro;
    cards.forEach(card => {
      const video = card.querySelector('video');
      video.pause();
      card.classList.remove('is-playing');
      if (video.readyState >= 1) video.currentTime = 0;
      if (card.dataset.side !== 'center') { card.setAttribute('tabindex','-1'); card.setAttribute('aria-hidden','true'); }
    });
  }
  function finish() {
    clearTimeout(textTimer);
    phase = 'open';
    track.classList.add('life-is-open');
    track.dataset.phase = 'open';
    copy.classList.add('copy-life');
    heading.textContent = heading.dataset.life;
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
    const spread = parseFloat(getComputedStyle(fan).getPropertyValue('--fan-spread'));
    // Resolve the responsive CSS length to pixels through an existing side card.
    const marker = document.createElement('span');
    marker.style.cssText = 'position:absolute;pointer-events:none;width:var(--fan-spread);height:0';
    fan.append(marker);
    const distance = marker.getBoundingClientRect().width || spread || 130;
    marker.remove();
    const origin = parseFloat(getComputedStyle(track).getPropertyValue('--intro-photo-x')) || 0;
    const copyStart = getComputedStyle(copy).transform;
    animations = cards.map(card => {
      const side = card.dataset.side;
      const direction = side === 'left' ? -1 : side === 'right' ? 1 : 0;
      const initial = getComputedStyle(card).transform;
      const x = distance * direction, y = direction ? 30 : -10, angle = direction * 12, scale = direction ? .94 : 1;
      return card.animate([
        {transform:initial,opacity:direction ? 0 : 1,offset:0},
        {transform:transform(origin + direction * 4,25,direction * 2,.925),opacity:direction ? 0 : 1,offset:.13,easing:'cubic-bezier(.16,1,.3,1)'},
        {transform:transform(x + (x - origin) * .055,y - 9,angle * 1.08,scale + .012),opacity:1,offset:.64,easing:'ease-in-out'},
        {transform:transform(x - (x - origin) * .01,y + 2,angle * .98,scale),opacity:1,offset:.84,easing:'ease-out'},
        {transform:transform(x,y,angle,scale),opacity:1,offset:1}
      ],{duration:880,fill:'both',easing:'linear'});
    });
    animations.push(copy.animate([
      {transform:copyStart},
      {transform:'translateX(5px)',offset:.78},
      {transform:'translateX(0)'}
    ],{duration:880,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}));
    animations.push(copyText.animate([
      {opacity:1,transform:'translateY(0)',offset:0},
      {opacity:0,transform:'translateY(-9px)',offset:.18},
      {opacity:0,transform:'translateY(9px)',offset:.21},
      {opacity:1,transform:'translateY(0)',offset:.64},
      {opacity:1,transform:'translateY(0)',offset:1}
    ],{duration:880,fill:'both'}));
    textTimer = setTimeout(() => {
      if (phase !== 'opening') return;
      heading.textContent = heading.dataset.life;
      copy.classList.add('copy-life');
    },170);
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
    geometry();
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
      if (video.paused) { card.dataset.pausedByUser = 'false'; play(card,true); }
      else { card.dataset.pausedByUser = 'true'; video.pause(); }
    });
  });
  function preference() {
    if (reduced.matches) { clearTimeout(timer); finish(); }
    schedule();
  }
  reduced.addEventListener('change',preference);
  track.dataset.phase = phase;
  if (reduced.matches) finish();
  schedule();
})();
