/* Apply before first paint so native document navigation has no content flash. */
(() => {
  try {
    const ticket = JSON.parse(sessionStorage.getItem('yucean:transition') || 'null');
    const target = new URL(ticket?.to || '', location.href);
    if (ticket && Date.now()-ticket.at < 20000 && target.href === location.href) {
      const slow = ticket.shown || Date.now()-ticket.at >= 320;
      window.__yuceanIncoming = {...ticket,slow};
      if (slow) {
        document.documentElement.classList.add('page-enter-pending');
        window.__yuceanEntryFallback = setTimeout(() => {
          document.documentElement.classList.remove('page-enter-pending');
        },1500);
      }
    }
  } catch { /* Navigation works normally when browser storage is unavailable. */ }
})();
