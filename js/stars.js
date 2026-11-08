/**
 * A Little Universe For You - Cosmic Magic & Atmosphere Engine
 * Features:
 * - Twinkling multi-spectral starfield with 4-point sparkle stars
 * - Floating ambient fireflies / golden motes with breathing pulse
 * - Romantic shooting stars with twin meteor streaks & glowing gradient tails
 * - Fairy dust / stardust cursor & touch trail with 4-point sparkles & click bursts
 */

class Starfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.stars = [];
    this.fireflies = [];
    this.shootingStars = [];
    this.meteorSparks = [];

    this.starCount = 280;
    this.fireflyCount = 26;
    this.maxShootingStars = 3;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.lastShootingStarTime = performance.now();
    this.shootingStarInterval = 4500; // Spawns every 4.5-8s

    this.init();
  }

  init() {
    this.resize();
    this.createStars();
    this.createFireflies();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    const area = this.width * this.height;
    this.starCount = Math.floor(Math.min(Math.max(area / 3200, 160), 400));
    this.createStars();
    this.createFireflies();
  }

  createStars() {
    this.stars = [];
    const colors = [
      'rgba(255, 255, 255,', // pure white
      'rgba(215, 235, 255,', // ice blue
      'rgba(255, 240, 215,', // warm gold
      'rgba(244, 215, 255,', // soft rose lavender
      'rgba(255, 210, 230,'  // blush pink
    ];

    for (let i = 0; i < this.starCount; i++) {
      const isSpecial = Math.random() < 0.09;
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: isSpecial ? (Math.random() * 1.6 + 1.2) : (Math.random() * 1.4 + 0.4),
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        isSpecial: isSpecial
      });
    }
  }

  createFireflies() {
    this.fireflies = [];
    for (let i = 0; i < this.fireflyCount; i++) {
      this.fireflies.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.9,
        baseAlpha: Math.random() * 0.45 + 0.2,
        pulseSpeed: Math.random() * 0.025 + 0.01,
        phase: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.35 + 0.15), // float upward
        vxBase: (Math.random() - 0.5) * 0.18,
        colorPrefix: Math.random() > 0.4 ? 'rgba(255, 225, 160,' : 'rgba(244, 114, 182,'
      });
    }
  }

  spawnShootingStar(isTwin = false) {
    const startX = Math.random() * (this.width * 0.85);
    const startY = Math.random() * (this.height * 0.35);
    const angle = (Math.PI / 180) * (Math.random() * 20 + 35); // 35 to 55 degrees
    const speed = Math.random() * 11 + 13;
    const length = Math.random() * 150 + 110;

    this.shootingStars.push({
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      angle: angle,
      length: length,
      speed: speed,
      thickness: Math.random() * 1.6 + 1.2,
      opacity: 1,
      fadeRate: Math.random() * 0.014 + 0.010,
      color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#ffd9a0' : '#f472b6')
    });

    // 25% chance of twin shooting star right behind
    if (!isTwin && Math.random() < 0.25) {
      setTimeout(() => {
        if (this.shootingStars.length < this.maxShootingStars + 1) {
          this.spawnShootingStar(true);
        }
      }, Math.random() * 320 + 180);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  drawSparkleStar(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();

    const spikes = 4;
    const outerRadius = size * 2.8;
    const innerRadius = size * 0.45;

    for (let i = 0; i < spikes * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const a = (i * Math.PI) / spikes;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const time = performance.now();

    // 1. Draw Twinkling Stars
    for (const star of this.stars) {
      star.phase += star.twinkleSpeed;
      const twinkle = Math.sin(star.phase);
      const alpha = Math.max(0.1, star.baseAlpha + twinkle * 0.35);

      if (star.isSpecial && alpha > 0.65) {
        this.drawSparkleStar(this.ctx, star.x, star.y, star.size, alpha);
      } else {
        this.ctx.fillStyle = `${star.colorPrefix} ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 2. Draw Ambient Floating Fireflies
    for (const f of this.fireflies) {
      f.y += f.vy;
      f.phase += f.pulseSpeed;
      const sway = Math.sin(f.phase) * 0.32;
      f.x += f.vxBase + sway;

      if (f.y < -20) {
        f.y = this.height + 20;
        f.x = Math.random() * this.width;
      }
      if (f.x < -20) f.x = this.width + 20;
      if (f.x > this.width + 20) f.x = -20;

      const alpha = Math.max(0.08, f.baseAlpha + Math.sin(f.phase) * 0.28);

      // Glowing aura
      const grad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 3.5);
      grad.addColorStop(0, `${f.colorPrefix} ${alpha})`);
      grad.addColorStop(0.4, `${f.colorPrefix} ${alpha * 0.35})`);
      grad.addColorStop(1, `${f.colorPrefix} 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.radius * 3.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Bright center core
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.5)})`;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.radius * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Romantic Shooting Stars (Meteors)
    if (time - this.lastShootingStarTime > this.shootingStarInterval) {
      if (this.shootingStars.length < this.maxShootingStars) {
        this.spawnShootingStar();
      }
      this.lastShootingStarTime = time + (Math.random() * 3000 - 1000);
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.dx;
      s.y += s.dy;
      s.opacity -= s.fadeRate;

      // Shed tiny stardust spark behind meteor
      if (Math.random() < 0.35 && s.opacity > 0.3) {
        this.meteorSparks.push({
          x: s.x + (Math.random() - 0.5) * 4,
          y: s.y + (Math.random() - 0.5) * 4,
          alpha: s.opacity * 0.8,
          decay: 0.04,
          size: Math.random() * 1.5 + 0.8,
          color: s.color
        });
      }

      if (s.opacity <= 0 || s.x > this.width + 120 || s.y > this.height + 120) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = s.x - Math.cos(s.angle) * s.length;
      const tailY = s.y - Math.sin(s.angle) * s.length;

      const grad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
      grad.addColorStop(0.18, s.color === '#ffffff' ? `rgba(220, 235, 255, ${s.opacity * 0.85})` : `rgba(255, 215, 170, ${s.opacity * 0.85})`);
      grad.addColorStop(0.55, `rgba(244, 114, 182, ${s.opacity * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = s.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.stroke();

      // Glowing star head
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      this.ctx.arc(s.x, s.y, s.thickness * 1.6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 4. Meteor Dust Sparks
    for (let i = this.meteorSparks.length - 1; i >= 0; i--) {
      const sp = this.meteorSparks[i];
      sp.alpha -= sp.decay;
      if (sp.alpha <= 0) {
        this.meteorSparks.splice(i, 1);
        continue;
      }
      this.ctx.fillStyle = `rgba(255, 235, 190, ${sp.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

/**
 * Fairy Dust & Stardust Cursor Trail (Foreground Floating Sparkles)
 * Follows mouse movements and mobile touch, bursting on tap/click with shimmering 4-point stars!
 */
class FairyDustOverlay {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'fairyDustCanvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '99999';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.display = 'block';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.colors = [
      '#ffd700', // fairy gold
      '#ffeaa7', // warm starlight
      '#f472b6', // rose pink
      '#c084fc', // celestial violet
      '#38bdf8', // starry cyan
      '#ffffff'  // pure diamond
    ];

    this.lastX = -1;
    this.lastY = -1;
    this.animating = false;

    this.resize();
    this.bindEvents();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  addParticle(x, y, isBurst = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst ? (Math.random() * 3.5 + 1.2) : (Math.random() * 1.1 + 0.3);
    const size = isBurst ? (Math.random() * 3.8 + 2.0) : (Math.random() * 2.8 + 1.2);
    const type = Math.random() > 0.38 ? 'star' : 'dot';

    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBurst ? 0.2 : 0.45), // gently floats upward
      size: size,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      alpha: 1,
      decay: isBurst ? (Math.random() * 0.022 + 0.016) : (Math.random() * 0.026 + 0.018),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.16,
      type: type
    });

    if (!this.animating) {
      this.animating = true;
      this.animate();
    }
  }

  burstAt(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y, true);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse movement trail (checks minimum travel distance to avoid spam)
    window.addEventListener('pointermove', (e) => {
      const dist = Math.hypot(e.clientX - this.lastX, e.clientY - this.lastY);
      if (dist > 7) {
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.addParticle(e.clientX, e.clientY, false);
        if (Math.random() < 0.4) {
          this.addParticle(e.clientX, e.clientY, false);
        }
      }
    }, { passive: true });

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const dist = Math.hypot(touch.clientX - this.lastX, touch.clientY - this.lastY);
        if (dist > 8) {
          this.lastX = touch.clientX;
          this.lastY = touch.clientY;
          this.addParticle(touch.clientX, touch.clientY, false);
        }
      }
    }, { passive: true });

    // Delightful burst on click / tap anywhere
    window.addEventListener('pointerdown', (e) => {
      this.burstAt(e.clientX, e.clientY, 10);
    }, { passive: true });
  }

  drawSparkle(ctx, x, y, size, color, alpha, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    ctx.shadowBlur = 7;
    ctx.shadowColor = color;

    ctx.beginPath();
    const spikes = 4;
    const outer = size * 2.2;
    const inner = size * 0.45;
    for (let i = 0; i < spikes * 2; i++) {
      const r = (i % 2 === 0) ? outer : inner;
      const a = (i * Math.PI) / spikes;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawDot(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96; // soft air drag
      p.vy *= 0.96;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'star') {
        this.drawSparkle(this.ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
      } else {
        this.drawDot(this.ctx, p.x, p.y, p.size, p.color, p.alpha);
      }
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

// Start Starfield & Fairy Dust when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Starfield('starCanvas');
  new FairyDustOverlay();
});
