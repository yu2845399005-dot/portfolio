(() => {
  const railSteps = [...document.querySelectorAll(".rail-bars button")];
  const languageToggle = document.querySelector(".language-toggle");
  const languageParts = languageToggle ? [...languageToggle.querySelectorAll("span")] : [];
  const scaledThinkingRows = [
    { element: document.querySelector(".thinking-cards:not(.three)"), width: 1162 },
    { element: document.querySelector(".thinking-cards.three"), width: 1082 },
  ];
  let ticking = false;

  const updateThinkingScale = () => {
    const mobile = window.matchMedia("(max-width: 760px)").matches;

    scaledThinkingRows.forEach(({ element, width }) => {
      if (!element) return;
      if (mobile) {
        element.style.zoom = "";
        return;
      }

      const availableWidth = element.parentElement.clientWidth;
      element.style.zoom = String(Math.min(1, availableWidth / width));
    });
  };

  const maxScroll = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const setActiveStep = () => {
    const maximum = maxScroll();
    const progress = maximum ? window.scrollY / maximum : 0;
    const index = Math.max(
      0,
      Math.min(railSteps.length - 1, Math.round(progress * (railSteps.length - 1)))
    );

    railSteps.forEach((step, stepIndex) => {
      const active = stepIndex === index;
      step.classList.toggle("active", active);
      if (active) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    ticking = false;
  };

  const requestProgressUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(setActiveStep);
  };

  railSteps.forEach((step, index) => {
    step.addEventListener("click", () => {
      const maximum = maxScroll();
      const top = maximum * (index / Math.max(1, railSteps.length - 1));
      window.scrollTo({ top, behavior: "smooth" });
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
      languageToggle.setAttribute(
        "aria-label",
        next === "zh" ? "Switch to English" : "切换到中文"
      );
    }

    localStorage.setItem("onboarding-language", next);
  };

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      setLanguage(document.documentElement.lang.startsWith("zh") ? "en" : "zh");
    });
  }

  setLanguage(localStorage.getItem("onboarding-language") || "zh");
  updateThinkingScale();
  setActiveStep();

  if ("ResizeObserver" in window) {
    const thinkingScaleObserver = new ResizeObserver(updateThinkingScale);
    scaledThinkingRows.forEach(({ element }) => {
      if (element) thinkingScaleObserver.observe(element.parentElement);
    });
  }

  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", () => {
    updateThinkingScale();
    requestProgressUpdate();
  });
})();
