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

    // The highlight window stays on the middle row as the two tracks scroll together.
    const highlight = document.createElement("div");
    highlight.className = "prompt-highlight";
    highlight.setAttribute("aria-hidden", "true");
    highlight.append(track.cloneNode(true));
    carousel.append(highlight);
    carousel.classList.add("is-animated");
    new IntersectionObserver(([entry]) => {
      carousel.classList.toggle("is-visible", entry.isIntersecting);
    }, { threshold: 0.25 }).observe(carousel);
  }

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const creatorInterview = document.querySelector("[data-creator-interview]");
  if (creatorInterview && "IntersectionObserver" in window && !reducedMotion.matches) {
    const quotes = Array.from(creatorInterview.querySelectorAll(".creator-quote"), quote => {
      const original = quote.firstElementChild;
      const display = document.createElement("span");
      display.setAttribute("aria-hidden", "true");
      quote.append(display);
      return { line: quote.closest("p"), characters: Array.from(original.textContent), display };
    });
    let revealFrame = 0;
    let started = false;

    function finishQuotes() {
      observer.disconnect();
      cancelAnimationFrame(revealFrame);
      delete creatorInterview.dataset.speaking;
      creatorInterview.classList.remove("is-revealing-quotes");
      for (const { line, display } of quotes) {
        line.classList.remove("is-revealed");
        display.remove();
      }
      toggle.removeEventListener("click", finishQuotes);
      reducedMotion.removeEventListener("change", finishQuotes);
    }

    function revealQuotes() {
      const start = performance.now();
      let speaking = "";
      const timing = [{ delay: 220, duration: 1620 }, { delay: 2220, duration: 1510 }];
      const last = timing[timing.length - 1];

      function tick(now) {
        const elapsed = now - start;
        let next = "";
        quotes.forEach(({ line, characters, display }, index) => {
          const { delay, duration } = timing[index];
          if (elapsed < delay) return;
          line.classList.add("is-revealed");
          const progress = Math.min(1, (elapsed - delay) / duration);
          const text = characters.slice(0, Math.ceil(progress * characters.length)).join("");
          if (display.textContent !== text) display.textContent = text;
          if (progress < 1) next = String(index + 1);
        });
        if (next !== speaking) {
          speaking = next;
          if (speaking) creatorInterview.dataset.speaking = speaking;
          else delete creatorInterview.dataset.speaking;
        }
        if (elapsed >= last.delay + last.duration) finishQuotes();
        else revealFrame = requestAnimationFrame(tick);
      }

      revealFrame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!started && entry.intersectionRatio >= .45) {
        started = true;
        revealQuotes();
      } else if (started && !entry.isIntersecting) {
        finishQuotes();
      }
    }, { threshold: [0, .45] });
    creatorInterview.classList.add("is-revealing-quotes");
    toggle.addEventListener("click", finishQuotes);
    reducedMotion.addEventListener("change", finishQuotes);
    observer.observe(creatorInterview);
  }

  const motionVideos = document.querySelectorAll(".motion-preview-video, [data-motion-preview]");
  if (motionVideos.length) {
    const visibleVideos = new Set();
    function updateMotionPreview() {
      for (const video of motionVideos) {
        if (visibleVideos.has(video) && !reducedMotion.matches) video.play().catch(() => {});
        else video.pause();
      }
    }
    reducedMotion.addEventListener("change", updateMotionPreview);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) visibleVideos.add(target);
          else visibleVideos.delete(target);
        }
        updateMotionPreview();
      });
      motionVideos.forEach(video => observer.observe(video));
    } else {
      motionVideos.forEach(video => visibleVideos.add(video));
      updateMotionPreview();
    }
  }
})();
