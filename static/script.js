/* -------------------------------------------------
   UArt responsive interactions (ES2023)
   - sticky header navigation enhancements
   - smooth scrolling helpers
   - lightweight form validation shared across forms
   ------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleLabel = themeToggle ? themeToggle.querySelector('.theme-toggle__label') : null;
  const themeMediaQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: light)') : null;
  const THEME_STORAGE_KEY = 'uart-theme';
  const themeLabels = {
    light: themeToggle?.dataset?.labelLight || 'Тёмная тема',
    dark: themeToggle?.dataset?.labelDark || 'Светлая тема',
  };

  const getStoredTheme = () => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  const setStoredTheme = value => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch (error) {
      // noop
    }
  };

  const getThemeLabel = isLight => (isLight ? themeLabels.light : themeLabels.dark);

  const applyTheme = theme => {
    const isLight = theme === 'light';
    body.classList.toggle('theme-light', isLight);
    body.dataset.theme = isLight ? 'light' : 'dark';
    if (themeToggle) {
      const labelText = getThemeLabel(isLight);
      themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', labelText);
      themeToggle.title = labelText;
      if (themeToggleLabel) {
        themeToggleLabel.textContent = labelText;
      }
    }
  };

  const storedTheme = getStoredTheme();
  const hasStoredTheme = storedTheme === 'light' || storedTheme === 'dark';
  const initialTheme = hasStoredTheme
    ? storedTheme
    : (themeMediaQuery?.matches ? 'light' : 'dark');

  applyTheme(initialTheme);

  const handleSchemeChange = event => {
    if (getStoredTheme()) {
      return;
    }
    applyTheme(event.matches ? 'light' : 'dark');
  };

  if (!hasStoredTheme && themeMediaQuery) {
    if (typeof themeMediaQuery.addEventListener === 'function') {
      themeMediaQuery.addEventListener('change', handleSchemeChange);
    } else if (typeof themeMediaQuery.addListener === 'function') {
      themeMediaQuery.addListener(handleSchemeChange);
    }
  }

  themeToggle?.addEventListener('click', () => {
    const nextTheme = body.classList.contains('theme-light') ? 'dark' : 'light';
    applyTheme(nextTheme);
    setStoredTheme(nextTheme);
  });

  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
  const heroForm = document.getElementById('heroForm');
  const applicantsForm = document.getElementById('applicantsForm');
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
  const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
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

  /* Form validation + submission */
  const DEFAULT_MAX_FILE_SIZE = 2 * 1024 * 1024;

  const formConfigs = [
    {
      form: heroForm,
      endpoint: '/api/submit_feedback',
      successMessage: 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.',
      serialize: formData => {
        const payload = {};
        formData.forEach((value, key) => {
          if (value instanceof File) {
            return;
          }
          payload[key] = typeof value === 'string' ? value.trim() : value;
        });
        return {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        };
      },
    },
    {
      form: applicantsForm,
      endpoint: '/api/submit_applicants',
      successMessage: 'Спасибо! Мы получили вашу заявку и скоро свяжемся.',
      fileField: 'resume_file',
      allowedExtensions: ['pdf', 'doc', 'docx'],
      allowedMime: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      serialize: formData => ({ body: formData }),
    },
  ];

  formConfigs.forEach(config => {
    const {
      form,
      endpoint,
      successMessage,
      fileField,
      allowedExtensions = [],
      allowedMime = [],
      serialize,
    } = config;

    if (!form) {
      return;
    }

    const fields = Array.from(form.querySelectorAll('[required]'));

    form.addEventListener('submit', async event => {
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

      const formData = new FormData(form);
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          formData.set(key, value.trim());
        }
      });

      if (fileField) {
        const fileInput = form.querySelector(`input[name="${fileField}"]`);
        const file = fileInput?.files?.[0] || null;
        if (file) {
          const extension = (file.name.split('.').pop() || '').toLowerCase();
          const type = file.type || '';
          const isExtensionAllowed = allowedExtensions.length === 0 || allowedExtensions.includes(extension);
          const isMimeAllowed = allowedMime.length === 0 || (type && allowedMime.includes(type));
          if (!isExtensionAllowed && !isMimeAllowed) {
            notify('Допустимы файлы PDF или DOCX.');
            return;
          }
          if (file.size > DEFAULT_MAX_FILE_SIZE) {
            notify('Файл должен быть не больше 2 МБ.');
            return;
          }
        }
      }

      const requestInit = typeof serialize === 'function'
        ? serialize(formData)
        : {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              Object.fromEntries(
                Array.from(formData.entries()).filter(([, value]) => !(value instanceof File)),
              ),
            ),
          };

      try {
        const response = await fetch(endpoint, { method: 'POST', ...requestInit });
        let result = null;
        try {
          result = await response.json();
        } catch {
          // ignore empty responses
        }

        if (response.ok && (result?.ok ?? true)) {
          notify(successMessage);
          form.reset();
          fields.forEach(field => clearFieldState(field));
          if (fileField) {
            const fileInput = form.querySelector(`input[name="${fileField}"]`);
            if (fileInput) {
              fileInput.value = '';
            }
          }
        } else {
          const detail = result?.detail || response.statusText || 'Не удалось отправить форму. Попробуйте позже.';
          notify(`Ошибка: ${detail}`);
        }
      } catch (error) {
        console.error('Form submission failed', error);
        notify('Сетевая ошибка. Проверьте соединение и попробуйте снова.');
      }
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

  carousels.forEach(carousel => {
    const viewport = carousel.querySelector('[data-carousel-viewport]');
    const track = carousel.querySelector('[data-carousel-track]');
    const originals = Array.from(track?.querySelectorAll('[data-carousel-item]') || []);
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');

    if (!viewport || !track || originals.length === 0) {
      return;
    }

    const createClone = item => {
      const clone = item.cloneNode(true);
      clone.dataset.carouselClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('role', 'presentation');
      clone.setAttribute('tabindex', '-1');
      clone.querySelectorAll('a, button, input, textarea, select, [tabindex]').forEach(node => {
        node.setAttribute('tabindex', '-1');
        node.setAttribute('aria-hidden', 'true');
      });
      return clone;
    };

    const prependFragment = document.createDocumentFragment();
    for (let index = originals.length - 1; index >= 0; index -= 1) {
      prependFragment.appendChild(createClone(originals[index]));
    }
    track.insertBefore(prependFragment, track.firstChild);

    const appendFragment = document.createDocumentFragment();
    originals.forEach(item => {
      appendFragment.appendChild(createClone(item));
    });
    track.appendChild(appendFragment);

    const allItems = Array.from(track.querySelectorAll('[data-carousel-item]'));
    const originalCount = originals.length;
    const minIndex = originalCount;

    let currentIndex = minIndex;
    let itemWidth = 0;
    let gap = 0;

    const getBaseItem = () => track.querySelector('[data-carousel-item]:not([data-carousel-clone])') || allItems[0];

    const computeMetrics = () => {
      const baseItem = getBaseItem();
      if (baseItem) {
        itemWidth = baseItem.offsetWidth;
      }
      const styles = window.getComputedStyle(track);
      const parsedGap = Number.parseFloat(styles.columnGap || styles.gap || '0');
      gap = Number.isFinite(parsedGap) ? parsedGap : 0;
    };

    const getDuration = () => (prefersReducedMotion() ? 0 : 420);

    const applyTransform = (index, animated = true) => {
      const distance = index * (itemWidth + gap);
      const value = Number.isFinite(distance) ? `translate3d(-${distance}px, 0, 0)` : 'translate3d(0, 0, 0)';
      const duration = getDuration();
      if (!animated || duration === 0) {
        track.style.transition = 'none';
        track.style.transform = value;
        if (duration > 0) {
          track.getBoundingClientRect();
          track.style.transition = `transform ${duration}ms ease`;
        }
      } else {
        track.style.transition = `transform ${duration}ms ease`;
        track.style.transform = value;
      }
    };

    const wrapIndex = index => {
      const span = originalCount;
      if (span === 0) {
        return 0;
      }
      const offset = ((index - minIndex) % span + span) % span;
      return minIndex + offset;
    };

    const wrapIfNeeded = () => {
      const wrappedIndex = wrapIndex(currentIndex);
      if (wrappedIndex !== currentIndex) {
        currentIndex = wrappedIndex;
        applyTransform(currentIndex, false);
      }
    };

    const moveBy = direction => {
      computeMetrics();
      currentIndex += direction;
      applyTransform(currentIndex, true);
      if (getDuration() === 0) {
        wrapIfNeeded();
      }
    };

    const handleResize = () => {
      computeMetrics();
      applyTransform(currentIndex, false);
      wrapIfNeeded();
    };

    track.addEventListener('transitionend', event => {
      if (event.target === track && event.propertyName === 'transform') {
        wrapIfNeeded();
      }
    });

    prevBtn?.addEventListener('click', () => moveBy(-1));
    nextBtn?.addEventListener('click', () => moveBy(1));

    computeMetrics();
    applyTransform(currentIndex, false);
    window.addEventListener('resize', handleResize);
  });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });

  /* Team photo fallbacks */
  teamMedia.forEach(media => {
    const img = media.querySelector('img');

    const activateFallback = () => {
      media.classList.add('is-fallback');
      if (img) {
        img.style.display = 'none';
        img.setAttribute('aria-hidden', 'true');
      }
    };

    if (!img) {
      activateFallback();
      return;
    }

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
