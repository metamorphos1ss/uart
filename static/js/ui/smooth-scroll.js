import { $qsa, prefersReducedMotion } from '../utils/dom.js';

export function initSmoothScroll() {
  const anchors = $qsa('a[href^="#"]');
  anchors.forEach(a => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href'); if (!href) return;
    if (href === '#') { e.preventDefault(); window.scrollTo({ top:0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); return; }
    if (!href.startsWith('#')) return;
    const target = document.querySelector(href); if (!target) return;
    e.preventDefault(); target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block:'start' });
  }));
}
