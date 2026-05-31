/* ============================================================
   generator.js — Generator Link + Pesan WA Undangan
   ============================================================ */

// ---- Fungsi buat pesan WA per tamu ----
function buildWAMessage(name, url) {
  return `💌 *UNDANGAN PERNIKAHAN* 💌
     بِسْــــــــــــــمِ اللهِ الرَّحْمَنِ الرَّحِيْـــــم
_Assalamu'alaikum Warahmatullahi Wabarakaatuh_ 🌿

🎊 Alhamdulillah! Segala puji bagi Allah Subhanahu Wa Ta'ala yang telah menciptakan makhluk-Nya berpasang-pasangan. 💞

Kepada Yth.
*${name}* 🌸

Dengan penuh kebahagiaan dan kerendahan hati, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk turut berbahagia bersama kami dalam acara Walimatul 'Urs:

💍 *Riswan Suhemy Batubara*
💕 *Arni Nabila*

📅 Ahad, 28 Juni 2026
🕘 Akad : 09.00 WIB | Resepsi : 10.00 WIB
📍 Kp. Cigaroggol RT 06 RW 02 Taman Buah Mekarsari, Cileungsi - Bogor

✨ Berikut tautan undangan digital kami:
${url}

Kehadiran serta doa restu Bapak/Ibu/Saudara/i adalah kehormatan dan kebahagiaan terbesar bagi kami. Semoga Allah Subhanahu Wa Ta'ala mempertemukan kita semua dalam suasana yang penuh keberkahan. 🤲

_Jazakumullahu Khairan wa Barakallahu Fiikum_ 🌺
_Wassalamu'alaikum Warahmatullahi Wabarakaatuh_ 💚

*Kami Yang Berbahagia,*
*Arni & Suhaimy* 🫶`;
}

// ---- Generate ----
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

  const base  = baseUrl.replace(/\/$/, '');
  const names = nameInput.split('\n').map(n => n.trim()).filter(n => n.length > 0);

  if (names.length === 0) {
    alert('⚠️ Tidak ada nama yang valid!');
    return;
  }

  const linkList = document.getElementById('linkList');
  linkList.innerHTML = names.map((name, i) => {
    const encoded = encodeURIComponent(name);
    const url     = `${base}/?to=${encoded}`;
    const msg     = buildWAMessage(name, url);
    const msgEsc  = escapeAttr(msg);

    return `
      <div class="link-item" id="item-${i}">
        <div class="link-item-header">
          <span class="link-name">🌸 ${escapeHtml(name)}</span>
          <div class="link-item-btns">
            <button class="btn-copy-wa"  onclick="copyWA(${i}, this)"  title="Salin pesan WA">
              <i class="fa fa-whatsapp fab"></i> Salin Pesan
            </button>
            <button class="btn-copy-url" onclick="copyURL(${i}, this)" title="Salin link saja">
              <i class="fa fa-link"></i> Link
            </button>
          </div>
        </div>

        <div class="link-url-row">
          <span class="link-url" id="url-${i}">${escapeHtml(url)}</span>
        </div>

        <!-- Preview pesan WA (collapsible) -->
        <div class="wa-preview-wrap" id="preview-${i}" style="display:none;">
          <pre class="wa-preview">${escapeHtml(msg)}</pre>
        </div>

        <button class="btn-toggle-preview" onclick="togglePreview(${i}, this)">
          <i class="fa fa-eye"></i> Lihat Preview Pesan
        </button>

        <!-- Simpan data untuk copyAll -->
        <textarea class="hidden-data" id="msg-${i}" style="display:none;">${msgEsc}</textarea>
      </div>
    `;
  }).join('');

  document.getElementById('resultSection').style.display = 'block';
  document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Salin pesan WA lengkap ----
function copyWA(i, btn) {
  const msg = document.getElementById('msg-' + i).value;
  navigator.clipboard.writeText(msg).then(() => {
    btn.innerHTML = '<i class="fa fa-check"></i> Tersalin!';
    btn.style.background = '#27ae60';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa fa-whatsapp fab"></i> Salin Pesan';
      btn.style.background = '';
    }, 2000);
  }).catch(() => fallbackCopy(msg, btn));
}

// ---- Salin link saja ----
function copyURL(i, btn) {
  const url = document.getElementById('url-' + i).textContent.trim();
  navigator.clipboard.writeText(url).then(() => {
    btn.innerHTML = '<i class="fa fa-check"></i> ✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="fa fa-link"></i> Link';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => fallbackCopy(url, btn));
}

// ---- Toggle preview pesan ----
function togglePreview(i, btn) {
  const wrap = document.getElementById('preview-' + i);
  const open = wrap.style.display !== 'none';
  wrap.style.display = open ? 'none' : 'block';
  btn.innerHTML = open
    ? '<i class="fa fa-eye"></i> Lihat Preview Pesan'
    : '<i class="fa fa-eye-slash"></i> Sembunyikan Preview';
}

// ---- Salin semua (format: nama + pesan WA, pisah per tamu) ----
function copyAll() {
  const baseUrl   = document.getElementById('baseUrl').value.trim().replace(/\/$/, '');
  const nameInput = document.getElementById('nameInput').value.trim();
  const names     = nameInput.split('\n').map(n => n.trim()).filter(n => n.length > 0);

  const text = names.map(name => {
    const url = `${baseUrl}/?to=${encodeURIComponent(name)}`;
    return buildWAMessage(name, url);
  }).join('\n\n' + '─'.repeat(40) + '\n\n');

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

// ---- Helpers ----
function fallbackCopy(text, btn) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity  = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  if (btn) {
    btn.innerHTML = '<i class="fa fa-check"></i> ✓';
    setTimeout(() => { btn.innerHTML = btn.innerHTML; }, 2000);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  // Untuk value textarea — tidak perlu escaping HTML, langsung isi
  return str;
}