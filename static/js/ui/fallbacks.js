export function initTeamFallbacks() {
  const blocks = Array.from(document.querySelectorAll('.team-card__media'));
  blocks.forEach(media => {
    const img = media.querySelector('img');
    const activate = () => {
      media.classList.add('is-fallback');
      if (img) { img.style.display = 'none'; img.setAttribute('aria-hidden','true'); }
    };
    if (!img) { activate(); return; }
    const check = () => { if (img.complete && img.naturalWidth === 0) activate(); };
    img.addEventListener('error', activate, { once:true });
    img.addEventListener('load', () => { if (img.naturalWidth === 0) activate(); }, { once:true });
    check();
  });
}
