export function initCarousel() {
  const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
  carousels.forEach(carousel => {
    const viewport = carousel.querySelector('[data-carousel-viewport]');
    const track = carousel.querySelector('[data-carousel-track]');
    const originals = Array.from(track?.querySelectorAll('[data-carousel-item]') || []);
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    if (!viewport || !track || originals.length === 0) return;

    const clone = (it) => {
      const c = it.cloneNode(true);
      c.dataset.carouselClone = 'true';
      c.setAttribute('aria-hidden','true');
      c.setAttribute('role','presentation');
      c.setAttribute('tabindex','-1');
      c.querySelectorAll('a,button,input,textarea,select,[tabindex]').forEach(n => { n.setAttribute('tabindex','-1'); n.setAttribute('aria-hidden','true'); });
      return c;
    };

    const pre = document.createDocumentFragment();
    for (let i = originals.length - 1; i >= 0; i--) pre.appendChild(clone(originals[i]));
    track.insertBefore(pre, track.firstChild);

    const post = document.createDocumentFragment();
    originals.forEach(it => post.appendChild(clone(it)));
    track.appendChild(post);

    const all = Array.from(track.querySelectorAll('[data-carousel-item]'));
    const span = originals.length;
    const minIndex = span;
    let index = minIndex, itemW = 0, gap = 0;

    const base = () => track.querySelector('[data-carousel-item]:not([data-carousel-clone])') || all[0];
    const compute = () => {
      const b = base(); if (b) itemW = b.offsetWidth;
      const styles = window.getComputedStyle(track);
      const g = Number.parseFloat(styles.columnGap || styles.gap || '0');
      gap = Number.isFinite(g) ? g : 0;
    };
    const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const dur = () => (reduced() ? 0 : 420);
    const apply = (i, animated=true) => {
      const dist = i * (itemW + gap);
      const val = Number.isFinite(dist) ? `translate3d(-${dist}px,0,0)` : 'translate3d(0,0,0)';
      const d = dur();
      if (!animated || d === 0) {
        track.style.transition = 'none'; track.style.transform = val;
        if (d > 0) { track.getBoundingClientRect(); track.style.transition = `transform ${d}ms ease`; }
      } else {
        track.style.transition = `transform ${d}ms ease`; track.style.transform = val;
      }
    };
    const wrap = (i) => { if (span === 0) return 0; const off = ((i - minIndex) % span + span) % span; return minIndex + off; };
    const maybeWrap = () => { const w = wrap(index); if (w !== index) { index = w; apply(index, false); } };
    const move = (dir) => { compute(); index += dir; apply(index, true); if (dur() === 0) maybeWrap(); };

    track.addEventListener('transitionend', (e) => { if (e.target === track && e.propertyName === 'transform') maybeWrap(); });
    prevBtn?.addEventListener('click', () => move(-1));
    nextBtn?.addEventListener('click', () => move(1));

    compute(); apply(index, false); window.addEventListener('resize', () => { compute(); apply(index, false); maybeWrap(); });
  });
}

