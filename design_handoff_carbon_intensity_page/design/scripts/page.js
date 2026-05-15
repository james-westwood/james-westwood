/* ============================================================
   Page-level interactions — sticky header border on scroll.
   ============================================================ */

(function () {
  const header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    header.dataset.scrolled = (window.scrollY > 8) ? 'true' : 'false';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
