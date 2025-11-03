import { notify, normalizePhone, validateRequired, clearError, postJSON } from '../utils/form.js';


export function initFeedbackForm(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const required = Array.from(form.querySelectorAll('[required]'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let firstBad = null;
    required.forEach(f => { if (!validateRequired(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.focus({ preventScroll:false }); firstBad.reportValidity(); return; }

    const fd = new FormData(form, e.submitter);
    const name = String(fd.get('name') || '').trim();
    const phone = normalizePhone(fd.get('phone') || '');
    const message = String(fd.get('message') || '').trim();
    const call_me = fd.get('call_me') === '1';

    if (!phone || phone.replace(/[^\d]/g,'').length < 10) {
      notify('Укажите корретный телефон')
      clickOnCall = true;
      return;
    }

    try {
      const res = await postJSON('/api/submit_feedback', { name, phone, message, call_me });
      const json = await res.json().catch(() => ({}));

      if (res.ok && (json?.ok ?? true)) {
        notify('Заявка отправлена! Мы свяжемся в рабочее время.');
        form.reset(); 
        required.forEach(clearError);
      } else {
        notify('Ошибка: ' + (json?.detail || res.statusText || 'unknown'));
      }
    } catch (err) {
      console.error(err); notify('Сетевая ошибка. Попробуйте ещё раз.');
    } finally {
      clickOnCall = false;
    }
  });

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) {
      validateRequired(t);
    }
  });
}
