# Portal Induk HCGA — Frontend

Frontend statis (HTML, CSS, JavaScript) untuk Portal Human Capital & General Affairs.
Dijalankan di GitHub Pages dan terhubung ke backend Google Apps Script lewat `js/config.js`.

## Isi folder

```
index.html        halaman utama portal
admin.html        halaman unggah background (khusus HCGA)
css/style.css     tampilan & animasi
js/config.js      URL Apps Script (WAJIB diisi)
js/api.js         pemanggilan ke Apps Script
js/app.js         logika halaman utama
js/admin.js       logika unggah background
```

## Langkah singkat

1. Isi `GAS_URL` di `js/config.js` dengan URL `/exec` dari Apps Script.
2. Ikuti panduan lengkap di `PANDUAN-INSTALASI-HCGA.md`.

Berkas backend (`Kode.gs`) tidak termasuk di sini. Berkas itu disalin ke Google Apps Script.
