/* ============================================================
   main.js — Cover Page Logic
   - Baca nama tamu dari URL param ?to=
   - Animasi daun berguguran (canvas)
   - Tombol buka undangan → home.html?to=NamaTamu
   ============================================================ */

// ---- 1. Baca nama tamu dari URL ----
(function () {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('to') || 'Tamu Undangan';
  const el = document.getElementById('guestName');
  if (el) el.textContent = decodeURIComponent(name);
})();

// ---- 2. Tombol buka undangan ----
function openInvitation() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('to') || '';
  const btn = document.getElementById('btnOpen');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> Membuka...';

  // Animasi fade out
  document.querySelector('.cover-card').style.transition = 'opacity 0.6s, transform 0.6s';
  document.querySelector('.cover-card').style.opacity = '0';
  document.querySelector('.cover-card').style.transform = 'translateY(30px)';

  setTimeout(() => {
    const dest = name
      ? 'home.html?to=' + encodeURIComponent(name)
      : 'home.html';
    window.location.href = dest;
  }, 700);
}

// ---- 3. Animasi Daun Berguguran (Canvas) ----
(function () {
  const canvas = document.getElementById('leavesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const phoneW = Math.min(390, window.innerWidth);
    canvas.width  = phoneW;
    canvas.height = window.innerHeight;
    canvas.style.left = '50%';
    canvas.style.transform = 'translateX(-50%)';
  }
  resize();
  window.addEventListener('resize', resize);

  // Warna daun
  const COLORS = ['#3d5c35', '#4a6741', '#c8a96e', '#9a7a42', '#6b8f5e', '#e8d5a3'];

  class Leaf {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x    = Math.random() * canvas.width;
      this.y    = initial ? Math.random() * canvas.height : -20;
      this.size = 6 + Math.random() * 10;
      this.speedY  = 0.6 + Math.random() * 1.2;
      this.speedX  = (Math.random() - 0.5) * 0.8;
      this.angle   = Math.random() * Math.PI * 2;
      this.spin    = (Math.random() - 0.5) * 0.06;
      this.opacity = 0.5 + Math.random() * 0.5;
      this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.sway    = Math.random() * Math.PI * 2;
      this.swaySpd = 0.02 + Math.random() * 0.02;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 0.5;
      // bentuk daun oval
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size / 2, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      // tulang daun
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(0, this.size);
      ctx.globalAlpha = this.opacity * 0.5;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.restore();
    }

    update() {
      this.sway += this.swaySpd;
      this.x     += this.speedX + Math.sin(this.sway) * 0.5;
      this.y     += this.speedY;
      this.angle += this.spin;
      if (this.y > canvas.height + 20) this.reset();
    }
  }

  const LEAF_COUNT = 18;
  const leaves = Array.from({ length: LEAF_COUNT }, () => new Leaf());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    leaves.forEach(l => { l.update(); l.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();