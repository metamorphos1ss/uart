import { initTheme } from './ui/theme.js';
import { initNav } from './ui/nav.js';
import { initSmoothScroll } from './ui/smooth-scroll.js';
import { initLightbox } from './ui/lightbox.js';
import { initCarousel } from './ui/carousel.js';
import { initTeamFallbacks } from './ui/fallbacks.js';

import { initFeedbackForm } from './forms/feedback.js';
import { initApplicantsForm } from './forms/applicants.js';

import { setYear } from './utils/dom.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initSmoothScroll();
  initLightbox();
  initCarousel();
  initTeamFallbacks();
  setYear('year');

  initFeedbackForm('#heroForm', '#callFeedback');
  initApplicantsForm('#applicantsForm');
});
