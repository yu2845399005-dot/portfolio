(() => {
  const steps = [...document.querySelectorAll('.rail-bars button')];
  const mobileLinks = [...document.querySelectorAll('.mobile-section-nav a')];
  const languageButton = document.querySelector('.language-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;

  const updateProgress = () => {
    const marker = innerHeight * .38;
    const activate = (items, getTarget, current) => {
      let selected = 0;
      items.forEach((item, index) => {
        const target = getTarget(item);
        if (target && target.getBoundingClientRect().top <= marker) selected = index;
      });
      items.forEach((item, index) => {
        item.classList.toggle('active', index === selected);
        if (index === selected) item.setAttribute('aria-current', current);
        else item.removeAttribute('aria-current');
      });
    };
    activate(steps, step => document.getElementById(step.dataset.target), 'step');
    activate(mobileLinks, link => document.getElementById(link.hash.slice(1)), 'location');
    scheduled = false;
  };
  const scheduleProgress = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  };
  steps.forEach(step => step.addEventListener('click', () => {
    document.getElementById(step.dataset.target)?.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start'
    });
  }));

  const setLanguage = language => {
    const next = language === 'en' ? 'en' : 'zh';
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh][data-en]').forEach(element => {
      element.textContent = element.dataset[next];
    });
    const parts = languageButton.querySelectorAll('span');
    parts[0].classList.toggle('language-active', next === 'zh');
    parts[2].classList.toggle('language-active', next === 'en');
    languageButton.setAttribute('aria-label', next === 'zh' ? 'Switch to English' : '切换到中文');
    document.title = next === 'zh' ? 'TikTok Arena 资源面板 — Yucean Design' : 'TikTok Arena Resource Hub — Yucean Design';
    try { localStorage.setItem('portfolio-language', next); } catch (_) { /* Storage may be restricted. */ }
    scheduleProgress();
  };
  languageButton.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en'));
  let language = 'zh';
  try { language = localStorage.getItem('portfolio-language') || 'zh'; } catch (_) { /* Use the default language. */ }
  setLanguage(language);
  addEventListener('scroll', scheduleProgress, { passive: true });
  addEventListener('resize', scheduleProgress);
  addEventListener('load', scheduleProgress);
  document.fonts?.ready.then(scheduleProgress);
})();
