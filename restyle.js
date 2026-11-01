/* Scale embedded product UI in its own figure, leaving the case-study copy native. */
(() => {
  const fits = [...document.querySelectorAll('.design-fit')];
  const fit = (box) => {
    const canvas = box.querySelector(':scope > .design-canvas');
    if (!canvas) return;
    const width = Number(canvas.dataset.designWidth);
    canvas.style.zoom = Math.min(1, box.clientWidth / width);
  };
  const resize = new ResizeObserver(entries => entries.forEach(({target}) => fit(target)));
  fits.forEach(box => { resize.observe(box); fit(box); });
  const flow = document.querySelector('.flow-canvas');
  if (flow) {
    const updateFlow = () => { flow.style.zoom = Math.min(1, Math.max(780, flow.parentElement.clientWidth) / 1162); };
    new ResizeObserver(updateFlow).observe(flow.parentElement);
    updateFlow();
  }
  const buttons = [...document.querySelectorAll('.rail-bars button')];
  const links = [...document.querySelectorAll('.mobile-section-nav a')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  buttons.forEach(button => button.addEventListener('click', () => {
    document.getElementById(button.dataset.target)?.scrollIntoView({behavior:reduced.matches ? 'auto' : 'smooth',block:'start'});
  }));
  let pending = false;
  function progress() {
    const marker = innerHeight * .42;
    let active = 0;
    buttons.forEach((button,i) => { if (document.getElementById(button.dataset.target)?.getBoundingClientRect().top <= marker) active=i; });
    buttons.forEach((button,i) => {
      button.classList.toggle('active',i===active);
      if(i===active) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
    });
    let section = 0;
    links.forEach((link,i) => { if(document.querySelector(link.hash)?.getBoundingClientRect().top <= marker) section=i; });
    links.forEach((link,i) => {
      link.classList.toggle('active',i===section);
      if(i===section) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
    pending=false;
  }
  addEventListener('scroll',() => { if(!pending){pending=true;requestAnimationFrame(progress);} },{passive:true});
  addEventListener('resize',progress);
  progress();
})();
