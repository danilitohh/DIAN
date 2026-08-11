// Máquina de estados tolerante a cambios menores en los textos del portal DIAN.
const normalize = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const visible = element => element && element.getClientRects().length > 0;
const candidates = () => [...document.querySelectorAll('a,button,input[type="button"],input[type="submit"],span')].filter(visible);
const byText = regex => candidates().find(element => regex.test(normalize(element.innerText || element.value || element.textContent)));
const click = element => { if (!element) return false; element.click(); return true; };

async function update(plan, stage, text) {
  plan.stage = stage; await chrome.storage.local.set({ plan });
  chrome.runtime.sendMessage({ type: 'DIAN_PAGE_STATUS', text }).catch(() => {});
}

async function tick() {
  const stored = await chrome.storage.local.get('plan'); const plan = stored.plan;
  if (!plan?.active) return;
  const body = normalize(document.body?.innerText);

  if (plan.stage === 'waiting_login' && (/webdashboard|defdashboard/i.test(location.href) || body.includes('mis actividades'))) {
    await update(plan, 'dashboard', 'Sesión iniciada. Abriendo información exógena…');
  }
  if (plan.stage === 'dashboard') {
    const link = byText(/informacion reportada por terceros|consultar informacion exogena/);
    if (link) { await update(plan, 'opening_service', 'Abriendo consulta de exógena…'); click(link.closest('a,button') || link); return; }
  }
  if (['opening_service','accepting'].includes(plan.stage)) {
    const accept = byText(/^aceptar$|acepto las condiciones/);
    if (accept) { await update(plan, 'selecting_year', 'Condiciones aceptadas. Seleccionando año…'); click(accept.closest('a,button') || accept); return; }
    if ([...document.querySelectorAll('select option')].some(o => o.textContent.trim() === plan.year)) plan.stage = 'selecting_year';
  }
  if (plan.stage === 'selecting_year') {
    const select = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.textContent.trim() === plan.year || o.value === plan.year));
    if (select) {
      const option = [...select.options].find(o => o.textContent.trim() === plan.year || o.value === plan.year);
      select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true }));
      await update(plan, 'consulting', `Año ${plan.year} seleccionado. Consultando…`);
    }
  }
  if (plan.stage === 'consulting') {
    const consult = byText(/^consultar$|generar archivo/);
    if (consult) { await update(plan, 'waiting_result', 'Consulta enviada. Esperando resultado…'); click(consult.closest('a,button') || consult); return; }
  }
  if (plan.stage === 'waiting_result') {
    const download = byText(/descargar|guardar|excel/);
    if (download) { await update(plan, 'downloading', 'Descargando Excel…'); click(download.closest('a,button') || download); }
  }
}

setInterval(() => tick().catch(() => {}), 1200);
