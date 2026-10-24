(() => {
  const railSteps = [...document.querySelectorAll(".rail-bars button")];
  const languageToggle = document.querySelector(".language-toggle");
  const languageParts = languageToggle ? [...languageToggle.querySelectorAll("span")] : [];
  const targets = railSteps.map((step) => document.getElementById(step.dataset.target)).filter(Boolean);
  let activeIndex = 0;
  let ticking = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () => reducedMotion.matches ? "auto" : "smooth";
  const currentLanguage = () => document.documentElement.lang.startsWith("zh") ? "zh" : "en";

  const mobileNav = document.createElement("nav");
  mobileNav.className = "mobile-section-nav";
  mobileNav.setAttribute("aria-label", "Case study sections");
  mobileNav.innerHTML = [["background", "背景", "Background"], ["thinking", "设计思考", "Thinking"], ["solution", "设计方案", "Solution"], ["result", "成果", "Result"]].map(([id, zh, en]) => `<a href="#${id}" data-zh="${zh}" data-en="${en}">${zh}</a>`).join("");
  document.querySelector(".project-hero").after(mobileNav);

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
    targets.forEach((target, index) => { if (target.getBoundingClientRect().top + window.scrollY <= marker) next = index; });
    setActive(next);
    let mobileActive = 0;
    [...mobileNav.querySelectorAll("a")].forEach((link, index) => {
      const section = document.querySelector(link.getAttribute("href"));
      if (section.getBoundingClientRect().top <= window.innerHeight * .42) mobileActive = index;
    });
    mobileNav.querySelectorAll("a").forEach((link, index) => {
      link.classList.toggle("active", index === mobileActive);
      if (index === mobileActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    ticking = false;
  };

  railSteps.forEach((step) => step.addEventListener("click", () => {
    const target = document.getElementById(step.dataset.target);
    if (target) target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }));

  const setLanguage = (language) => {
    const next = language === "en" ? "en" : "zh";
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-zh][data-en]").forEach((element) => {
      const value = element.dataset[next];
      if (value.includes("\n")) element.innerHTML = value.split("\n").map((line) => line.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")).join("<br />");
      else element.textContent = value;
    });
    document.querySelectorAll("[data-zh-placeholder]").forEach((element) => { element.placeholder = element.dataset[`${next}Placeholder`]; });
    document.querySelectorAll("[data-zh-label]").forEach((element) => { element.setAttribute("aria-label", element.dataset[`${next}Label`]); });
    document.querySelectorAll(".role-matrix td").forEach((cell) => {
      const labels = next === "zh" ? ["创作状态", "用户感知", "AI 职责"] : ["Starting point", "Creator need", "AI responsibility"];
      cell.dataset.label = labels[cell.cellIndex - 1];
    });
    if (languageParts.length === 3) {
      languageParts[0].classList.toggle("language-active", next === "zh");
      languageParts[2].classList.toggle("language-active", next === "en");
      languageToggle.setAttribute("aria-label", next === "zh" ? "Switch to English" : "切换到中文");
    }
    try { localStorage.setItem("portfolio-language", next); } catch (_) { /* Private browsing can restrict storage. */ }
    requestAnimationFrame(updateProgress);
  };

  if (languageToggle) languageToggle.addEventListener("click", () => setLanguage(document.documentElement.lang.startsWith("zh") ? "en" : "zh"));
  let savedLanguage = "zh";
  try { savedLanguage = localStorage.getItem("portfolio-language") || "zh"; } catch (_) { /* Use the default when storage is unavailable. */ }
  setLanguage(savedLanguage);
  updateProgress();
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener("resize", updateProgress);
})();
