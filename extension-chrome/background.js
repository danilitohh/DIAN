// Coordina pestañas, estado y retorno del archivo descargado a la aplicación.
async function notify(message) {
  const { plan } = await chrome.storage.local.get('plan');
  if (!plan?.appOrigin) return;
  const tabs = await chrome.tabs.query({ url: `${plan.appOrigin}/*` });
  for (const tab of tabs) chrome.tabs.sendMessage(tab.id, message).catch(() => {});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DIAN_PAGE_STATUS') notify({ type: 'DIAN_STATUS', text: message.text });
  if (message.type === 'START_DIAN') {
    const plan = { year: String(message.year), token: message.token, appOrigin: message.appOrigin, active: true, stage: 'waiting_login' };
    chrome.storage.local.set({ plan }).then(async () => {
      await notify({ type: 'DIAN_STATUS', text: 'Extensión conectada. Ingresa tus credenciales en DIAN.' });
      chrome.tabs.create({ url: 'https://muisca.dian.gov.co/WebArquitectura/DefLogin.faces' });
    });
    sendResponse({ ok: true });
  }
  return true;
});

chrome.downloads.onChanged.addListener(async delta => {
  if (delta.state?.current !== 'complete') return;
  const { plan } = await chrome.storage.local.get('plan');
  if (!plan?.active) return;
  const [download] = await chrome.downloads.search({ id: delta.id });
  if (!download || !/dian\.gov\.co/i.test(download.finalUrl || download.url || '')) return;
  await notify({ type: 'DIAN_STATUS', text: 'Archivo descargado. Importándolo en la aplicación…' });
  try {
    let response = await fetch(download.finalUrl || download.url, { credentials: 'include' });
    if (!response.ok || /text\/html/i.test(response.headers.get('content-type') || '')) {
      const fileUrl = `file:///${download.filename.replace(/\\/g, '/')}`;
      response = await fetch(fileUrl);
    }
    if (!response.ok) throw new Error(`No se pudo leer la descarga (${response.status})`);
    const blob = await response.blob();
    const form = new FormData();
    const originalName = download.filename.split(/[\\/]/).pop() || '';
    const uploadName = /\.xlsx?$/i.test(originalName) ? originalName : `exogena_${plan.year}.xlsx`;
    form.append('file', blob, uploadName);
    const parsed = await fetch(`${plan.appOrigin}/api/parse`, { method: 'POST', headers: { Authorization: `Bearer ${plan.token}` }, body: form });
    const payload = await parsed.json();
    if (!parsed.ok) throw new Error(payload.error || 'No se pudo procesar el archivo');
    plan.active = false; plan.stage = 'complete'; await chrome.storage.local.set({ plan });
    await notify({ type: 'DIAN_PARSED', payload });
    await notify({ type: 'DIAN_STATUS', text: 'Exógena descargada y adjuntada correctamente.' });
  } catch (error) {
    await notify({ type: 'DIAN_STATUS', text: `La descarga terminó, pero no se pudo adjuntar: ${error.message}. Activa “Permitir acceso a URLs de archivo” en la extensión.` });
  }
});
