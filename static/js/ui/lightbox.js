import { $id } from '../utils/dom.js';

export function initLightbox() {
  const lightbox = $id('caseLightbox');
  const img = $id('caseLightboxImage');
  const caption = $id('caseLightboxCaption');
  const closeBtn = $id('caseLightboxClose');
  const triggers = Array.from(document.querySelectorAll('.card__media[data-image]'));
  let lastFocus = null;

  const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  const open = (btn) => {
    if (!lightbox || !img) return;
    const src = btn.dataset.image; if (!src) return;
    lastFocus = btn;
    img.src = src; img.alt = btn.dataset.alt || '';
    if (caption) { const text = btn.dataset.caption || ''; caption.textContent = text; caption.hidden = !text; }
    lightbox.removeAttribute('hidden');
    requestAnimationFrame(() => { lightbox.classList.add('is-visible'); closeBtn?.focus({ preventScroll:true }); });
    document.addEventListener('keydown', onEsc);
  };

  const close = () => {
    if (!lightbox || lightbox.hasAttribute('hidden')) return;
    lightbox.classList.remove('is-visible');
    const finalize = () => {
      img.removeAttribute('src'); img.alt = '';
      lightbox.setAttribute('hidden',''); if (caption) { caption.textContent = ''; caption.hidden = true; }
    };
    if (prefersReduced()) finalize();
    else {
      const onEnd = () => { finalize(); lightbox.removeEventListener('transitionend', onEnd); };
      lightbox.addEventListener('transitionend', onEnd, { once:true });
      setTimeout(() => { if (!lightbox.hasAttribute('hidden')) { lightbox.removeEventListener('transitionend', onEnd); finalize(); } }, 320);
    }
    document.removeEventListener('keydown', onEsc);
    lastFocus?.focus({ preventScroll:true }); lastFocus = null;
  };

  const onEsc = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };

  triggers.forEach(b => b.addEventListener('click', () => open(b)));
  closeBtn?.addEventListener('click', close);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
}
