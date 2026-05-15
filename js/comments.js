/* ============================================================
   comments.js — Fitur Komentar Real (Google Sheets)
   
   CARA SETUP:
   1. Buka Google Sheets baru
   2. Extensions → Apps Script
   3. Paste kode Apps Script (ada di PANDUAN.md)
   4. Deploy sebagai Web App → Copy URL
   5. Ganti nilai APPS_SCRIPT_URL di bawah dengan URL tersebut
   ============================================================ */

// ⚠️ GANTI DENGAN URL APPS SCRIPT ANDA
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWyCG9vjx16UZtj-pm6zPA89Z-5MbzgbIPP1Y16d2PFvzaXtD1JhxOqoTJqWjeV7WKAQ/exec';

const COMMENTS_PER_PAGE = 10;
let allComments   = [];
let currentPage   = 1;

// ============================================================
// INIT — load komentar saat halaman siap
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  loadComments();
});

// ============================================================
// LOAD KOMENTAR dari Google Sheets
// ============================================================
async function loadComments() {
  const list = document.getElementById('commentList');
  if (!list) return;

  list.innerHTML = '<div class="cmt-loading"><i class="fa fa-spinner fa-spin"></i> Memuat ucapan...</div>';

  try {
    const res  = await fetch(APPS_SCRIPT_URL + '?action=get');
    const data = await res.json();

    if (data.status === 'ok') {
      // Urutkan: terbaru di atas
      allComments = data.comments.reverse();
      currentPage = 1;
      renderComments();
    } else {
      list.innerHTML = '<div class="cmt-loading">Gagal memuat ucapan. Coba refresh.</div>';
    }
  } catch (err) {
    console.error('Load comments error:', err);
    list.innerHTML = '<div class="cmt-loading">Gagal memuat ucapan. Periksa koneksi Anda.</div>';
  }
}

// ============================================================
// RENDER KOMENTAR dengan paginasi
// ============================================================
function renderComments() {
  const list       = document.getElementById('commentList');
  const pagination = document.getElementById('pagination');
  if (!list) return;

  if (allComments.length === 0) {
    list.innerHTML = '<div class="cmt-loading">Belum ada ucapan. Jadilah yang pertama! 🎉</div>';
    if (pagination) pagination.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(allComments.length / COMMENTS_PER_PAGE);
  const start      = (currentPage - 1) * COMMENTS_PER_PAGE;
  const end        = start + COMMENTS_PER_PAGE;
  const pageData   = allComments.slice(start, end);

  // Render cards
  list.innerHTML = pageData.map(c => createCommentCard(c)).join('');

  // Render pagination
  if (pagination) {
    let pages = '';
    // Prev
    if (currentPage > 1) {
      pages += `<button class="page-btn" onclick="goToPage(${currentPage - 1})"><i class="fa fa-chevron-left"></i></button>`;
    }
    // Nomor halaman (max 5 tombol)
    const range = getPageRange(currentPage, totalPages);
    range.forEach(p => {
      if (p === '...') {
        pages += `<span class="page-btn" style="cursor:default">…</span>`;
      } else {
        pages += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
      }
    });
    // Next
    if (currentPage < totalPages) {
      pages += `<button class="page-btn" onclick="goToPage(${currentPage + 1})"><i class="fa fa-chevron-right"></i></button>`;
    }
    pagination.innerHTML = pages;
  }
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
  return [1, '...', current-1, current, current+1, '...', total];
}

function goToPage(page) {
  currentPage = page;
  renderComments();
  document.getElementById('sect-komentar').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// BUAT CARD HTML
// ============================================================
function createCommentCard(c) {
  const hadir = c.hadir || 'Hadir';
  const kelas = hadir === 'Hadir' ? 'hadir' : hadir === 'Tidak Hadir' ? 'tidak' : 'mungkin';
  const pesan = escapeHtml(c.pesan || '');
  const nama  = escapeHtml(c.nama || 'Anonim');
  const tanggal = c.tanggal ? formatDate(c.tanggal) : '';

  return `
    <div class="cmt-card">
      <div class="cmt-header">
        <span class="cmt-name">${nama}</span>
        <span class="cmt-date">${tanggal}</span>
      </div>
      <span class="cmt-hadir ${kelas}">${hadir}</span>
      <p class="cmt-msg">${pesan}</p>
    </div>
  `;
}

// ============================================================
// SUBMIT KOMENTAR ke Google Sheets
// ============================================================
async function submitComment() {
  const nama   = document.getElementById('cmtNama').value.trim();
  const hadir  = document.getElementById('cmtHadir').value;
  const pesan  = document.getElementById('cmtPesan').value.trim();
  const status = document.getElementById('cmtStatus');
  const btn    = document.getElementById('btnKirim');

  // Validasi
  if (!nama) {
    showStatus('⚠️ Nama tidak boleh kosong.', 'error');
    document.getElementById('cmtNama').focus();
    return;
  }
  if (!pesan) {
    showStatus('⚠️ Pesan tidak boleh kosong.', 'error');
    document.getElementById('cmtPesan').focus();
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Mengirim...';
  showStatus('', '');

  try {
    const body = new URLSearchParams({
      action : 'post',
      nama   : nama,
      hadir  : hadir,
      pesan  : pesan,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    });

    const res  = await fetch(APPS_SCRIPT_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body   : body.toString()
    });

    const data = await res.json();

    if (data.status === 'ok') {
      showStatus('✅ Ucapan berhasil dikirim! Terima kasih 🎉', 'success');
      // Reset form
      document.getElementById('cmtNama').value  = '';
      document.getElementById('cmtPesan').value = '';
      document.getElementById('cmtHadir').value = 'Hadir';
      // Reload komentar
      await loadComments();
    } else {
      showStatus('❌ Gagal mengirim. Coba lagi.', 'error');
    }
  } catch (err) {
    console.error('Submit comment error:', err);
    showStatus('❌ Terjadi kesalahan. Cek koneksi Anda.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-paper-plane"></i> Kirim';
  }
}

// ============================================================
// HELPERS
// ============================================================
function showStatus(msg, type) {
  const el = document.getElementById('cmtStatus');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'cmt-status ' + type;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function formatDate(str) {
  // Format: dd/mm/yyyy atau ISO
  try {
    if (str.includes('/')) return str;
    const d = new Date(str);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return str; }
}