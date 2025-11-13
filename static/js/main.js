import { initTheme } from './ui/theme.js';
import { initNav } from './ui/nav.js';
import { initSmoothScroll } from './ui/smooth-scroll.js';
import { initTeamFallbacks } from './ui/fallbacks.js';
import { initFeedbackForm } from './forms/feedback.js';
import { initApplicantsForm } from './forms/applicants.js';
import { setYear } from './utils/dom.js';

const observeAndLoad = (selector, loader) => {
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;
  let hasLoaded = false;
  const run = () => {
    if (hasLoaded) return;
    hasLoaded = true;
    loader();
  };
  if (!('IntersectionObserver' in window)) {
    run();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      run();
      observer.disconnect();
    }
  }, { rootMargin: '200px 0px' });
  targets.forEach(el => observer.observe(el));
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initSmoothScroll();
  initTeamFallbacks();
  setYear('year');

  initFeedbackForm('#heroForm');
  initApplicantsForm('#applicantsForm');

  observeAndLoad('[data-carousel]', () => {
    import('./ui/carousel.js').then(({ initCarousel }) => initCarousel()).catch(() => {});
  });
  observeAndLoad('[data-lightbox-root]', () => {
    import('./ui/lightbox.js').then(({ initLightbox }) => initLightbox()).catch(() => {});
  });
});

