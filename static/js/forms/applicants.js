import { notify, normalizePhone, validateRequired, clearError, postMultipart } from '../utils/form.js';

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export function initApplicantsForm(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const required = Array.from(form.querySelectorAll('[required]'));
  let busy = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;

    const submitter = e.submitter;
    const call_me = submitter?.dataset?.call === '1';

    let firstBad = null;
    required.forEach(f => { if (!validateRequired(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.focus({ preventScroll:false }); firstBad.reportValidity(); return; }

    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const phone = normalizePhone(fd.get('phone') || '');
    const message = String(fd.get('message') || '').trim();
    const file = fd.get('resume');

    if (!phone || phone.replace(/[^\d]/g,'').length < 10) return notify('Укажите корректный телефон');
    if (!(file instanceof File)) return notify('Прикрепите PDF-файл');
    if (file.type && file.type !== 'application/pdf') return notify('Файл должен быть PDF');
    if (file.size > MAX_BYTES) return notify(`Файл больше ${MAX_MB} МБ`);

    fd.set('name', name);
    fd.set('phone', phone);
    fd.set('message', message);
    fd.set('call_me', call_me ? 1 : 0);

    busy = true; toggleButtons(true);
    try {
      const res = await postMultipart('/api/submit_applicants', fd);
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json?.ok ?? true)) {
        notify('Анкета отправлена! Свяжемся в рабочее время.');
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
