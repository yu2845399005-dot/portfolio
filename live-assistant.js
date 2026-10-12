(() => {
  const railSteps = [...document.querySelectorAll(".rail-bars button")];
  const languageToggle = document.querySelector(".language-toggle");
  const motionVideos = [...document.querySelectorAll("[data-motion-video]")];
  const languageParts = languageToggle ? [...languageToggle.querySelectorAll("span")] : [];
  const targets = railSteps
    .map((step) => document.getElementById(step.dataset.target))
    .filter(Boolean);
  let activeIndex = 0;
  let ticking = false;

  const setActive = (index) => {
    activeIndex = Math.max(0, Math.min(railSteps.length - 1, index));
    railSteps.forEach((step, stepIndex) => {
      const active = stepIndex === activeIndex;
      step.classList.toggle("active", active);
      if (active) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
  };

  const updateProgress = () => {
    const marker = window.scrollY + window.innerHeight * 0.42;
    let next = 0;
    targets.forEach((target, index) => {
      if (target.offsetTop <= marker) next = index;
    });
    setActive(next);
    ticking = false;
  };

  const requestProgressUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  };

  railSteps.forEach((step) => {
    step.addEventListener("click", () => {
      const target = document.getElementById(step.dataset.target);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const setLanguage = (language) => {
    const next = language === "en" ? "en" : "zh";
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-zh][data-en]").forEach((element) => {
      element.textContent = element.dataset[next];
    });
    if (languageToggle && languageParts.length === 3) {
      languageParts[0].classList.toggle("language-active", next === "zh");
      languageParts[2].classList.toggle("language-active", next === "en");
      languageToggle.setAttribute("aria-label", next === "zh" ? "Switch to English" : "切换到中文");
    }
    localStorage.setItem("portfolio-language", next);
  };

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      setLanguage(document.documentElement.lang.startsWith("zh") ? "en" : "zh");
    });
  }

  if (motionVideos.length) {
    const setMotionPlayback = (motionVideo, isVisible) => {
      if (isVisible && !document.hidden) motionVideo.play().catch(() => {});
      else motionVideo.pause();
    };
    const motionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setMotionPlayback(entry.target, entry.isIntersecting)),
      { threshold: 0.12 }
    );
    motionVideos.forEach((motionVideo) => motionObserver.observe(motionVideo));
    document.addEventListener("visibilitychange", () => {
      motionVideos.forEach((motionVideo) => {
        const rect = motionVideo.getBoundingClientRect();
        setMotionPlayback(motionVideo, rect.top < window.innerHeight && rect.bottom > 0);
      });
    });
  }

  setLanguage(localStorage.getItem("portfolio-language") || "zh");
  updateProgress();
  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
})();
