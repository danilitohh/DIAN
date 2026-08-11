// Puente seguro entre la aplicación web y el service worker de la extensión.
document.documentElement.dataset.dianExtension = '1';

window.addEventListener('EXOGENA_START', event => {
  const detail = event.detail || {};
  chrome.runtime.sendMessage({ type: 'START_DIAN', year: detail.year, token: detail.token, appOrigin: location.origin });
});

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'DIAN_STATUS') window.dispatchEvent(new CustomEvent('EXOGENA_STATUS', { detail: message }));
  if (message.type === 'DIAN_PARSED') window.dispatchEvent(new CustomEvent('EXOGENA_PARSED', { detail: message.payload }));
});
