/* ============================================================
   generator.js — Generator Link Undangan
   ============================================================ */

function generateLinks() {
  const baseUrl   = document.getElementById('baseUrl').value.trim();
  const nameInput = document.getElementById('nameInput').value.trim();

  if (!baseUrl) {
    alert('⚠️ Isi Base URL terlebih dahulu!');
    document.getElementById('baseUrl').focus();
    return;
  }

  if (!nameInput) {
    alert('⚠️ Isi minimal satu nama tamu!');
    document.getElementById('nameInput').focus();
    return;
  }

  // Bersihkan trailing slash
  const base = baseUrl.replace(/\/$/, '');

  // Parse nama (satu per baris, abaikan baris kosong)
  const names = nameInput
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);

  if (names.length === 0) {
    alert('⚠️ Tidak ada nama yang valid!');
    return;
  }

  // Generate link
  const linkList = document.getElementById('linkList');
  linkList.innerHTML = names.map((name, i) => {
    const encoded = encodeURIComponent(name);
    const url     = `${base}/?to=${encoded}`;
    return `
      <div class="link-item">
        <span class="link-name">${escapeHtml(name)}</span>
        <span class="link-url" id="link-${i}">${url}</span>
        <button class="btn-copy-single" onclick="copySingle(${i}, '${escapeJs(url)}', this)">
          <i class="fa fa-copy"></i> Salin
        </button>
      </div>
    `;
  }).join('');

  document.getElementById('resultSection').style.display = 'block';
  document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copySingle(index, url, btn) {
  navigator.clipboard.writeText(url).then(() => {
    btn.innerHTML   = '<i class="fa fa-check"></i> ✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="fa fa-copy"></i> Salin';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback untuk browser lama
    const el = document.getElementById('link-' + index);
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    btn.innerHTML = '<i class="fa fa-check"></i> ✓';
    setTimeout(() => { btn.innerHTML = '<i class="fa fa-copy"></i> Salin'; }, 2000);
  });
}

function copyAll() {
  const baseUrl   = document.getElementById('baseUrl').value.trim().replace(/\/$/, '');
  const nameInput = document.getElementById('nameInput').value.trim();
  const names     = nameInput.split('\n').map(n => n.trim()).filter(n => n.length > 0);

  const text = names.map(name => {
    return `${name}\n${baseUrl}/?to=${encodeURIComponent(name)}`;
  }).join('\n\n');

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy-all');
    btn.innerHTML = '<i class="fa fa-check"></i> Tersalin Semua!';
    btn.style.background = '#27ae60';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa fa-copy"></i> Salin Semua';
      btn.style.background = '';
    }, 2500);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeJs(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Auto-detect base URL dari lokasi generator dinonaktifkan
// agar selalu menggunakan default Netlify URL.
// window.addEventListener('DOMContentLoaded', function () {
//   const current = window.location.href;
//   const base = current.replace(/\/generator\.html.*$/, '');
//   if (base && base.startsWith('http')) {
//     document.getElementById('baseUrl').value = base;
//   }
// });