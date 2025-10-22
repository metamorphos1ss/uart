/* -------------------------------------------------
   UArt responsive interactions (ES2023)
   - sticky header navigation enhancements
   - smooth scrolling helpers
   - lightweight form validation shared across forms
   ------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;
  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
  const heroForm = document.getElementById('heroForm');
  const contactForm = document.getElementById('contactForm');
  const callBtn = document.getElementById('contactCall');
  const scrollTopBtn = document.getElementById('scrollTop');
  const nav = document.getElementById('siteNav');
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const navBackdrop = document.getElementById('navBackdrop');
  const navLinks = nav ? Array.from(nav.querySelectorAll('a')) : [];
  const desktopMedia = window.matchMedia('(min-width: 64em)');
  const teamMedia = Array.from(document.querySelectorAll('.team-card__media'));
  const caseMediaButtons = Array.from(document.querySelectorAll('.card__media[data-image]'));
  const lightbox = document.getElementById('caseLightbox');
  const lightboxImage = document.getElementById('caseLightboxImage');
  const lightboxCaption = document.getElementById('caseLightboxCaption');
  const lightboxClose = document.getElementById('caseLightboxClose');
  let lastFocusedMedia = null;

  const showBackdrop = () => {
    if (!navBackdrop) {
      return;
    }
    navBackdrop.removeAttribute('hidden');
    requestAnimationFrame(() => {
      navBackdrop.classList.add('is-visible');
    });
  };

  const hideBackdrop = (immediate = false) => {
    if (!navBackdrop) {
      return;
    }
    navBackdrop.classList.remove('is-visible');
    if (immediate) {
      navBackdrop.setAttribute('hidden', '');
      return;
    }
    window.setTimeout(() => {
      if (!navBackdrop.classList.contains('is-visible')) {
        navBackdrop.setAttribute('hidden', '');
      }
    }, 220);
  };

  const openNav = () => {
    if (!nav || desktopMedia.matches) {
      return;
    }
    nav.classList.add('is-open');
    navToggle?.setAttribute('aria-expanded', 'true');
    body.classList.add('is-nav-open');
    showBackdrop();
  };

  const closeNav = ({ focusToggle = false, immediate = false } = {}) => {
    if (!nav) {
      return;
    }
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    body.classList.remove('is-nav-open');
    hideBackdrop(immediate);
    if (focusToggle) {
      navToggle?.focus({ preventScroll: true });
    }
  };

  navToggle?.addEventListener('click', () => {
    if (nav?.classList.contains('is-open')) {
      closeNav();
      return;
    }
    openNav();
  });

  navClose?.addEventListener('click', () => closeNav({ focusToggle: true }));
  navBackdrop?.addEventListener('click', () => closeNav({ focusToggle: true }));

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!desktopMedia.matches) {
        closeNav();
      }
    });
  });

  const handleDesktopChange = event => {
    if (event.matches) {
      closeNav({ immediate: true });
    }
  };

  if (typeof desktopMedia.addEventListener === 'function') {
    desktopMedia.addEventListener('change', handleDesktopChange);
  } else if (typeof desktopMedia.addListener === 'function') {
    desktopMedia.addListener(handleDesktopChange);
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      event.preventDefault();
      closeNav({ focusToggle: true });
    }
  });

  navToggle?.setAttribute('aria-expanded', 'false');

  /* Smooth scrolling anchored links */
  anchors.forEach(anchor => {
    anchor.addEventListener('click', event => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href === '#') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        return;
      }

      if (!href.startsWith('#')) {
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* Form validation shared between hero and contact forms */
  [heroForm, contactForm].forEach(form => {
    if (!form) return;
    const fields = Array.from(form.querySelectorAll('[required]'));

    form.addEventListener('submit', event => {
      event.preventDefault();
      let firstInvalid = null;

      fields.forEach(field => {
        const valid = validateField(field);
        if (!valid && !firstInvalid) {
          firstInvalid = field;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: false });
        firstInvalid.reportValidity();
        return;
      }

      notify('Заявка отправлена! Мы свяжемся в рабочее время.');
      form.reset();
      fields.forEach(field => clearFieldState(field));
    });

    form.addEventListener('input', event => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        validateField(target);
      }
    });
  });

  function validateField(field) {
    const value = (field.value ?? '').trim();
    let message = '';

    if (!value) {
      message = 'Заполните поле';
    } else if (field.type === 'tel') {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10) {
        message = 'Введите номер телефона полностью';
      }
    }

    if (message) {
      setFieldError(field, message);
      return false;
    }

    clearFieldState(field);
    return true;
  }

  function setFieldError(field, message) {
    const wrapper = field.closest('.field');
    wrapper?.classList.add('field--error');
    field.setAttribute('aria-invalid', 'true');
    field.setCustomValidity(message);
  }

  function clearFieldState(field) {
    const wrapper = field.closest('.field');
    wrapper?.classList.remove('field--error');
    field.removeAttribute('aria-invalid');
    field.setCustomValidity('');
  }

  function notify(message) {
    try {
      alert(message);
    } catch (error) {
      console.log(message);
    }
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      return false;
    }
  }

  function openLightbox(button) {
    if (!lightbox || !lightboxImage) return;
    const src = button.dataset.image;
    if (!src) return;
    lastFocusedMedia = button;
    lightboxImage.src = src;
    lightboxImage.alt = button.dataset.alt || '';
    if (lightboxCaption) {
      const caption = button.dataset.caption || '';
      lightboxCaption.textContent = caption;
      lightboxCaption.hidden = !caption;
    }
    lightbox.removeAttribute('hidden');
    window.requestAnimationFrame(() => {
      lightbox.classList.add('is-visible');
      lightboxClose?.focus({ preventScroll: true });
    });
    document.addEventListener('keydown', onLightboxKeydown);
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hasAttribute('hidden')) return;
    lightbox.classList.remove('is-visible');

    const finalize = () => {
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
      lightbox.setAttribute('hidden', '');
      if (lightboxCaption) {
        lightboxCaption.textContent = '';
        lightboxCaption.hidden = true;
      }
    };

    if (prefersReducedMotion()) {
      finalize();
    } else {
      const handleTransitionEnd = () => {
        finalize();
        lightbox.removeEventListener('transitionend', handleTransitionEnd);
      };
      lightbox.addEventListener('transitionend', handleTransitionEnd, { once: true });
      window.setTimeout(() => {
        if (!lightbox.hasAttribute('hidden')) {
          lightbox.removeEventListener('transitionend', handleTransitionEnd);
          finalize();
        }
      }, 320);
    }

    document.removeEventListener('keydown', onLightboxKeydown);
    lastFocusedMedia?.focus({ preventScroll: true });
    lastFocusedMedia = null;
  }

  function onLightboxKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    }
  }

  caseMediaButtons.forEach(button => {
    button.addEventListener('click', () => openLightbox(button));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  callBtn?.addEventListener('click', () => {
    window.location.href = 'tel:+79999999999';
  });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });

  /* Team photo fallbacks */
  teamMedia.forEach(media => {
    const img = media.querySelector('img');
    if (!img) return;

    const activateFallback = () => {
      media.classList.add('is-fallback');
      img.style.display = 'none';
      img.setAttribute('aria-hidden', 'true');
    };

    const checkImage = () => {
      if (img.complete && img.naturalWidth === 0) {
        activateFallback();
      }
    };

    img.addEventListener('error', activateFallback, { once: true });
    img.addEventListener('load', () => {
      if (img.naturalWidth === 0) {
        activateFallback();
      }
    }, { once: true });

    checkImage();
  });
});
