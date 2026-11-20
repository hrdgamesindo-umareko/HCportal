// ============================================================
// ADMIN — unggah background portal (khusus HCGA)
// ============================================================
(function () {
  const MAX_BYTES = 2 * 1024 * 1024;
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

  const $ = (sel) => document.querySelector(sel);
  const form = $('#admin-form');
  const fileInput = $('#bg-file');
  const preview = $('#preview');
  const result = $('#result');
  const btn = $('#submit-btn');

  function setResult(msg, ok) {
    result.textContent = msg;
    result.className = 'result ' + (ok ? 'ok' : 'bad');
  }

  // Pratinjau gambar sebelum disimpan
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) { preview.hidden = true; return; }
    if (!ALLOWED.includes(file.type)) {
      setResult('Format harus JPG, PNG, atau WEBP.', false);
      fileInput.value = '';
      preview.hidden = true;
      return;
    }
    if (file.size > MAX_BYTES) {
      setResult('Ukuran gambar melebihi 2 MB. Perkecil dulu sebelum mengunggah.', false);
      fileInput.value = '';
      preview.hidden = true;
      return;
    }
    setResult('', true);
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  });

  // Baca berkas sebagai base64 (tanpa prefix data:)
  function readAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = $('#admin-key').value.trim();
    const file = fileInput.files[0];

    if (!key) return setResult('Masukkan kunci admin.', false);
    if (!file) return setResult('Pilih gambar terlebih dahulu.', false);

    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
    $('#loading').style.display = 'flex';

    try {
      const base64 = await readAsBase64(file);
      const res = await API.uploadBackground({ adminKey: key, mimeType: file.type, base64 });

      if (res.success) {
        setResult('Background berhasil diperbarui. Muat ulang portal untuk melihat hasilnya.', true);
        fileInput.value = '';
        preview.hidden = true;
      } else {
        setResult(res.message || 'Gagal menyimpan background.', false);
      }
    } catch (err) {
      console.error(err);
      setResult('Koneksi gagal. Periksa jaringan lalu coba lagi.', false);
    } finally {
      // Kunci tidak disimpan di mana pun; kosongkan dari kolom setelah selesai
      $('#admin-key').value = '';
      btn.disabled = false;
      btn.textContent = 'Simpan Background';
      $('#loading').style.display = 'none';
    }
  });
})();
