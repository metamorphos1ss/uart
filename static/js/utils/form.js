export const notify = (msg) => { try { alert(msg); } catch { console.log(msg); } };

export const normalizePhone = (v) => {
  const t = String(v || '').trim();
  const plus = t.startsWith('+');
  const digits = t.replace(/[^\d]/g, '');
  return plus ? ('+' + digits) : digits;
};

export const validateRequired = (field) => {
  const value = (field.value ?? '').trim();
  let message = '';
  if (!value) message = 'Заполните поле';
  else if (field.type === 'tel') {
    const digits = value.replace(/\D/g,'');
    if (digits.length < 10) message = 'Введите номер телефона полностью';
  }
  if (message) {
    setError(field, message);
    return false;
  }
  clearError(field);
  return true;
};

export const setError = (field, message) => {
  const wrap = field.closest('.field');
  wrap?.classList.add('field--error');
  field.setAttribute('aria-invalid', 'true');
  field.setCustomValidity(message);
};

export const clearError = (field) => {
  const wrap = field.closest('.field');
  wrap?.classList.remove('field--error');
  field.removeAttribute('aria-invalid');
  field.setCustomValidity('');
};

export const postJSON = (url, payload) =>
  fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload),
  });

export const postMultipart = (url, formData) =>
  fetch(url, { method: 'POST', body: formData });
