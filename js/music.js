/**
 * Background Music Engine (Hidden, Single Audio, Seamless Playback & Audio Ducking)
 */

class BackgroundMusic {
  constructor() {
    this.audioCandidates = [
      'audio/bg_music.mp3',
      'audio/bg_musi.mp3',
      'audio/bg_music.wav',
      'audio/bg_musi.wav'
    ];
    this.candidateIndex = 0;

    // Singleton check: reuse instance if already in window
    if (window._bgAudioInstance) {
      return window._bgAudioInstance;
    }

    this.audio = new Audio();
    this.audio.id = 'hiddenBgAudio';
    this.audio.loop = true;
    this.targetVolume = 0.65;
    this.audio.volume = this.targetVolume;
    this.fadeInterval = null;
    this.isDucked = false;
    this.isPaused = false;

    window._bgAudioInstance = this;
    this.init();
  }

  init() {
    this.audio.src = this.audioCandidates[this.candidateIndex];

    // Fallback if candidate cannot decode or is missing
    this.audio.addEventListener('error', () => {
      if (this.candidateIndex < this.audioCandidates.length - 1) {
        this.candidateIndex++;
        this.audio.src = this.audioCandidates[this.candidateIndex];
        this.audio.load();
        this.play().catch(() => {});
      }
    });

    // When audio metadata is loaded, restore saved position so it never restarts from 0!
    this.audio.addEventListener('loadedmetadata', () => {
      const savedTime = parseFloat(sessionStorage.getItem('bgMusic_time') || '0');
      if (savedTime && !isNaN(savedTime) && savedTime < this.audio.duration) {
        this.audio.currentTime = savedTime;
      }
    });

    // Save exact time continuously
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && !isNaN(this.audio.currentTime)) {
        sessionStorage.setItem('bgMusic_time', this.audio.currentTime);
        sessionStorage.setItem('bgMusic_playing', !this.audio.paused);
      }
    });

    // Check if music was already playing before
    const wasPlaying = sessionStorage.getItem('bgMusic_playing');

    if (wasPlaying === 'true' || wasPlaying === null) {
      this.play().catch(() => {
        // Autoplay policy: start on very first user gesture anywhere
        this.setupFirstGesture();
      });
    } else {
      this.setupFirstGesture();
    }

    // Save position before unload
    window.addEventListener('beforeunload', () => {
      if (this.audio && !isNaN(this.audio.currentTime)) {
        sessionStorage.setItem('bgMusic_time', this.audio.currentTime);
        sessionStorage.setItem('bgMusic_playing', !this.audio.paused);
      }
    });
  }

  setupFirstGesture() {
    const handleGesture = () => {
      this.play().catch(() => {});
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };

    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
  }

  play() {
    this.isPaused = false;
    sessionStorage.setItem('bgMusic_playing', 'true');
    if (!this.isDucked) {
      this.audio.volume = this.targetVolume;
    }
    return this.audio.play();
  }

  pause() {
    this.isPaused = true;
    sessionStorage.setItem('bgMusic_playing', 'false');
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.audio.volume = this.targetVolume;
    this.audio.pause();
  }

  // Audio Ducking for Page 4 (Fades music down when birthday wish plays)
  duck(targetVol = 0.15, durationMs = 700) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.isDucked = true;
    const stepTime = 40;
    const steps = Math.max(1, durationMs / stepTime);
    const volStep = (this.audio.volume - targetVol) / steps;

    this.fadeInterval = setInterval(() => {
      if (this.audio.volume - volStep > targetVol) {
        this.audio.volume = Math.max(0, this.audio.volume - volStep);
      } else {
        this.audio.volume = targetVol;
        clearInterval(this.fadeInterval);
      }
    }, stepTime);
  }

  // Restore music volume smoothly
  restore(durationMs = 1200) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.isDucked = false;
    const targetVol = this.targetVolume;
    const stepTime = 40;
    const steps = Math.max(1, durationMs / stepTime);
    const volStep = (targetVol - this.audio.volume) / steps;

    this.fadeInterval = setInterval(() => {
      if (this.audio.volume + volStep < targetVol) {
        this.audio.volume = Math.min(targetVol, this.audio.volume + volStep);
      } else {
        this.audio.volume = targetVol;
        clearInterval(this.fadeInterval);
      }
    }, stepTime);
  }
}

// Global instance & window bridge
let bgMusic = null;
document.addEventListener('DOMContentLoaded', () => {
  bgMusic = new BackgroundMusic();
});

// Window helper functions for other scripts (Page 4 birthday wish & Page 5 modal photo audio)
window.duckBackgroundMusic = (target = 0.15, duration = 700) => {
  const inst = bgMusic || window._bgAudioInstance;
  if (inst) inst.duck(target, duration);
};

window.restoreBackgroundMusic = (duration = 1200) => {
  const inst = bgMusic || window._bgAudioInstance;
  if (inst) {
    if (inst.audio.paused) {
      window.resumeBackgroundMusic();
    } else {
      inst.restore(duration);
    }
  }
};

window.pauseBackgroundMusic = () => {
  const inst = bgMusic || window._bgAudioInstance;
  if (inst) {
    inst.isPaused = true;
    inst.pause();
  }
};

window.resumeBackgroundMusic = () => {
  const inst = bgMusic || window._bgAudioInstance;
  if (inst) {
    inst.isPaused = false;
    if (inst.fadeInterval) clearInterval(inst.fadeInterval);
    inst.audio.volume = inst.targetVolume;
    inst.isDucked = false;
    sessionStorage.setItem('bgMusic_playing', 'true');
    inst.play().catch(() => {});
  }
};
