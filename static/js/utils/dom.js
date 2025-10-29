export const $id = (id) => document.getElementById(id);
export const $qs = (sel, root = document) => root.querySelector(sel);
export const $qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

export const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch { return false; }
};

export const setYear = (id) => {
  const node = $id(id);
  if (node) node.textContent = String(new Date().getFullYear());
};
