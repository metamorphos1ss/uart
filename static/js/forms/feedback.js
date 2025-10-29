import { notify, normalizePhone, validateRequired, clearError, postJSON } from '../utils/form.js';


export function initFeedbackForm(formSelector, callBtnSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const callBtn = form.querySelector(callBtnSelector);
  const required = Array.from(form.querySelectorAll('[required]'));

  let clickOnCall = false;


  if (callBtn) {
    callBtn.addEventListener('click', () => {
      clickOnCall = true;
      form.requestSubmit();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let firstBad = null;
    required.forEach(f => { if (!validateRequired(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.focus({ preventScroll:false }); firstBad.reportValidity(); return; }

    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const phone = normalizePhone(fd.get('phone') || '');
    const message = String(fd.get('message') || '').trim();

    const call_me = !!clickOnCall

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
