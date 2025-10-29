import { notify, normalizePhone, validateRequired, clearError, postJSON } from '../utils/form.js';

export function initFeedbackForm(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const required = Array.from(form.querySelectorAll('[required]'));
  let busy = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;

    const submitter = e.submitter;
    const call_me = submitter?.dataset?.call === '1' ? 1 : 0;

    // валидация
    let firstBad = null;
    required.forEach(f => { if (!validateRequired(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.focus({ preventScroll:false }); firstBad.reportValidity(); return; }

    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const phone = normalizePhone(fd.get('phone') || '');
    const message = String(fd.get('message') || '').trim();

    if (!phone || phone.replace(/[^\d]/g,'').length < 10) {
      notify('Укажите корректный телефон');
      return;
    }

    busy = true; toggleButtons(true);
    try {
      const res = await postJSON('/api/submit_feedback', { name, phone, message, call_me });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json?.ok ?? true)) {
        notify('Заявка отправлена! Мы свяжемся в рабочее время.');
        form.reset(); required.forEach(clearError);
      } else {
        notify('Ошибка: ' + (json?.detail || res.statusText || 'unknown'));
      }
    } catch (err) {
      console.error(err); notify('Сетевая ошибка. Попробуйте ещё раз.');
    } finally {
      busy = false; toggleButtons(false);
    }
  });

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) {
      validateRequired(t);
    }
  });

  function toggleButtons(state) {
    form.querySelectorAll('button').forEach(b => b.disabled = state);
  }
}
