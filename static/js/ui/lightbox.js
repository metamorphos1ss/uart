import { $id } from '../utils/dom.js';

export function initLightbox() {
  const lightbox = $id('caseLightbox');
  const img = $id('caseLightboxImage');
  const avifSource = $id('caseLightboxSourceAvif');
  const webpSource = $id('caseLightboxSourceWebp');
  const caption = $id('caseLightboxCaption');
  const closeBtn = $id('caseLightboxClose');
  const triggers = Array.from(document.querySelectorAll('.card__media[data-image]'));
  let lastFocus = null;

  const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  const applySources = (btn) => {
    const { imageAvifSet, imageWebpSet, imageFallbackSet, imageSizes, imageWidth, imageHeight, alt } = btn.dataset;
    const fallback = btn.dataset.imageFallback || btn.dataset.image || '';
    if (avifSource) {
      if (imageAvifSet) avifSource.setAttribute('srcset', imageAvifSet);
      else avifSource.removeAttribute('srcset');
      if (imageSizes) avifSource.setAttribute('sizes', imageSizes);
      else avifSource.removeAttribute('sizes');
    }
    if (webpSource) {
      if (imageWebpSet) webpSource.setAttribute('srcset', imageWebpSet);
      else webpSource.removeAttribute('srcset');
      if (imageSizes) webpSource.setAttribute('sizes', imageSizes);
      else webpSource.removeAttribute('sizes');
    }
    if (img) {
      img.src = fallback;
      if (imageFallbackSet) img.srcset = imageFallbackSet;
      else img.removeAttribute('srcset');
      if (imageSizes) img.sizes = imageSizes;
      else img.removeAttribute('sizes');
      img.alt = alt || '';
      if (imageWidth) img.setAttribute('width', imageWidth);
      if (imageHeight) img.setAttribute('height', imageHeight);
    }
  };

  const open = (btn) => {
    if (!lightbox || !img) return;
    const src = btn.dataset.imageFallback || btn.dataset.image; if (!src) return;
    lastFocus = btn;
    applySources(btn);
    if (caption) { const text = btn.dataset.caption || ''; caption.textContent = text; caption.hidden = !text; }
    lightbox.removeAttribute('hidden');
    requestAnimationFrame(() => { lightbox.classList.add('is-visible'); closeBtn?.focus({ preventScroll:true }); });
    document.addEventListener('keydown', onEsc);
  };

  const close = () => {
    if (!lightbox || lightbox.hasAttribute('hidden')) return;
    lightbox.classList.remove('is-visible');
    const finalize = () => {
      img.removeAttribute('src'); img.removeAttribute('srcset'); img.removeAttribute('sizes'); img.removeAttribute('width'); img.removeAttribute('height'); img.alt = '';
      avifSource?.removeAttribute('srcset'); avifSource?.removeAttribute('sizes');
      webpSource?.removeAttribute('srcset'); webpSource?.removeAttribute('sizes');
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

