(() => {
  // Keep old bookmarks working while showing the shorter homepage address.
  const url = new URL(location.href);
  if (/^https?:$/.test(url.protocol) && url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.slice(0, -"index.html".length);
    url.searchParams.delete("v");
    history.replaceState(history.state, "", url);
  }

  const experienceList = document.querySelector(".experience-list");
  const experienceItems = [...document.querySelectorAll("[data-experience-item]")];
  if (!experienceList || !experienceItems.length) return;

  const activate = (nextItem) => {
    experienceItems.forEach((item) => {
      const active = item === nextItem;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-expanded", String(active));
    });
  };

  experienceItems.forEach((item) => {
    item.addEventListener("pointerenter", () => activate(item));
    item.addEventListener("focusin", () => activate(item));
    item.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      activate(item);
    });
  });

  experienceList.addEventListener("pointerleave", () => activate(null));
  experienceList.addEventListener("focusout", (event) => {
    if (!experienceList.contains(event.relatedTarget)) activate(null);
  });
})();
