/**
 * Seamless Step Navigation & Interactive Journey Engine
 * Keeps background music 100% continuous without resetting on step transitions,
 * and maintains complete functionality for both multi-step (index.html) and standalone pages.
 */

document.addEventListener('DOMContentLoaded', () => {
  const introCurtain = document.getElementById('introCurtain');
  const stepViews = document.querySelectorAll('.page-step-view');
  const isMultiStep = stepViews.length > 0;

  // Fade out black curtain after initial render
  setTimeout(() => {
    if (introCurtain) {
      introCurtain.classList.add('fade-out');
    }
  }, 200);

  // Helper to ensure background music starts on first user action
  const triggerAudioPlay = () => {
    if (window._bgAudioInstance && window._bgAudioInstance.audio) {
      if (window._bgAudioInstance.isPaused) {
        return; // Do NOT unpause if background music is paused for wish audio or memory photo
      }
      window._bgAudioInstance.play().catch(() => {});
    }
  };

  // ==========================================================================
  // Ethereal Butterfly Page Transition Engine
  // ==========================================================================
  class ButterflyTransitionEngine {
    constructor(curtainEl) {
      this.curtain = curtainEl;
      this.ensureMarkup();
      this.canvas = document.getElementById('butterflyTransitionCanvas');
      this.flightEl = document.getElementById('butterflyTransitionFlight');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.running = false;
      this.tracking = false;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.colors = ['#ffffff', '#ffd700', '#fde047', '#c084fc', '#38bdf8', '#f472b6', '#a855f7'];

      if (this.canvas) {
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    }

    ensureMarkup() {
      if (!this.curtain) return;
      if (this.curtain.querySelector('#butterflyTransitionFlight')) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'butterfly-transition-canvas';
      canvas.id = 'butterflyTransitionCanvas';

      const flight = document.createElement('div');
      flight.className = 'butterfly-transition-flight';
      flight.id = 'butterflyTransitionFlight';
      flight.innerHTML = `
        <div class="butterfly-3d-model">
          <div class="butterfly-wing wing-left">
            <svg viewBox="0 0 70 90">
              <defs>
                <linearGradient id="transWingGradL" x1="100%" y1="50%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.95" />
                  <stop offset="35%" stop-color="#c084fc" stop-opacity="0.9" />
                  <stop offset="70%" stop-color="#f472b6" stop-opacity="0.9" />
                  <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95" />
                </linearGradient>
                <linearGradient id="transVeinGrad" x1="100%" y1="50%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                  <stop offset="100%" stop-color="#fef08a" stop-opacity="0.6" />
                </linearGradient>
              </defs>
              <path d="M 68,44 C 62,20 44,4 16,4 C 4,4 0,16 6,28 C 12,40 28,48 48,48 C 58,48 64,46 68,44 Z" fill="url(#transWingGradL)" stroke="rgba(255, 255, 255, 0.85)" stroke-width="0.9" />
              <path d="M 68,44 Q 45,26 18,7 M 68,44 Q 38,34 9,25 M 68,44 Q 38,44 14,37" fill="none" stroke="url(#transVeinGrad)" stroke-width="0.7" opacity="0.8" />
              <path d="M 65,46 C 54,50 32,54 20,64 C 10,74 22,86 36,84 C 48,82 58,68 65,52 Z" fill="url(#transWingGradL)" stroke="rgba(255, 255, 255, 0.85)" stroke-width="0.9" />
              <path d="M 65,48 Q 42,64 24,73 M 65,48 Q 50,70 34,80" fill="none" stroke="url(#transVeinGrad)" stroke-width="0.6" opacity="0.75" />
              <circle cx="14" cy="14" r="1.5" fill="#ffffff" />
              <circle cx="24" cy="9" r="1.2" fill="#ffd700" />
              <circle cx="8" cy="24" r="1.2" fill="#ffffff" />
              <circle cx="22" cy="72" r="1.4" fill="#ffd700" />
            </svg>
          </div>
          <div class="butterfly-body">
            <div class="butterfly-antenna left"></div>
            <div class="butterfly-antenna right"></div>
            <div class="butterfly-head"></div>
            <div class="butterfly-thorax"></div>
            <div class="butterfly-abdomen"></div>
          </div>
          <div class="butterfly-wing wing-right">
            <svg viewBox="0 0 70 90">
              <defs>
                <linearGradient id="transWingGradR" x1="0%" y1="50%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.95" />
                  <stop offset="35%" stop-color="#c084fc" stop-opacity="0.9" />
                  <stop offset="70%" stop-color="#f472b6" stop-opacity="0.9" />
                  <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95" />
                </linearGradient>
              </defs>
              <path d="M 2,44 C 8,20 26,4 54,4 C 66,4 70,16 64,28 C 58,40 42,48 22,48 C 12,48 6,46 2,44 Z" fill="url(#transWingGradR)" stroke="rgba(255, 255, 255, 0.85)" stroke-width="0.9" />
              <path d="M 2,44 Q 25,26 52,7 M 2,44 Q 32,34 61,25 M 2,44 Q 32,44 56,37" fill="none" stroke="url(#transVeinGrad)" stroke-width="0.7" opacity="0.8" />
              <path d="M 5,46 C 16,50 38,54 50,64 C 60,74 48,86 34,84 C 22,82 12,68 5,52 Z" fill="url(#transWingGradR)" stroke="rgba(255, 255, 255, 0.85)" stroke-width="0.9" />
              <path d="M 5,48 Q 28,64 46,73 M 5,48 Q 20,70 36,80" fill="none" stroke="url(#transVeinGrad)" stroke-width="0.6" opacity="0.75" />
              <circle cx="56" cy="14" r="1.5" fill="#ffffff" />
              <circle cx="46" cy="9" r="1.2" fill="#ffd700" />
              <circle cx="62" cy="24" r="1.2" fill="#ffffff" />
              <circle cx="48" cy="72" r="1.4" fill="#ffd700" />
            </svg>
          </div>
        </div>
      `;

      this.curtain.appendChild(canvas);
      this.curtain.appendChild(flight);
    }

    resize() {
      if (!this.canvas) return;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      if (this.ctx) {
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      }
    }

    emitTrail(x, y, count = 2) {
      if (!this.running || !this.ctx) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.6 + 0.4;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 16,
          y: y + (Math.random() - 0.5) * 16,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.6,
          size: Math.random() * 2.8 + 1.2,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          alpha: 1,
          decay: Math.random() * 0.024 + 0.02,
          twinkleSpeed: Math.random() * 0.25 + 0.1,
          twinklePhase: Math.random() * Math.PI * 2,
          isStar: Math.random() > 0.4
        });
      }
    }

    emitBurst(x, y, count = 38) {
      if (!this.ctx) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.8;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.8 + 1.6,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          alpha: 1,
          decay: Math.random() * 0.022 + 0.015,
          twinkleSpeed: Math.random() * 0.3 + 0.15,
          twinklePhase: Math.random() * Math.PI * 2,
          isStar: Math.random() > 0.35
        });
      }
    }

    animate() {
      if (!this.running && this.particles.length === 0) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;
        p.twinklePhase += p.twinkleSpeed;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        const displayAlpha = Math.max(0, Math.min(1, p.alpha * (0.7 + 0.3 * Math.sin(p.twinklePhase))));

        this.ctx.save();
        this.ctx.globalAlpha = displayAlpha;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;

        if (p.isStar) {
          this.ctx.translate(p.x, p.y);
          this.ctx.beginPath();
          const r = p.size * 1.6;
          const inner = r * 0.35;
          for (let j = 0; j < 8; j++) {
            const a = (j * Math.PI) / 4;
            const dist = j % 2 === 0 ? r : inner;
            const px = Math.cos(a) * dist;
            const py = Math.sin(a) * dist;
            if (j === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
          }
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      if (this.running || this.particles.length > 0) {
        requestAnimationFrame(() => this.animate());
      }
    }

    playTransition(onMidpoint, isBackward = false) {
      if (!this.curtain) {
        if (onMidpoint) onMidpoint();
        return;
      }

      this.ensureMarkup();
      if (!this.canvas) {
        this.canvas = document.getElementById('butterflyTransitionCanvas');
        this.flightEl = document.getElementById('butterflyTransitionFlight');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        if (this.canvas) this.resize();
      }

      // 1. Drop black curtain
      this.curtain.classList.remove('fade-out');

      // 2. Start particle canvas
      this.particles = [];
      this.running = true;
      this.tracking = true;
      this.animate();

      // 3. Trigger 3D butterfly flight
      if (this.flightEl) {
        this.flightEl.classList.remove('active-fly', 'fly-backward');
        void this.flightEl.offsetWidth; // force reflow
        if (isBackward) {
          this.flightEl.classList.add('fly-backward');
        }
        this.flightEl.classList.add('active-fly');
      }

      let burstFired = false;
      let lastBx = window.innerWidth / 2;
      let lastBy = window.innerHeight / 2;

      const trackFlight = () => {
        if (!this.tracking) return;
        if (this.flightEl) {
          const rect = this.flightEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            lastBx = rect.left + rect.width / 2;
            lastBy = rect.top + rect.height / 2;
            this.emitTrail(lastBx, lastBy, 2);
          }
        }
        requestAnimationFrame(trackFlight);
      };
      requestAnimationFrame(trackFlight);

      // 4. At 950ms: Butterfly dissolves into radiant celestial starburst!
      setTimeout(() => {
        if (!burstFired) {
          burstFired = true;
          this.emitBurst(lastBx, lastBy, 38);
        }
      }, 950);

      // 5. At 1100ms: Butterfly has finished and dissolved; apply DOM step change
      setTimeout(() => {
        this.tracking = false;
        if (onMidpoint) {
          onMidpoint();
        }
      }, 1100);

      // 6. At 1220ms: Smoothly fade out the black curtain to reveal the new page
      setTimeout(() => {
        this.curtain.classList.add('fade-out');
      }, 1220);

      // 7. At 1550ms: Clean up classes and stop animation loop
      setTimeout(() => {
        if (this.flightEl) {
          this.flightEl.classList.remove('active-fly', 'fly-backward');
        }
        this.running = false;
        this.particles = [];
        if (this.ctx) {
          this.ctx.clearRect(0, 0, this.width, this.height);
        }
      }, 1550);
    }
  }

  const butterflyEngine = new ButterflyTransitionEngine(introCurtain);

  // ==========================================================================
  // Seamless Multi-Step Navigator (Continuous Music Architecture)
  // ==========================================================================
  let currentStep = 1;
  let isTransitioning = false;

  const setStepViewClasses = (stepNum) => {
    if (stepNum === 1) {
      document.documentElement.className = 'single-screen';
      document.body.className = 'single-screen fixed-screen';
    } else if (stepNum === 2 || stepNum === 5) {
      document.documentElement.className = 'single-screen';
      document.body.className = 'single-screen';
    } else {
      document.documentElement.className = 'scrollable';
      document.body.className = 'scrollable';
    }
  };

  const goToStep = (stepNum, skipCurtain = false) => {
    stepNum = Math.max(1, Math.min(6, parseInt(stepNum, 10) || 1));
    if (stepNum === 3) stepNum = 4; // Step 3 ("If I have to describe you") deleted - go directly to Birthday Cake
    const targetEl = document.getElementById(`step-${stepNum}`);
    if (!targetEl) return;

    // Determine navigation direction for butterfly flight path
    const isBackward = stepNum < currentStep;

    // If navigating to ANY step other than Step 4, STOP birthday wish audio immediately!
    if (stepNum !== 4) {
      if (typeof window.stopBirthdayWishAudio === 'function') {
        window.stopBirthdayWishAudio();
      }
    }

    triggerAudioPlay();

    const applyStepChange = () => {
      // 1. Ensure birthday wish audio is completely stopped on any step other than 4
      if (stepNum !== 4) {
        if (typeof window.stopBirthdayWishAudio === 'function') {
          window.stopBirthdayWishAudio();
        }
      }

      // If returning to Step 1 (e.g. Restart Journey), trigger cosmic Big Bang rebirth!
      if (stepNum === 1 && currentStep !== 1) {
        if (typeof window.triggerBigBang === 'function') {
          window.triggerBigBang();
        }
      }

      // If leaving Step 5 or navigating, close memory photo modal & resume background music
      if (currentStep === 5 && stepNum !== 5) {
        if (typeof window.closeTimelineModal === 'function') {
          window.closeTimelineModal();
        }
      }

      // 2. Switch active step views
      stepViews.forEach((view) => {
        view.classList.remove('active-step');
      });
      targetEl.classList.add('active-step');

      // 3. Update body & HTML classes for screen fitting vs scrolling
      setStepViewClasses(stepNum);

      // 4. Reset scroll position to top
      window.scrollTo(0, 0);

      // 5. Update browser history hash without reloading
      currentStep = stepNum;
      if (window.location.hash !== `#step-${stepNum}`) {
        history.pushState(null, '', `#step-${stepNum}`);
      }
    };

    if (skipCurtain || !introCurtain) {
      applyStepChange();
      return;
    }

    if (isTransitioning) return;
    isTransitioning = true;

    // Glowing 3D butterfly flutters across black transition curtain before revealing new page
    butterflyEngine.playTransition(() => {
      applyStepChange();
    }, isBackward);

    setTimeout(() => {
      isTransitioning = false;
    }, 1550);
  };

  window.goToUniverseStep = goToStep;

  if (isMultiStep) {
    // Intercept all navigation links and buttons
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a, button');
      if (!link) return;

      // Don't auto-trigger background music if clicking cake candles or blow/relight buttons
      if (link.id !== 'blowCandlesBtn' && link.id !== 'relightCandlesBtn') {
        triggerAudioPlay();
      }

      const targetStepAttr = link.getAttribute('data-target-step');
      if (targetStepAttr) {
        e.preventDefault();
        goToStep(parseInt(targetStepAttr, 10));
        return;
      }

      const href = link.getAttribute('href');
      if (href && href.startsWith('#step-')) {
        e.preventDefault();
        const stepNum = parseInt(href.replace('#step-', ''), 10);
        if (!isNaN(stepNum)) {
          goToStep(stepNum);
          return;
        }
      }

      if (href) {
        const pageMatch = href.match(/page([1-6])\.html/i);
        if (pageMatch) {
          e.preventDefault();
          goToStep(parseInt(pageMatch[1], 10));
          return;
        }
        if (href === 'index.html') {
          e.preventDefault();
          goToStep(1);
          return;
        }
      }
    });

    // Handle browser Back / Forward history navigation
    window.addEventListener('popstate', () => {
      const hash = window.location.hash;
      const match = hash.match(/#step-([1-6])/);
      if (match) {
        goToStep(parseInt(match[1], 10), true);
      } else {
        goToStep(1, true);
      }
    });

    // Handle initial hash on page load (e.g. index.html#step-3)
    const initialHash = window.location.hash;
    const initialMatch = initialHash.match(/#step-([1-6])/);
    if (initialMatch) {
      goToStep(parseInt(initialMatch[1], 10), true);
    } else {
      setStepViewClasses(1);
      if (typeof window.stopBirthdayWishAudio === 'function') {
        window.stopBirthdayWishAudio();
      }
    }
  } else {
    // Fallback for standalone single pages (if opened separately)
    const navLinks = document.querySelectorAll('#nextPageBtn, #backBtn, .transition-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = link.getAttribute('href');
        if (!targetUrl || targetUrl === '#') return;

        if (typeof window.stopBirthdayWishAudio === 'function') {
          window.stopBirthdayWishAudio();
        }

        const isBack = link.id === 'backBtn' || (link.textContent && link.textContent.toLowerCase().includes('back'));

        butterflyEngine.playTransition(() => {
          window.location.href = targetUrl;
        }, isBack);
      });
    });
  }

  // ==========================================================================
  // Interactive 3D Flip Cards (Step 2 / page2.html)
  // ==========================================================================
  const flipCards = document.querySelectorAll('.flip-card');
  const unveilCountEl = document.getElementById('unveilCount');
  const unveilTracker = document.getElementById('unveilTracker');
  const allUnveiledMsg = document.getElementById('allUnveiledMsg');
  const step2NextBtn = document.getElementById('step2NextBtn') || document.getElementById('nextPageBtn');

  if (flipCards.length > 0) {
    const flippedCards = new Set();
    const totalCards = flipCards.length;

    flipCards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Card ${index + 1}: ${card.querySelector('.card-title')?.textContent || 'Reason'}`);

      const toggleCard = () => {
        triggerAudioPlay();
        const isFlipped = card.classList.toggle('is-flipped');

        if (isFlipped) {
          flippedCards.add(index);
        }

        if (unveilCountEl) {
          unveilCountEl.textContent = `${flippedCards.size} / ${totalCards}`;
        }

        if (flippedCards.size === totalCards) {
          if (unveilTracker) {
            unveilTracker.classList.add('completed');
          }
          if (allUnveiledMsg) {
            allUnveiledMsg.classList.add('visible');
          }
          if (step2NextBtn) {
            step2NextBtn.style.boxShadow = '0 0 35px rgba(244, 114, 182, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)';
          }
        }
      };

      card.addEventListener('click', toggleCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCard();
        }
      });
    });
  }
});
