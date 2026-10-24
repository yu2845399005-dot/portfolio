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
  const editorDocuments = new WeakMap();
  document.querySelectorAll(".editor-window").forEach((editor) => {
    editorDocuments.set(editor, editor.querySelector(".script-document").innerHTML);
  });

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

  const feedback = (element, zh, en) => {
    if (!element) return;
    element.dataset.zh = zh;
    element.dataset.en = en;
    element.textContent = currentLanguage() === "zh" ? zh : en;
  };
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const agent = button.closest(".agent-panel");
    const editor = button.closest(".editor-window");
    if (action === "option") {
      agent.querySelectorAll(".agent-option").forEach((option) => {
        const selected = option === button;
        option.classList.toggle("selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
    } else if (action === "confirm-direction" || action === "skip-direction") {
      const selected = agent.querySelector(".agent-option.selected strong");
      const customIdea = agent.querySelector(".other-idea input").value.trim();
      feedback(agent.querySelector(".demo-feedback"), action === "skip-direction" ? "已跳过，保留你的创作方向。" : `已确认：${customIdea || selected.dataset.zh}`, action === "skip-direction" ? "Skipped. Your creative direction is preserved." : `Confirmed: ${customIdea || selected.dataset.en}`);
    } else if (action === "history" || action === "close-history") {
      const overlay = agent?.querySelector(".agent-history-overlay");
      const drawer = button.closest(".editor-history-drawer");
      if (drawer && action === "close-history") drawer.hidden = true;
      else if (overlay) {
        overlay.hidden = action === "close-history" ? true : !overlay.hidden;
        agent.querySelector(".history-toggle").setAttribute("aria-expanded", String(!overlay.hidden));
        if (overlay.hidden) agent.querySelector(".history-toggle").focus({ preventScroll: true });
      } else {
        const list = button.closest(".version-list");
        const collapsed = list.classList.toggle("is-collapsed");
        list.querySelectorAll(".version-day").forEach((day) => { day.hidden = collapsed; });
        button.textContent = collapsed ? "+" : "×";
        button.setAttribute("aria-expanded", String(!collapsed));
      }
    } else if (action === "accept" || action === "discard") {
      const accepted = action === "accept";
      if (editor) {
        editor.querySelectorAll(".scene-copy [data-zh]").forEach((line) => {
          if (!line.dataset.originalZh) { line.dataset.originalZh = line.dataset.zh; line.dataset.originalEn = line.dataset.en; }
          line.dataset.zh = accepted ? line.dataset.originalZh.replaceAll("林峰", "林川") : line.dataset.originalZh;
          line.dataset.en = accepted ? line.dataset.originalEn.replaceAll("Lin Feng", "Lin Chuan") : line.dataset.originalEn;
          line.textContent = line.dataset[currentLanguage()];
        });
        editor.querySelectorAll(".script-change").forEach((line) => { line.dataset.selected = String(accepted); });
      }
      feedback(agent.querySelector(".demo-feedback"), accepted ? "已使用此修改，可继续查看下一处。" : "已丢弃此修改，保留原版本。", accepted ? "Change accepted. You can review the next change." : "Change discarded. The original version is preserved.");
    } else if (action === "next-change" && editor) {
      const lines = [...editor.querySelectorAll(".scene-copy p")];
      const index = (Number(editor.dataset.changeIndex || 0) + 1) % lines.length;
      editor.dataset.changeIndex = index;
      lines.forEach((line, i) => { line.dataset.selected = String(i === index); });
      const scroller = editor.querySelector(".editor-document-scroll");
      scroller.scrollBy({ top: lines[index].getBoundingClientRect().top - scroller.getBoundingClientRect().top - 60, behavior: scrollBehavior() });
    } else if (action === "quote" && editor) {
      const quoted = editor.querySelector(".quoted-text");
      quoted.hidden = !quoted.hidden;
      button.setAttribute("aria-pressed", String(!quoted.hidden));
      feedback(editor.querySelector(".editor-status"), quoted.hidden ? "已取消引用" : "已引用选中的第 1 集内容", quoted.hidden ? "Quotation removed" : "Selected passage from episode 1 quoted");
    } else if (action === "editor-tab" && editor) {
      editor.querySelectorAll(".editor-tabs button").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
        tab.setAttribute("aria-pressed", String(tab === button));
      });
      const documentNode = editor.querySelector(".script-document");
      const tab = Number(button.dataset.tab);
      if (tab === 2) documentNode.innerHTML = editorDocuments.get(editor);
      else if (tab === 0) documentNode.innerHTML = `<h4 data-zh="故事设定" data-en="Story settings">故事设定</h4><p data-zh="题材：末世 / 异能觉醒 / 都市逆袭" data-en="Genre: apocalypse / awakened powers / urban comeback">题材：末世 / 异能觉醒 / 都市逆袭</p><p data-zh="主角：林峰，底层网管，扮猪吃虎，吞胶囊觉醒" data-en="Lead: Lin Feng, an internet-café worker whose powers awaken after taking a capsule">主角：林峰，底层网管，扮猪吃虎，吞胶囊觉醒</p><p data-zh="反派：基地小队长（前期）→ 制药集团二代（中期）" data-en="Antagonists: a base squad leader, then a pharmaceutical heir">反派：基地小队长（前期）→ 制药集团二代（中期）</p><p data-zh="基调：先压抑后爆发；节奏偏升级流" data-en="Tone: oppression followed by release; a progression-driven pace">基调：先压抑后爆发；节奏偏升级流</p>`;
      else {
        const original = document.createElement("div");
        original.innerHTML = editorDocuments.get(editor);
        documentNode.innerHTML = [...original.querySelectorAll("summary")].map((summary) => `<p>${summary.innerHTML}</p>`).join("");
      }
      setLanguage(currentLanguage());
    } else if (action === "restore" || action === "compare") {
      const item = button.closest(".version-item");
      const area = button.closest(".version-detail-panel, .editor-window, .agent-panel");
      area?.querySelectorAll(".version-item").forEach((version) => version.classList.toggle("is-selected", version === item));
      const status = area?.querySelector(".editor-status") || area?.querySelector(".version-preview p") || item?.querySelector("p");
      feedback(status, action === "restore" ? "已回到此版本：5月29日 16:23" : "修改对比：已高亮本次修改", action === "restore" ? "Restored version: May 29, 16:23" : "Changes compared: this revision is highlighted");
      area?.querySelectorAll(".script-change").forEach((line) => { line.dataset.selected = String(action === "compare"); });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".agent-history-overlay:not([hidden])").forEach((overlay) => {
      overlay.hidden = true;
      const toggle = overlay.closest(".agent-panel").querySelector(".history-toggle");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus({ preventScroll: true });
    });
  });

  if (languageToggle) languageToggle.addEventListener("click", () => setLanguage(document.documentElement.lang.startsWith("zh") ? "en" : "zh"));
  let savedLanguage = "zh";
  try { savedLanguage = localStorage.getItem("portfolio-language") || "zh"; } catch (_) { /* Use the default when storage is unavailable. */ }
  setLanguage(savedLanguage);
  updateProgress();
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener("resize", updateProgress);
})();
