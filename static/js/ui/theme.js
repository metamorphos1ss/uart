import { $id } from '../utils/dom.js';

const KEY = 'uart-theme';

export function initTheme() {
  const body = document.body;
  const btn = $id('themeToggle');
  const label = btn ? btn.querySelector('.theme-toggle__label') : null;
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: light)') : null;

  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, v); } catch {} };

  const labelText = (isLight) => isLight ? (btn?.dataset?.labelLight || 'РўС‘РјРЅР°СЏ С‚РµРјР°')
                                         : (btn?.dataset?.labelDark  || 'РЎРІРµС‚Р»Р°СЏ С‚РµРјР°');

  const apply = (theme) => {
    const isLight = theme === 'light';
    body.classList.toggle('theme-light', isLight);
    body.dataset.theme = isLight ? 'light' : 'dark';
    if (btn) {
      const text = labelText(isLight);
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', text);
      btn.title = text;
      if (label) label.textContent = text;
    }
  };

  const stored = read();
  const initial = (stored === 'light' || stored === 'dark') ? stored : (mq?.matches ? 'light' : 'dark');
  apply(initial);

  if (!stored && mq) {
    const handler = (e) => apply(e.matches ? 'light' : 'dark');
    (typeof mq.addEventListener === 'function' ? mq.addEventListener('change', handler) : mq.addListener?.(handler));
  }

  btn?.addEventListener('click', () => {
    const next = body.classList.contains('theme-light') ? 'dark' : 'light';
    apply(next); write(next);
  });
}

