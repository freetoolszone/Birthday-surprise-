/**
 * Interactive Birthday Cake, Audio Synthesis & Confetti Engine
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic candle blowing puff / breath sound
  playPuff() {
    try {
      this.init();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.25; // 250ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Filter to simulate soft breath / whoosh
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.24);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {
      console.warn('Audio not available', e);
    }
  }

  // Celebratory birthday chime melody
  playChimes() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [
        { freq: 523.25, time: 0 },    // C5
        { freq: 659.25, time: 0.12 }, // E5
        { freq: 783.99, time: 0.24 }, // G5
        { freq: 987.77, time: 0.36 }, // B5
        { freq: 1046.50, time: 0.48 },// C6
        { freq: 1318.51, time: 0.65 },// E6
        { freq: 1567.98, time: 0.82 } // G6
      ];

      notes.forEach(({ freq, time }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + time);

        // Music box / chime envelope
        const startTime = this.ctx.currentTime + time;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.28, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.95);
      });
    } catch (e) {
      console.warn('Audio not available', e);
    }
  }
}

class ConfettiEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 140) {
    const colors = [
      '#f472b6', '#ec4899', '#db2777', // pinks
      '#a855f7', '#8b5cf6', '#7c3aed', // purples
      '#38bdf8', '#0ea5e9',             // blues
      '#ffd97d', '#ffe082', '#ffffff'  // gold & white
    ];

    const shapes = ['rect', 'circle', 'heart', 'star'];

    for (let i = 0; i < count; i++) {
      // Launch from middle bottom with wide arc
      const angle = (Math.random() * 120 + 30) * (Math.PI / 180); // 30 to 150 deg upward
      const speed = Math.random() * 18 + 12;

      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 80,
        y: window.innerHeight * 0.65,
        vx: Math.cos(angle) * (Math.random() > 0.5 ? speed : -speed),
        vy: -Math.sin(angle) * speed,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        gravity: 0.38,
        drag: 0.985,
        opacity: 1,
        fadeRate: Math.random() * 0.006 + 0.003
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.animate();
    }
  }

  drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;
      p.opacity -= p.fadeRate;

      if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'heart') {
        this.drawHeart(this.ctx, 0, 0, p.size * 0.8, p.color, p.opacity);
      } else {
        // Fluttering rectangle
        this.ctx.fillRect(-p.size * 0.5, -p.size * 0.25, p.size, p.size * 0.5);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Global wish audio reference & controller
let birthdayWishAudio = null;
let isWishAudioIntentionallyStopped = false;

const stopWishAudio = () => {
  isWishAudioIntentionallyStopped = true;
  if (birthdayWishAudio) {
    try {
      birthdayWishAudio.onplay = null;
      birthdayWishAudio.onpause = null;
      birthdayWishAudio.onended = null;
      birthdayWishAudio.onerror = null;
      birthdayWishAudio.pause();
      birthdayWishAudio.currentTime = 0;
    } catch (e) {}
    birthdayWishAudio = null;
  }
};

window.stopBirthdayWishAudio = () => {
  stopWishAudio();
  if (typeof window.resumeBackgroundMusic === 'function') {
    window.resumeBackgroundMusic();
  }
};

window.addEventListener('pagehide', () => {
  window.stopBirthdayWishAudio();
});
window.addEventListener('beforeunload', () => {
  window.stopBirthdayWishAudio();
});

// Initialize Interactive Cake on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const audio = new AudioSynthesizer();
  const confetti = new ConfettiEngine('confettiCanvas');

  const candles = document.querySelectorAll('.candle');
  const blowBtn = document.getElementById('blowCandlesBtn');
  const relightBtn = document.getElementById('relightCandlesBtn');
  const cakeSubtitle = document.getElementById('cakeSubtitle');
  const cakeTitle = document.getElementById('cakeTitle');
  const page4NextWrapper = document.getElementById('page4NextWrapper');

  let candlesBlown = 0;
  const totalCandles = candles.length;

  const extinguishCandle = (candle) => {
    if (candle.classList.contains('blown')) return;

    candle.classList.add('blown');
    const flame = candle.querySelector('.candle-flame');
    if (flame) flame.classList.add('extinguished');

    audio.playPuff();
    candlesBlown++;

    // When all candles are blown
    if (candlesBlown >= totalCandles) {
      setTimeout(() => {
        onAllCandlesExtinguished();
      }, 350);
    }
  };

  const playWishAudio = () => {
    // 1. Stop any previously playing wish audio
    stopWishAudio();
    isWishAudioIntentionallyStopped = false;

    // 2. Completely pause main background music immediately
    if (typeof window.pauseBackgroundMusic === 'function') {
      window.pauseBackgroundMusic();
    }

    // 3. Create fresh wish audio and start from beginning (0:00) - plays ONCE then stops
    const a = new Audio('audio/birthday_wis.mp3');
    a.loop = false; // Plays once after blowing, then stops!
    a.preload = 'auto';
    birthdayWishAudio = a;

    let fallbackTried = false;
    const tryFallback = () => {
      if (fallbackTried || isWishAudioIntentionallyStopped) return;
      fallbackTried = true;
      a.src = 'audio/birthday_wish.mp3';
      a.load();
      a.play().catch(() => {});
    };

    a.onerror = tryFallback;

    a.onplay = () => {
      if (isWishAudioIntentionallyStopped) {
        a.pause();
        a.currentTime = 0;
        return;
      }
      if (typeof window.pauseBackgroundMusic === 'function') {
        window.pauseBackgroundMusic();
      }
    };

    a.onended = () => {
      // Finished playing its one time: clean up & resume background music
      stopWishAudio();
      if (typeof window.resumeBackgroundMusic === 'function') {
        window.resumeBackgroundMusic();
      }
    };

    a.play().catch(tryFallback);
  };

  const onAllCandlesExtinguished = () => {
    // Launch celebratory confetti!
    confetti.burst(160);
    setTimeout(() => {
      confetti.burst(100);
    }, 900);

    // Update messages
    if (cakeTitle) {
      cakeTitle.innerHTML = '🎉 Happy Birthday Hanshu! 🎂';
    }
    if (cakeSubtitle) {
      cakeSubtitle.innerHTML = 'May all your wishes come true! ✨';
      cakeSubtitle.classList.add('wished');
    }

    // Toggle button visibility
    if (blowBtn) blowBtn.style.display = 'none';
    if (relightBtn) relightBtn.classList.add('visible');
    if (page4NextWrapper) page4NextWrapper.classList.add('active');

    // Play wish audio from start & pause background music
    playWishAudio();
  };

  const blowAllCandles = () => {
    candles.forEach((candle, idx) => {
      setTimeout(() => {
        extinguishCandle(candle);
      }, idx * 160);
    });
  };

  const relightAllCandles = () => {
    // Stop custom wish audio completely and start over when blown again
    stopWishAudio();

    // Resume background music while candles are lit
    if (typeof window.resumeBackgroundMusic === 'function') {
      window.resumeBackgroundMusic();
    }

    candlesBlown = 0;
    candles.forEach(candle => {
      candle.classList.remove('blown');
      const flame = candle.querySelector('.candle-flame');
      if (flame) flame.classList.remove('extinguished');
    });

    if (cakeTitle) {
      cakeTitle.innerHTML = 'Make a Birthday Wish 🎂';
    }
    if (cakeSubtitle) {
      cakeSubtitle.innerHTML = 'Close your eyes, make a wish, and blow out the candles ✨';
      cakeSubtitle.classList.remove('wished');
    }

    if (blowBtn) blowBtn.style.display = 'inline-flex';
    if (relightBtn) relightBtn.classList.remove('visible');
    if (page4NextWrapper) page4NextWrapper.classList.remove('active');
  };

  // Click on individual candles
  candles.forEach(candle => {
    candle.addEventListener('click', (e) => {
      e.stopPropagation();
      extinguishCandle(candle);
    });
  });

  // Click on "Blow Out Candles" button
  if (blowBtn) {
    blowBtn.addEventListener('click', () => {
      blowAllCandles();
    });
  }

  // Click on "Relight" button
  if (relightBtn) {
    relightBtn.addEventListener('click', () => {
      relightAllCandles();
    });
  }
});

