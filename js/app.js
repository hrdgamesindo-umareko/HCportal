// ============================================================
// APP — logika halaman utama Portal Induk HCGA
// ============================================================
(function () {
  const state = { units: [], apps: {} };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const $ = (sel) => document.querySelector(sel);
  const grid = $('#units-grid');
  const search = $('#search');

  // Escape teks dari sheet agar tidak disisipkan sebagai HTML
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function notif(message, type = 'success') {
    const el = $('#notif');
    el.textContent = message;
    el.className = `notif notif-${type} show`;
    clearTimeout(notif._t);
    notif._t = setTimeout(() => el.classList.remove('show'), 3200);
  }

  function setLoading(on) {
    $('#loading').style.display = on ? 'flex' : 'none';
  }

  // ---------- Background ----------
  function applyBackground(url) {
    if (!url) return;
    // URL dari server (Drive HCGA); tanda kutip di-encode agar aman di dalam url()
    $('#bg-layer').style.backgroundImage = `url("${url.replace(/"/g, '%22')}")`;
  }

  // ---------- Render unit & aplikasi ----------
  function renderUnits(filter = '') {
    const q = filter.trim().toLowerCase();
    grid.innerHTML = '';
    let shown = 0;

    state.units.forEach((u, idx) => {
      const apps = u.apps.filter(a =>
        !q || a.nama.toLowerCase().includes(q) || u.unit.toLowerCase().includes(q)
      );
      if (!apps.length) return;
      shown++;

      const card = document.createElement('article');
      card.className = 'unit-card reveal';
      card.style.setProperty('--d', `${Math.min(idx * 90, 540)}ms`);
      card.innerHTML = `
        <button class="unit-head" aria-expanded="false">
          <span class="unit-name">${esc(u.unit)}</span>
          <span class="unit-count">${apps.length} aplikasi</span>
        </button>
        <div class="unit-body" hidden>
          <div class="app-grid">
            ${apps.map(a => `
              <div class="app-card">
                <h3>${esc(a.nama)}</h3>
                <p>${esc(a.petunjuk)}</p>
                <button class="btn-open" data-id="${esc(a.id)}">Buka Aplikasi</button>
              </div>`).join('')}
          </div>
        </div>`;
      grid.appendChild(card);
    });

    $('#empty').hidden = shown > 0;
    observeReveal();
  }

  // Animasi muncul saat digulir (sekali saja per kartu)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });

  function observeReveal() {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
  }

  // ---------- Statistik ----------
  async function loadStats() {
    try {
      const s = await API.stats();
      if (!s.success) return;
      $('#stat-today').textContent = s.todayTotal;

      const rows = Object.keys(s.todayPerApp).map(id => ({
        nama: state.apps[id] ? state.apps[id].nama : (id === 'PORTAL' ? 'Halaman Portal' : id),
        n: s.todayPerApp[id]
      })).sort((a, b) => b.n - a.n);

      $('#stat-list').innerHTML = rows.length
        ? rows.map(r => `<li><span>${esc(r.nama)}</span><strong>${r.n}</strong></li>`).join('')
        : '<li><span>Belum ada kunjungan hari ini.</span></li>';
    } catch (err) {
      // Statistik bersifat pelengkap; kegagalannya tidak perlu mengganggu halaman
      console.warn('Statistik gagal dimuat', err);
    }
  }

  // ---------- Interaksi: buka/tutup kartu & buka aplikasi ----------
  grid.addEventListener('click', (e) => {
    const head = e.target.closest('.unit-head');
    if (head) {
      const card = head.parentElement;
      const body = card.querySelector('.unit-body');
      const willOpen = body.hidden;

      // Tutup semua kartu lain, supaya satu unit terbuka dalam satu waktu
      grid.querySelectorAll('.unit-card').forEach(c => {
        c.classList.remove('open');
        c.querySelector('.unit-body').hidden = true;
        c.querySelector('.unit-head').setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        card.classList.add('open');
        body.hidden = false;
        head.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    const btn = e.target.closest('.btn-open');
    if (btn) {
      const app = state.apps[btn.dataset.id];
      if (!app) return;
      API.logVisit(app.id).catch(() => {});
      window.open(app.url, '_blank', 'noopener');
    }
  });

  search.addEventListener('input', () => renderUnits(search.value));

  // ---------- Efek 3D: kartu miring mengikuti kursor ----------
  if (!reduceMotion && !isTouch) {
    grid.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.unit-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
    });

    grid.addEventListener('pointerout', (e) => {
      const card = e.target.closest('.unit-card');
      if (card && !card.contains(e.relatedTarget)) {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      }
    });

    // ---------- Parallax judul mengikuti kursor ----------
    const hero = document.querySelector('.hero');
    const heroInner = $('#hero-inner');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroInner.style.setProperty('--hx', (x * 22).toFixed(1) + 'px');
      heroInner.style.setProperty('--hy', (y * 14).toFixed(1) + 'px');
    });
  }

  // ---------- Init ----------
  async function init() {
    setLoading(true);
    try {
      const data = await API.list();
      if (!data.success) throw new Error(data.message || 'Gagal memuat');

      state.units = data.units;
      state.apps = {};
      data.units.forEach(u => u.apps.forEach(a => {
        state.apps[a.id] = { ...a, unit: u.unit };
      }));

      applyBackground(data.background);
      renderUnits();
    } catch (err) {
      console.error(err);
      notif('Gagal memuat aplikasi. Silakan muat ulang halaman.', 'error');
    } finally {
      setLoading(false);
    }

    API.logVisit('PORTAL').catch(() => {});
    loadStats();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
