const wechatButton = document.querySelector('[data-copy-wechat]');
const status = document.querySelector('.contact-status');
let statusTimer;
wechatButton?.addEventListener('click',async () => {
  try {
    await navigator.clipboard.writeText(wechatButton.dataset.copyWechat);
    status.textContent = 'WeChat ID copied';
  } catch {
    // Keep the ID selectable if the browser denies clipboard access.
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(wechatButton);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Select and copy: YuuuQ801';
  }
  clearTimeout(statusTimer);
  status.classList.add('is-visible');
  statusTimer = setTimeout(() => status.classList.remove('is-visible'),2200);
});
