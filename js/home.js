/* ============================================================
   home.js — Homepage Logic
   - AOS init
   - Countdown dinamis
   - Daun berguguran (canvas)
   - Audio toggle (nasyid)
   - Bottom nav active section
   - Copy no rek
   ============================================================ */

// ============================================================
// 1. AOS INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
  });

  initLeaves();
  initCountdown();
  initAudio();
  initBottomNav();
  showGuestGreeting();
});

// ============================================================
// 2. NAMA TAMU — tampilkan di title / greeting jika perlu
// ============================================================
function showGuestGreeting() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('to');
  if (name) {
    document.title = `Undangan untuk ${decodeURIComponent(name)} – Suhaimy & Arni`;
  }
}

// ============================================================
// 3. COUNTDOWN DINAMIS
// ============================================================
function initCountdown() {
  // Tanggal acara: 28 Juni 2026, 09:00 WIB (UTC+7)
const eventDate = new Date('2026-06-28T09:00:00+07:00');

  function update() {
    const now  = new Date();
    const diff = eventDate - now;

    if (diff <= 0) {
      // Acara sudah berlangsung
      document.getElementById('cd-hari').textContent   = '00';
      document.getElementById('cd-jam').textContent    = '00';
      document.getElementById('cd-menit').textContent  = '00';
      document.getElementById('cd-detik').textContent  = '00';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-hari').textContent   = String(days).padStart(2, '0');
    document.getElementById('cd-jam').textContent    = String(hours).padStart(2, '0');
    document.getElementById('cd-menit').textContent  = String(minutes).padStart(2, '0');
    document.getElementById('cd-detik').textContent  = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ============================================================
// 4. AUDIO TOGGLE
// ============================================================
let audioPlaying = false;

function initAudio() {
  const audio = document.getElementById('bgMusic');
  const icon  = document.getElementById('audioIcon');
  const ctrl  = document.getElementById('audioControl');

  if (!audio) return;

  const tryPlay = () => {
    audio.play().then(() => {
      audioPlaying = true;
      icon.className = 'fa fa-music';
      ctrl.classList.remove('muted');
      // spin animation
      ctrl.style.animation = 'spin 4s linear infinite';
      
      // Hapus event listener jika sudah berhasil play
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
    }).catch(() => {
      // Autoplay diblokir browser, tunggu interaksi user
      console.log("Autoplay blocked. Waiting for interaction...");
    });
  };

  // Coba jalankan audio langsung saat load
  tryPlay();

  // Fallback jika diblokir
  document.addEventListener('click', tryPlay);
  document.addEventListener('touchstart', tryPlay);
}

function toggleAudio() {
  const audio = document.getElementById('bgMusic');
  const icon  = document.getElementById('audioIcon');
  const ctrl  = document.getElementById('audioControl');
  if (!audio) return;

  if (audioPlaying) {
    audio.pause();
    audioPlaying = false;
    icon.className = 'fa fa-volume-xmark';
    ctrl.classList.add('muted');
    ctrl.style.animation = 'none';
  } else {
    audio.play();
    audioPlaying = true;
    icon.className = 'fa fa-music';
    ctrl.classList.remove('muted');
    ctrl.style.animation = 'spin 4s linear infinite';
  }
}

// ============================================================
// 5. BOTTOM NAV — highlight section aktif saat scroll
// ============================================================
function initBottomNav() {
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-item');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === id) {
              item.classList.add('active');
            }
          });
        }
      });
    },
    { root: null, threshold: 0.3 }
  );

  sections.forEach(s => observer.observe(s));
}

// Fungsi navigasi — dipanggil dari onclick di HTML
function navTo(sectionId, el) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // Update active state langsung
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

// ============================================================
// 6. COPY NOMOR REKENING
// ============================================================
function copyRek() {
  const norek = document.getElementById('noRek');
  if (!norek) return;
  navigator.clipboard.writeText(norek.textContent.trim()).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.innerHTML = '<i class="fa fa-check"></i> Tersalin!';
    btn.style.background = '#27ae60';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa fa-copy"></i> Salin';
      btn.style.background = '';
    }, 2000);
  });
}

// ============================================================
// 7. ANIMASI DAUN BERGUGURAN (Canvas)
// ============================================================
function initLeaves() {
  const canvas = document.getElementById('leavesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const phoneW = Math.min(390, window.innerWidth);
    canvas.width  = phoneW;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#3d5c35', '#4a6741', '#c8a96e', '#9a7a42', '#6b8f5e', '#e8d5a3', '#a8d5a2'];

  class Leaf {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x       = Math.random() * canvas.width;
      this.y       = initial ? Math.random() * canvas.height : -20;
      this.size    = 5 + Math.random() * 9;
      this.speedY  = 0.5 + Math.random() * 1.1;
      this.speedX  = (Math.random() - 0.5) * 0.7;
      this.angle   = Math.random() * Math.PI * 2;
      this.spin    = (Math.random() - 0.5) * 0.05;
      this.opacity = 0.35 + Math.random() * 0.45;
      this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.sway    = Math.random() * Math.PI * 2;
      this.swaySpd = 0.015 + Math.random() * 0.025;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.45, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = this.opacity * 0.4;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(0, this.size);
      ctx.stroke();
      ctx.restore();
    }
    update() {
      this.sway += this.swaySpd;
      this.x    += this.speedX + Math.sin(this.sway) * 0.5;
      this.y    += this.speedY;
      this.angle += this.spin;
      if (this.y > canvas.height + 20) this.reset();
    }
  }

  const leaves = Array.from({ length: 22 }, () => new Leaf());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    leaves.forEach(l => { l.update(); l.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// ============================================================
// CSS spin keyframe (inject sekali)
// ============================================================
(function () {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
})();