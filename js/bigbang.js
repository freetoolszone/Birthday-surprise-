/**
 * Cosmic Big Bang Intro Star & Supernova Engine
 * Creates a pitch-black void, awakens a pulsating primordial star,
 * triggers a celestial supernova shockwave explosion, and births the universe!
 */

class CosmicBigBang {
  constructor() {
    this.overlay = document.getElementById('bigBangOverlay');
    this.canvas = document.getElementById('bigBangCanvas');
    this.star = document.getElementById('primordialStar');
    this.flash = document.getElementById('bigBangFlash');
    this.ring1 = document.getElementById('shockwaveRing1');
    this.ring2 = document.getElementById('shockwaveRing2');
    this.contentBox = document.querySelector('.page-container .content-box');

    if (!this.overlay || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.audioCtx = null;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.colors = [
      '#ffffff', // diamond white
      '#ffd97d', // starlight gold
      '#ffeaa7', // warm amber
      '#f472b6', // rose pink
      '#ec4899', // deep nebula pink
      '#c084fc', // celestial violet
      '#38bdf8'  // cosmic cyan
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Skip Big Bang if user loaded directly into a later step (e.g. #step-4, #step-5)
    const hash = window.location.hash;
    const match = hash.match(/#step-([2-6])/);
    if (match) {
      this.dismissImmediately();
    } else {
      this.playIntro();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Soft crystalline gather chime
  playChargeSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.audioCtx.currentTime + 1.3);

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + 1.4);
    } catch (e) {}
  }

  // Supernova celestial detonation chord
  playBigBangSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.04);

        const start = this.audioCtx.currentTime + idx * 0.04;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + 1.85);
      });
    } catch (e) {}
  }

  createExplosionParticles() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const count = Math.min(130, Math.floor(this.width * 0.12));

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 15 + 7;
      const size = Math.random() * 4 + 1.8;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const isStar = Math.random() > 0.4;

      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.016 + 0.012,
        drag: Math.random() * 0.03 + 0.94,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        isStar: isStar
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;

      if (p.isStar) {
        this.ctx.rotate(p.rotation);
        this.ctx.beginPath();
        const spikes = 4;
        const outer = p.size * 2.5;
        const inner = p.size * 0.5;
        for (let j = 0; j < spikes * 2; j++) {
          const r = (j % 2 === 0) ? outer : inner;
          const a = (j * Math.PI) / spikes;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (j === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  dismissImmediately() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    if (this.contentBox) {
      this.contentBox.classList.add('ready');
    }
  }

  playIntro() {
    if (!this.overlay) return;

    // Reset overlay elements
    this.overlay.style.display = 'flex';
    this.overlay.classList.remove('fade-out');
    if (this.contentBox) this.contentBox.classList.remove('ready');

    if (this.star) {
      this.star.style.display = 'flex';
      this.star.style.animation = 'none';
      void this.star.offsetWidth; // trigger reflow
      this.star.style.animation = 'starGatherEnergy 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }

    if (this.flash) this.flash.classList.remove('active');
    if (this.ring1) this.ring1.classList.remove('active-1');
    if (this.ring2) this.ring2.classList.remove('active-2');

    // 1. Star awakens and charges up
    setTimeout(() => {
      this.playChargeSound();
    }, 350);

    // 2. BIG BANG Detonation at 1.65s!
    setTimeout(() => {
      if (this.star) this.star.style.display = 'none';

      // Supernova Flash & Shockwaves
      if (this.flash) this.flash.classList.add('active');
      if (this.ring1) this.ring1.classList.add('active-1');
      if (this.ring2) this.ring2.classList.add('active-2');

      this.playBigBangSound();
      this.createExplosionParticles();
    }, 1650);

    // 3. Universe births into view: reveal Page 1 content box
    setTimeout(() => {
      if (this.contentBox) {
        this.contentBox.classList.add('ready');
      }
      this.overlay.classList.add('fade-out');
    }, 2450);

    // 4. Clean up overlay
    setTimeout(() => {
      this.overlay.style.display = 'none';
    }, 3350);
  }
}

// Global instance & trigger
let bigBangInstance = null;

window.triggerBigBang = () => {
  if (!bigBangInstance) {
    bigBangInstance = new CosmicBigBang();
  }
  bigBangInstance.playIntro();
};

window.addEventListener('DOMContentLoaded', () => {
  bigBangInstance = new CosmicBigBang();
});

