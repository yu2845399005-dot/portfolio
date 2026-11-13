(() => {
  const links = Array.from(document.querySelectorAll(".progress-rail a"));
  const targets = links.map(link => document.getElementById(link.hash.slice(1)));
  const toggle = document.querySelector(".language-toggle");
  const back = document.querySelector(".project-back");
  const languageParts = toggle.querySelectorAll("span");
  const backgroundTranslation = document.querySelector(".background-translation");
  const translated = document.querySelectorAll("[data-zh][data-en]");
  let frame = 0;
  let active = -1;

  function updateProgress() {
    frame = 0;
    const marker = window.innerHeight * 0.42;
    let next = 0;
    targets.forEach((target, index) => {
      if (target && target.getBoundingClientRect().top <= marker) next = index;
    });
    if (document.scrollingElement.scrollHeight - window.scrollY - window.innerHeight <= 2) {
      next = links.length - 1;
    }
    if (next === active) return;
    links[active]?.removeAttribute("aria-current");
    links[next]?.setAttribute("aria-current", "location");
    active = next;
  }

  function queueProgress() {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  }

  function setLanguage(language) {
    const english = language === "en";
    document.documentElement.lang = english ? "en" : "zh-CN";
    translated.forEach(element => {
      element.textContent = element.dataset[language];
    });
    backgroundTranslation.lang = english ? "zh-CN" : "en";
    links.forEach(link => {
      const label = english ? link.dataset.labelEn : link.dataset.labelZh;
      link.title = label;
      link.setAttribute("aria-label", label);
    });
    back.setAttribute("aria-label", english ? "Back to work" : "返回作品列表");
    toggle.setAttribute("aria-label", english ? "切换到中文" : "Switch to English");
    languageParts[0].classList.toggle("language-active", !english);
    languageParts[2].classList.toggle("language-active", english);
    queueProgress();
  }

  let language = "zh";
  try {
    if (localStorage.getItem("portfolio-language") === "en") language = "en";
  } catch {
    // The language switch also works when storage is unavailable.
  }
  setLanguage(language);
  toggle.addEventListener("click", () => {
    language = language === "zh" ? "en" : "zh";
    setLanguage(language);
    try {
      localStorage.setItem("portfolio-language", language);
    } catch {
      // Keep the selected language for the current page.
    }
  });

  window.addEventListener("scroll", queueProgress, { passive: true });
  window.addEventListener("resize", queueProgress);

  const carousel = document.querySelector(".prompt-carousel");
  if (carousel && "IntersectionObserver" in window) {
    const track = carousel.querySelector(".prompt-track");
    const repeat = track.firstElementChild.cloneNode(true);
    repeat.setAttribute("aria-hidden", "true");
    track.append(repeat);
    carousel.classList.add("is-animated");
    new IntersectionObserver(([entry]) => {
      carousel.classList.toggle("is-visible", entry.isIntersecting);
    }, { threshold: 0.25 }).observe(carousel);
  }

  const motionVideo = document.querySelector(".motion-home-video");
  if (motionVideo) {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;
    function updateMotionPreview() {
      if (onScreen && !reducedMotion.matches) motionVideo.play().catch(() => {});
      else motionVideo.pause();
    }
    reducedMotion.addEventListener("change", updateMotionPreview);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        updateMotionPreview();
      }).observe(motionVideo);
    } else {
      onScreen = true;
      updateMotionPreview();
    }
  }
})();
