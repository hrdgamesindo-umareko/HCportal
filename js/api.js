// ============================================================
// API — semua pemanggilan ke Google Apps Script (JSON)
// ============================================================
const API = (() => {
  async function getJSON(params) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${CONFIG.GAS_URL}?${qs}`, { cache: 'no-store' });
    return res.json();
  }

  async function postJSON(body, opts = {}) {
    const res = await fetch(CONFIG.GAS_URL, {
      method: 'POST',
      // WAJIB text/plain agar tidak memicu CORS preflight yang diblok Apps Script
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      keepalive: !!opts.keepalive
    });
    return res.json();
  }

  return {
    list:             () => getJSON({ action: 'list' }),
    stats:            () => getJSON({ action: 'stats' }),
    logVisit:         (appId) => postJSON({ action: 'log', appId }, { keepalive: true }),
    uploadBackground: (payload) => postJSON({ action: 'uploadBackground', ...payload })
  };
})();
