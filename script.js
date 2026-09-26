const button = document.querySelector('.copy-button');
const methods = document.querySelector('.install-methods');
let resetCopy;

function clearCopyFeedback() {
  window.clearTimeout(resetCopy);
  button.querySelector('span').textContent = 'COPY';
  button.classList.remove('is-copied');
  document.querySelector('.copy-status').textContent = '';
  document.querySelector('.copy-status').classList.remove('is-error');
}

if (button && methods) {
  methods.hidden = false;
  methods.addEventListener('click', event => {
    const method = event.target.closest('button[data-command]');
    if (!method || !methods.contains(method)) return;
    clearCopyFeedback();
    for (const option of methods.querySelectorAll('button')) {
      option.setAttribute('aria-pressed', String(option === method));
    }
    document.querySelector('#install-code').textContent = method.dataset.command;
    button.dataset.copy = method.dataset.command;
    button.setAttribute('aria-label', `Copy ${method.dataset.method} install command`);
  });
}

if (button) {
  button.addEventListener('click', async () => {
    const text = button.dataset.copy;
    const status = document.querySelector('.copy-status');
    clearCopyFeedback();

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const previousFocus = document.activeElement;
      const field = document.createElement('textarea');
      let copied = false;
      try {
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      } finally {
        field.remove();
        previousFocus?.focus();
      }
      if (!copied) {
        status.textContent = 'Copy failed. Select the command and copy it manually.';
        status.classList.add('is-error');
        button.querySelector('span').textContent = 'RETRY';
        return;
      }
    }

    // A method may have changed while the clipboard permission dialog was open.
    if (button.dataset.copy !== text) return;
    button.querySelector('span').textContent = 'COPIED';
    button.classList.add('is-copied');
    status.textContent = 'Install command copied.';

    resetCopy = window.setTimeout(clearCopyFeedback, 1800);
  });
}
