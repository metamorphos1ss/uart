import { $id, $qsa } from '../utils/dom.js';

export function initNav() {
  const body = document.body;
  const nav = $id('siteNav');
  const toggle = $id('navToggle');
  const closeBtn = $id('navClose');
  const backdrop = $id('navBackdrop');
  const links = nav ? $qsa('a', nav) : [];
  const desktop = window.matchMedia('(min-width: 64em)');

  const showBackdrop = () => { if (!backdrop) return; backdrop.removeAttribute('hidden'); requestAnimationFrame(() => backdrop.classList.add('is-visible')); };
  const hideBackdrop = (immediate=false) => {
    if (!backdrop) return;
    backdrop.classList.remove('is-visible');
    if (immediate) { backdrop.setAttribute('hidden',''); return; }
    setTimeout(() => { if (!backdrop.classList.contains('is-visible')) backdrop.setAttribute('hidden',''); }, 220);
  };

  const open = () => { if (!nav || desktop.matches) return; nav.classList.add('is-open'); toggle?.setAttribute('aria-expanded','true'); body.classList.add('is-nav-open'); showBackdrop(); };
  const close = ({ focusToggle=false, immediate=false }={}) => {
    if (!nav) return;
    nav.classList.remove('is-open'); toggle?.setAttribute('aria-expanded','false'); body.classList.remove('is-nav-open');
    hideBackdrop(immediate); if (focusToggle) toggle?.focus({ preventScroll:true });
  };

  toggle?.addEventListener('click', () => nav?.classList.contains('is-open') ? close() : open());
  closeBtn?.addEventListener('click', () => close({ focusToggle:true }));
  backdrop?.addEventListener('click', () => close({ focusToggle:true }));
  links.forEach(a => a.addEventListener('click', () => { if (!desktop.matches) close(); }));

  const desktopChange = (e) => { if (e.matches) close({ immediate:true }); };
  (typeof desktop.addEventListener === 'function' ? desktop.addEventListener('change', desktopChange)
                                                  : desktop.addListener?.(desktopChange));

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav?.classList.contains('is-open')) { e.preventDefault(); close({ focusToggle:true }); } });
  toggle?.setAttribute('aria-expanded','false');
}

