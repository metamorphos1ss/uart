import { notify, normalizePhone, validateRequired, clearError, postMultipart } from '../utils/form.js';

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export function initApplicantsForm(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const required = Array.from(form.querySelectorAll('[required]'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let firstBad = null;
    required.forEach((field) => {
      if (!validateRequired(field) && !firstBad) firstBad = field;
    });
    if (firstBad) {
      firstBad.focus({ preventScroll: false });
      firstBad.reportValidity();
      return;
    }

    const fd = new FormData(form, e.submitter);
    const name = String(fd.get('name') || '').trim();
    const phone = normalizePhone(fd.get('phone') || '');
    const message = String(fd.get('message') || '').trim();
    const file = fd.get('resume');

    if (!phone || phone.replace(/[^\d]/g, '').length < 10) {
      notify('Пожалуйста, укажите корректный номер телефона');
      return;
    }

    if (!(file instanceof File)) {
      notify('Пожалуйста, приложите файл резюме (PDF или DOCX).');
      return;
    }
    if (
      file.type &&
      file.type !== 'application/pdf' &&
      file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      notify('Поддерживаются только файлы PDF или DOCX.');
      return;
    }
    if (file.size > MAX_BYTES) {
      notify(`Размер файла не должен превышать ${MAX_MB} МБ.`);
      return;
    }

    fd.set('name', name);
    fd.set('phone', phone);
    fd.set('message', message);

    try {
      const res = await postMultipart('/api/submit_applicants', fd);
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json?.ok ?? true)) {
        notify('Резюме отправлено! Мы свяжемся с вами, если появится подходящая роль.');
        form.reset();
        required.forEach(clearError);
      } else {
        notify('Ошибка: ' + (json?.detail || res.statusText || 'unknown'));
      }
    } catch (err) {
      console.error(err);
      notify('Произошла ошибка сети. Попробуйте ещё раз.');
    }
  });

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      t instanceof HTMLSelectElement
    ) {
      validateRequired(t);
    }
  });
}
