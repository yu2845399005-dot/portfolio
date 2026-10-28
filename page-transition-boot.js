/* Apply before first paint so native document navigation has no content flash. */
(() => {
  try {
    const ticket = JSON.parse(sessionStorage.getItem('yucean:transition') || 'null');
    const target = new URL(ticket?.to || '', location.href);
    if (ticket && Date.now()-ticket.at < 20000 && target.href === location.href) {
      document.documentElement.classList.add('page-enter-pending');
      window.__yuceanIncoming = ticket;
      window.__yuceanEntryFallback = setTimeout(() => {
        document.documentElement.classList.remove('page-enter-pending');
      },10000);
    }
  } catch { /* Navigation works normally when browser storage is unavailable. */ }
})();
