/**
 * Beautiful Memories - Interactive Polaroid Lightbox Modal Engine
 * Features:
 * - 3:4 uncropped portrait photo display on left
 * - Interactive Spinning Vinyl Record / CD Music Player on right
 * - Dedicated turntable tonearm animation, time progress bar & seekable scrub
 * - Play/Pause master controls with dancing audio visualizer wave bars
 * - Seamless automatic pause & resume of main background music
 */

const timelineData = [
  {
    caption: "Mesmerizing🌸",
    icon: "🌸",
    src: "images/photo1.jpg",
    audio: "audio/audiomemory1.mp3"
  },
  {
    caption: "Radiant 🦋",
    icon: "🦋",
    src: "images/photo2.jpg",
    audio: "audio/audiomemory2.mp3"
  },
  {
    caption: "Graceful ✨",
    icon: "✨",
    src: "images/photo3.jpg",
    audio: "audio/audiomemory3.mp3"
  },
  {
    caption: "Enchanting🌷",
    icon: "🌷",
    src: "images/photo4.jpg",
    audio: "audio/audiomemory4.mp3"
  },
  {
    caption: "Angelic💫",
    icon: "💫",
    src: "images/photo5.jpg",
    audio: "audio/audiomemory5.mp3"
  },
  {
    caption: "Captivating🌙",
    icon: "🌙",
    src: "images/photo6.jpg",
    audio: "audio/audiomemory6.mp3"
  },
  {
    caption: "Ethereal💖",
    icon: "💖",
    src: "images/photo7.jpg",
    audio: "audio/audiomemory7.mp3"
  },
  {
    caption: "Breathtaking🌟",
    icon: "🌟",
    src: "images/photo8.jpg",
    audio: "audio/audiomemory8.mp3"
  }
];

// Helper to generate candidate paths for picture audio (supports audiomemoryX, memoryX, photoX, etc.)
function getAudioCandidates(index) {
  const num = index + 1;
  const item = timelineData[index] || {};
  const candidates = [];
  if (item.audio) candidates.push(item.audio);
  candidates.push(
    `audio/audiomemory${num}.mp3`,
    `audio/memory${num}.mp3`,
    `audio/audiomemory${num}.wav`,
    `audio/memory${num}.wav`,
    `audio/audiomemory${num}.m4a`,
    `audio/memory${num}.m4a`,
    `audio/audiomemory_${num}.mp3`,
    `audio/memory_${num}.mp3`,
    `audio/audio_memory${num}.mp3`,
    `audio/audio_memory_${num}.mp3`,
    `audio/photo${num}.mp3`,
    `audio/photo${num}.wav`,
    `audio/song${num}.mp3`
  );
  return candidates;
}

// Time formatting helper
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Picture-specific audio playback controller
let currentPhotoAudio = null;
let updateVisualizerState = null;
let bindAudioProgressEvents = null;

function stopPhotoAudio() {
  if (currentPhotoAudio) {
    try {
      currentPhotoAudio.pause();
      currentPhotoAudio.currentTime = 0;
    } catch (err) {}
    currentPhotoAudio = null;
  }
  if (typeof updateVisualizerState === 'function') {
    updateVisualizerState(false);
  }
}

function playPhotoAudioForIndex(index) {
  stopPhotoAudio();
  const queue = [...getAudioCandidates(index)];

  const tryPlayCandidate = () => {
    if (queue.length === 0) {
      currentPhotoAudio = null;
      if (typeof updateVisualizerState === 'function') {
        updateVisualizerState(false);
      }
      return;
    }

    const src = queue.shift();
    const audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.preload = 'auto';
    currentPhotoAudio = audio;

    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      audio.removeEventListener('error', onError);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      if (currentPhotoAudio === audio) {
        tryPlayCandidate();
      }
    };

    const onError = () => {
      advance();
    };

    const onPlay = () => {
      if (typeof updateVisualizerState === 'function') {
        updateVisualizerState(true);
      }
    };

    const onPause = () => {
      if (typeof updateVisualizerState === 'function') {
        updateVisualizerState(false);
      }
    };

    audio.addEventListener('error', onError, { once: true });
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Bind progress bar & duration counters
    if (typeof bindAudioProgressEvents === 'function') {
      bindAudioProgressEvents(audio);
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (typeof updateVisualizerState === 'function') {
            updateVisualizerState(true);
          }
        })
        .catch(() => {
          advance();
        });
    }
  };

  tryPlayCandidate();
}

document.addEventListener('DOMContentLoaded', () => {
  // Inject fairy lights garland along each hanging rope
  const ropeRows = document.querySelectorAll('.rope-row');
  ropeRows.forEach((ropeRow) => {
    if (ropeRow.querySelector('.fairy-lights-garland')) return;
    const garland = document.createElement('div');
    garland.className = 'fairy-lights-garland';

    const bulbCount = 14;
    for (let i = 0; i < bulbCount; i++) {
      const bulb = document.createElement('div');
      const colorType = i % 4; // 0: Gold, 1: Rose Pink, 2: Warm White, 3: Soft Lavender
      bulb.className = `fairy-bulb bulb-type-${colorType}`;
      bulb.style.left = `${((i + 0.5) / bulbCount) * 100}%`;
      bulb.style.animationDelay = `${(i * 0.28) % 3}s`;
      garland.appendChild(bulb);
    }
    ropeRow.insertBefore(garland, ropeRow.firstChild);
  });

  const polaroidItems = document.querySelectorAll('.polaroid-item');
  const modalBackdrop = document.getElementById('timelineModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');

  const modalPhotoWrapper = document.getElementById('modalPhotoWrapper');
  const modalCounter = document.getElementById('modalCounter');

  // Vinyl CD Music Player Elements
  const cdTrackTitle = document.getElementById('cdTrackTitle');
  const vinylDisc = document.getElementById('vinylDisc');
  const turntableTonearm = document.getElementById('turntableTonearm');
  const photoAudioToggleBtn = document.getElementById('photoAudioToggleBtn');
  const photoAudioPlayIcon = document.getElementById('photoAudioPlayIcon');
  const audioWaveBars = document.getElementById('audioWaveBars');
  const cdPlayingStatus = document.getElementById('cdPlayingStatus');
  const cdCurrentTime = document.getElementById('cdCurrentTime');
  const cdDuration = document.getElementById('cdDuration');
  const cdProgressFill = document.getElementById('cdProgressFill');
  const cdProgressTrack = document.getElementById('cdProgressTrack');

  let currentIndex = 0;
  let isModalOpen = false;

  // Sync visualizer, vinyl rotation, tonearm & play button with audio state
  updateVisualizerState = (isPlaying) => {
    if (photoAudioPlayIcon) {
      photoAudioPlayIcon.textContent = isPlaying ? '⏸' : '▶';
    }
    if (vinylDisc) {
      if (isPlaying) {
        vinylDisc.classList.remove('paused');
      } else {
        vinylDisc.classList.add('paused');
      }
    }
    if (turntableTonearm) {
      if (isPlaying) {
        turntableTonearm.classList.remove('paused');
      } else {
        turntableTonearm.classList.add('paused');
      }
    }
    if (audioWaveBars) {
      if (isPlaying) {
        audioWaveBars.classList.remove('paused');
      } else {
        audioWaveBars.classList.add('paused');
      }
    }
    if (cdPlayingStatus) {
      cdPlayingStatus.textContent = isPlaying ? 'Now Playing' : 'Paused';
    }
  };

  // Bind live progress updates to the active Audio instance
  bindAudioProgressEvents = (audio) => {
    if (!audio) return;

    if (cdProgressFill) cdProgressFill.style.width = '0%';
    if (cdCurrentTime) cdCurrentTime.textContent = '0:00';

    audio.addEventListener('loadedmetadata', () => {
      if (cdDuration && !isNaN(audio.duration) && audio.duration > 0) {
        cdDuration.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio) return;
      const cur = audio.currentTime || 0;
      const dur = audio.duration || 30;

      if (cdCurrentTime) {
        cdCurrentTime.textContent = formatTime(cur);
      }
      if (cdDuration && !isNaN(dur) && dur > 0) {
        cdDuration.textContent = formatTime(dur);
      }
      if (cdProgressFill && dur > 0) {
        const pct = Math.min(100, (cur / dur) * 100);
        cdProgressFill.style.width = `${pct}%`;
      }
    });
  };

  // Toggle Audio Play / Pause
  const toggleAudio = () => {
    if (!currentPhotoAudio) {
      playPhotoAudioForIndex(currentIndex);
      return;
    }
    if (currentPhotoAudio.paused) {
      currentPhotoAudio.play().catch(() => {});
    } else {
      currentPhotoAudio.pause();
    }
  };

  if (photoAudioToggleBtn) {
    photoAudioToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }

  // Clicking the vinyl record also toggles playback
  if (vinylDisc) {
    vinylDisc.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }

  // Click on progress track to seek
  if (cdProgressTrack) {
    cdProgressTrack.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentPhotoAudio || !currentPhotoAudio.duration) return;
      const rect = cdProgressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      currentPhotoAudio.currentTime = ratio * currentPhotoAudio.duration;
    });
  }

  const updateModalContent = (index) => {
    currentIndex = index;
    const item = timelineData[index];
    if (!item) return;

    // Update track header
    if (cdTrackTitle) {
      cdTrackTitle.textContent = item.caption || `Memory ${index + 1}`;
    }

    if (modalCounter) {
      modalCounter.textContent = `${index + 1} / ${timelineData.length}`;
    }

    // Update 3:4 uncropped photo frame
    if (modalPhotoWrapper) {
      const img = new Image();
      img.src = item.src;
      img.onload = () => {
        modalPhotoWrapper.innerHTML = `<img src="${item.src}" alt="${item.caption || 'Memory'}">`;
      };
      img.onerror = () => {
        modalPhotoWrapper.innerHTML = `
          <div class="placeholder-photo" style="height:100%;">
            <span class="placeholder-icon" style="font-size:3rem;">${item.icon || '🌸'}</span>
            <span style="font-size:0.9rem; color:#f472b6; font-weight:500; margin-top:0.6rem;">${item.caption || ('Memory ' + (index + 1))}</span>
            <span style="font-size:0.75rem; color:#94a3b8; margin-top:0.3rem;">(Add ${item.src} to customize)</span>
          </div>
        `;
      };
    }

    // Play specific audio for this photo
    playPhotoAudioForIndex(index);
  };

  const openModal = (index) => {
    isModalOpen = true;

    // 1. Completely pause the main background music
    if (typeof window.pauseBackgroundMusic === 'function') {
      window.pauseBackgroundMusic();
    }

    // 2. Load content & play photo-specific audio
    updateModalContent(index);

    // 3. Reveal modal
    if (modalBackdrop) {
      modalBackdrop.classList.add('open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }
  };

  const closeModal = () => {
    if (!isModalOpen && (!modalBackdrop || !modalBackdrop.classList.contains('open'))) {
      return;
    }
    isModalOpen = false;

    // 1. Stop picture-specific audio
    stopPhotoAudio();

    // 2. Hide modal
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }

    // 3. Resume main background music exactly where it was stopped!
    if (typeof window.resumeBackgroundMusic === 'function') {
      window.resumeBackgroundMusic();
    }
  };

  // Expose closeModal globally for main.js and page navigation
  window.closeTimelineModal = closeModal;

  // Attach click listener to each polaroid item
  polaroidItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openModal(index);
    });
  });

  // Modal navigation controls
  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prevIdx = (currentIndex - 1 + timelineData.length) % timelineData.length;
      updateModalContent(prevIdx);
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIdx = (currentIndex + 1) % timelineData.length;
      updateModalContent(nextIdx);
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Keyboard controls (Escape, Left, Right arrows)
  window.addEventListener('keydown', (e) => {
    if (!modalBackdrop || !modalBackdrop.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      const prevIdx = (currentIndex - 1 + timelineData.length) % timelineData.length;
      updateModalContent(prevIdx);
    } else if (e.key === 'ArrowRight') {
      const nextIdx = (currentIndex + 1) % timelineData.length;
      updateModalContent(nextIdx);
    }
  });

  // Safe cleanup on page navigation buttons
  const navButtons = document.querySelectorAll('#nextPageBtn, #backBtn, #step5NextBtn, #step5BackBtn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal();
    });
  });

  // Ensure main background music resumes and photo audio stops if navigating away
  window.addEventListener('beforeunload', () => {
    stopPhotoAudio();
    if (typeof window.resumeBackgroundMusic === 'function') {
      window.resumeBackgroundMusic();
    }
  });

  // Check thumbnails on polaroids
  polaroidItems.forEach((item, index) => {
    const data = timelineData[index];
    const imgBox = item.querySelector('.polaroid-img-box');
    if (imgBox && data) {
      const img = new Image();
      img.src = data.src;
      img.onload = () => {
        imgBox.innerHTML = `<img src="${data.src}" alt="${data.caption}">`;
      };
    }
  });
});
