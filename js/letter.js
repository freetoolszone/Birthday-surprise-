/**
 * Page 6: Interactive Birthday Love Letter Engine
 */

class LetterAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft sparkle opening chime
  playOpenChime() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

        const startTime = this.ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.75);
      });
    } catch (e) {
      console.warn('Audio not available', e);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const audio = new LetterAudio();
  const envelope = document.getElementById('envelopeWrapper');
  const letterParchment = document.getElementById('letterParchment');
  const sealBackBtn = document.getElementById('sealLetterBackBtn');
  const sealedNavFooter = document.getElementById('sealedNavFooter');

  const openLetter = () => {
    audio.playOpenChime();
    
    if (envelope) {
      const flap = envelope.querySelector('.envelope-top-flap');
      if (flap) flap.style.transform = 'rotateX(180deg)';

      setTimeout(() => {
        envelope.classList.add('is-open');
        if (sealedNavFooter) sealedNavFooter.style.display = 'none'; // Hide duplicate sealed footer
        if (letterParchment) {
          letterParchment.classList.add('is-visible');
          letterParchment.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 450);
    }
  };

  const closeLetter = () => {
    if (letterParchment) {
      letterParchment.classList.remove('is-visible');
    }
    if (envelope) {
      envelope.classList.remove('is-open');
      if (sealedNavFooter) sealedNavFooter.style.display = 'flex'; // Show back button when envelope is sealed
      const flap = envelope.querySelector('.envelope-top-flap');
      if (flap) flap.style.transform = 'rotateX(0deg)';
      envelope.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (envelope) {
    envelope.addEventListener('click', openLetter);
  }

  if (sealBackBtn) {
    sealBackBtn.addEventListener('click', closeLetter);
  }
});

