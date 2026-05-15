# 📖 PANDUAN LENGKAP — Website Undangan Suhaimy & Arni

---

## 📁 Struktur File

```
wedding-suhaimy/
├── index.html          ← Halaman cover (nama tamu dinamis)
├── home.html           ← Homepage undangan lengkap
├── generator.html      ← Generator link undangan
├── assets/
│   └── nasyid.mp3      ← ⚠️ FILE AUDIO (baca bagian Audio di bawah)
├── css/
│   ├── style.css       ← Style shared + cover
│   ├── home.css        ← Style homepage
│   └── generator.css   ← Style generator
├── js/
│   ├── main.js         ← Logic cover page
│   ├── home.js         ← Logic homepage
│   ├── comments.js     ← Fitur komentar Google Sheets
│   └── generator.js    ← Logic generator
└── PANDUAN.md          ← File ini
```

---

## 🔊 SETUP AUDIO NASYID

Website menggunakan file MP3 lokal karena YouTube tidak bisa di-embed langsung sebagai audio background.

### Langkah-langkah:

1. **Download audio dari YouTube** menggunakan salah satu tool:
   - https://yt1s.com
   - https://ytmp3.cc
   - URL: https://youtu.be/pBa-9GJ-IXg

2. **Rename file** menjadi `nasyid.mp3`

3. **Letakkan di folder** `assets/nasyid.mp3`
   (buat folder `assets` di dalam `wedding-suhaimy/`)

4. Audio akan otomatis play saat user pertama kali menyentuh/klik layar

> **Catatan:** Browser modern memblokir autoplay audio. Audio baru akan play setelah ada interaksi user (klik tombol Buka Undangan, atau klik/tap di halaman home). Ini sudah ditangani di `home.js`.

---

## 🗺️ SETUP LINK MAPS

Di `home.html`, ada dua tombol lokasi (Akad Nikah & Resepsi). Ganti URL Maps-nya:

1. Buka **Google Maps** di browser
2. Cari lokasi: **Masjid Jami' Al-Hikmah, Cileungsi, Bogor**
3. Klik **Share → Copy Link**
4. Buka `home.html`, cari teks `YourAkadMapLink` dan `YourResepsiMapLink`
5. Ganti dengan link Google Maps yang sudah disalin

Contoh:
```html
<a class="btn-maps" href="https://maps.app.goo.gl/AbCdEfGhIjKlMnOp" target="_blank">
```

---

## 💬 SETUP FITUR KOMENTAR (Google Sheets)

Fitur komentar menggunakan Google Apps Script sebagai backend gratis.

### Langkah 1 — Buat Google Spreadsheet

1. Buka https://sheets.google.com
2. Buat spreadsheet baru, beri nama: `Ucapan Pernikahan Suhaimy`
3. Di **Sheet1**, buat header di baris pertama:
   ```
   A1: Tanggal    B1: Nama    C1: Kehadiran    D1: Pesan
   ```
4. **Salin ID Spreadsheet** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_ADA_DI_SINI/edit
   ```

### Langkah 2 — Buat Apps Script

1. Di spreadsheet, klik **Extensions → Apps Script**
2. Hapus kode yang ada, ganti dengan kode berikut:

```javascript
// ============================================================
// Google Apps Script — Backend Komentar Undangan
// ============================================================

const SHEET_NAME = 'Sheet1';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'get') {
    return getComments();
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  
  if (action === 'post') {
    return saveComment(e.parameter);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getComments() {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data  = sheet.getDataRange().getValues();
    
    // Skip header row (baris pertama)
    const comments = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1]) { // Pastikan ada nama
        comments.push({
          tanggal : row[0] || '',
          nama    : row[1] || '',
          hadir   : row[2] || 'Hadir',
          pesan   : row[3] || ''
        });
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', comments: comments }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveComment(params) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Sanitasi input
    const tanggal = params.tanggal || new Date().toLocaleDateString('id-ID');
    const nama    = (params.nama   || '').substring(0, 100);
    const hadir   = (params.hadir  || 'Hadir').substring(0, 20);
    const pesan   = (params.pesan  || '').substring(0, 500);
    
    if (!nama || !pesan) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Nama dan pesan wajib diisi' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    sheet.appendRow([tanggal, nama, hadir, pesan]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Komentar berhasil disimpan' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Langkah 3 — Deploy Apps Script

1. Klik **Deploy → New Deployment**
2. Pilih type: **Web App**
3. Isi konfigurasi:
   - Description: `Ucapan Pernikahan`
   - Execute as: **Me**
   - Who has access: **Anyone** ← PENTING!
4. Klik **Deploy**
5. **Klik "Authorize access"** dan ikuti proses izin
6. **Salin URL** yang muncul (bentuknya seperti):
   ```
   https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec
   ```

### Langkah 4 — Pasang URL di Website

Buka `js/comments.js`, ganti baris:
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/GANTI_DENGAN_URL_ANDA/exec';
```
Dengan URL yang disalin tadi.

### Langkah 5 — Test

1. Buka website
2. Isi form ucapan dan klik Kirim
3. Cek Google Spreadsheet — data baru harus muncul di baris bawah

> **Troubleshooting:** Jika komentar tidak tersimpan, pastikan Apps Script sudah di-deploy dengan akses "Anyone". Jika perlu re-deploy setelah ada perubahan kode, buat deployment baru (bukan edit yang lama).

---

## 🌐 HOSTING DI GITHUB PAGES

### Langkah 1 — Buat Repository

1. Buka https://github.com dan login
2. Klik **New Repository**
3. Nama repo: `wedding-suhaimy` (bebas)
4. Visibility: **Public**
5. Klik **Create repository**

### Langkah 2 — Upload Files

**Cara A — Via Web (mudah):**
1. Di halaman repo, klik **uploading an existing file**
2. Drag & drop seluruh folder `wedding-suhaimy`
3. Commit changes

**Cara B — Via Git (recommended):**
```bash
# Di terminal, masuk ke folder project
cd wedding-suhaimy

# Init git
git init
git add .
git commit -m "Initial wedding website"

# Hubungkan ke GitHub
git remote add origin https://github.com/USERNAME/wedding-suhaimy.git
git branch -M main
git push -u origin main
```

### Langkah 3 — Aktifkan GitHub Pages

1. Di repo GitHub, klik **Settings**
2. Di sidebar kiri, klik **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** → folder: **/ (root)**
5. Klik **Save**
6. Tunggu ~1-2 menit, URL akan muncul:
   ```
   https://USERNAME.github.io/wedding-suhaimy/
   ```

### Cara Kerja Nama Tamu di GitHub Pages

Link undangan akan berbentuk:
```
https://USERNAME.github.io/wedding-suhaimy/?to=Nama+Tamu
```

Saat dibuka, `main.js` akan baca parameter `?to=` dan tampilkan nama di halaman cover. **Ini sudah berjalan otomatis** tanpa konfigurasi tambahan.

---

## 🌐 HOSTING DI NETLIFY

### Cara A — Drag & Drop (Termudah)

1. Buka https://netlify.com dan login/daftar
2. Di dashboard, cari **"Drag and drop your site folder here"**
3. Drag folder `wedding-suhaimy` ke area tersebut
4. Netlify otomatis deploy dan beri URL seperti:
   ```
   https://random-name-12345.netlify.app
   ```

### Cara B — Via GitHub

1. Push code ke GitHub (ikuti langkah GitHub di atas)
2. Di Netlify, klik **Add new site → Import an existing project**
3. Pilih **GitHub** dan authorize
4. Pilih repo `wedding-suhaimy`
5. Build settings: kosongkan semua (static site)
6. Klik **Deploy site**

### Custom Domain di Netlify (Opsional)

1. Beli domain (misal: `pernikahansuhaimy.com`) di Niagahoster/Rumahweb
2. Di Netlify → **Domain settings → Add custom domain**
3. Ikuti instruksi pointing DNS

### Cara Kerja Nama Tamu di Netlify

Sama persis dengan GitHub Pages — URL berbentuk:
```
https://pernikahansuhaimy.netlify.app/?to=Nama+Tamu
```

Tidak perlu konfigurasi server tambahan karena nama tamu dibaca dari URL parameter di browser (client-side JavaScript).

---

## 📲 CARA KIRIM UNDANGAN VIA WHATSAPP

### Langkah 1 — Buka Generator

Akses: `https://USERNAME.github.io/wedding-suhaimy/generator.html`

### Langkah 2 — Generate Link

1. Isi Base URL dengan URL website undangan Anda
2. Masukkan nama-nama tamu (satu per baris)
3. Klik "Generate Undangan"
4. Salin link per tamu

### Langkah 3 — Kirim via WhatsApp

Template pesan WhatsApp:
```
Assalamu'alaikum Bapak/Ibu/Saudara/i [Nama Tamu] 🌿

Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.

Silakan buka link undangan digital berikut:
[paste link undangan di sini]

Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir. 🤍

Wassalamu'alaikum Warahmatullahi Wabarakatuh
Arni & Suhaimy
```

---

## 🖼️ MENGGANTI FOTO & ASET

### Foto Mempelai
Di `home.html`, cari bagian mempelai:
```html
<img src="https://via.placeholder.com/120x120/c8a96e/ffffff?text=Arni" class="mempelai-photo" alt="Arni" />
```
Ganti `src` dengan path foto lokal:
```html
<img src="assets/foto-arni.jpg" class="mempelai-photo" alt="Arni" />
```
Letakkan foto di folder `assets/`.

### Foto Bunga/Ornamen
Di `home.html` dan `index.html`, cari:
```html
<img class="flower-tl" src="https://pngimg.com/uploads/rose/rose_PNG66.png" alt="" />
```
Ganti dengan aset bunga PNG transparan milik sendiri:
```html
<img class="flower-tl" src="assets/bunga-kiri.png" alt="" />
```

### Rekomendasi Sumber Bunga PNG Transparan Gratis
- https://pngimg.com (search: white flower, jasmine, roses)
- https://freepng.es
- https://www.freepnglogos.com
- https://pngtree.com/free-png-vectors/flower

---

## ⚙️ KONFIGURASI LAINNYA

### Ganti Tanggal Acara
Di `js/home.js`, baris:
```javascript
const eventDate = new Date('2026-04-28T09:00:00+07:00');
```
Ganti sesuai tanggal dan jam acara yang benar.

### Ganti Nomor Rekening
Di `home.html`, cari:
```html
<p class="gift-norek" id="noRek">7216449813</p>
```
Ganti nomornya.

### Ganti Link Maps
Di `home.html`, cari `YourAkadMapLink` dan `YourResepsiMapLink`, ganti dengan link Google Maps lokasi sebenarnya.

---

## ❓ FAQ

**Q: Kenapa nama tamu tidak muncul?**
A: Pastikan URL menggunakan format `?to=NamaTamu`. Spasi di nama diganti `+` atau `%20`.

**Q: Audio tidak bunyi otomatis?**
A: Normal. Browser modern blokir autoplay. Audio baru aktif setelah user tap/klik layar. Sudah ditangani otomatis di kode.

**Q: Komentar tidak tersimpan ke Google Sheets?**
A: Pastikan: (1) Apps Script sudah di-deploy dengan akses "Anyone", (2) URL di `comments.js` sudah benar, (3) Coba buka URL Apps Script langsung di browser — harus tampil JSON.

**Q: Website tidak mobile-only saat dibuka di desktop?**
A: Sudah dikonfigurasi di CSS dengan `max-width: 390px`. Akan tampak seperti tampilan ponsel di tengah layar desktop dengan background gelap di kiri-kanan.

**Q: Bagaimana update website setelah di-hosting?**
A: Di GitHub: edit file → commit. Di Netlify via GitHub: otomatis update saat push. Di Netlify drag-drop: upload folder lagi.

---

*Design & Web — dibuat dengan ❤️*