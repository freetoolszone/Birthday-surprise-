const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function noteToFreq(note) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const name = note.slice(0, -1);
  const octave = parseInt(note.slice(-1), 10);
  const semitone = notes.indexOf(name);
  if (semitone === -1) return 0;
  // A4 = 440 Hz is octave 4, note index 9
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function writeWav(filePath, samplesL, samplesR) {
  const numSamples = samplesL.length;
  const byteRate = SAMPLE_RATE * 4;
  const blockAlign = 4;
  const dataSize = numSamples * 4;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(2, 22); // 2 channels
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // 16-bit
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const sL = Math.max(-1, Math.min(1, samplesL[i]));
    const sR = Math.max(-1, Math.min(1, samplesR[i]));
    buffer.writeInt16LE(Math.floor(sL * 32767), offset);
    buffer.writeInt16LE(Math.floor(sR * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filePath, buffer);
}

// Synthesizes a music box / celesta tone
function renderTone(freq, durationSec, volume = 0.3) {
  const totalSamples = Math.floor(SAMPLE_RATE * durationSec);
  const buffer = new Float32Array(totalSamples);
  if (freq <= 0) return buffer;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Music box envelope: instant attack, long exponential decay
    const env = Math.exp(-t * 2.8);
    // Fundamental + gentle harmonics
    const wave =
      Math.sin(2 * Math.PI * freq * t) * 0.7 +
      Math.sin(2 * Math.PI * (freq * 2) * t) * 0.25 +
      Math.sin(2 * Math.PI * (freq * 3) * t) * 0.12 +
      Math.sin(2 * Math.PI * (freq * 4) * t) * 0.05;

    buffer[i] = wave * env * volume;
  }
  return buffer;
}

// Generate "Happy Birthday To You"
function generateHappyBirthday() {
  const bpm = 100;
  const beatSec = 60 / bpm;

  // Melody: [Note, beats]
  const melody = [
    // Phrase 1: Happy Birthday to you
    ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['C5', 1.0], ['B4', 2.0],
    ['REST', 0.5],
    // Phrase 2: Happy Birthday to you
    ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['D5', 1.0], ['C5', 2.0],
    ['REST', 0.5],
    // Phrase 3: Happy Birthday dear Hanshu
    ['G4', 0.75], ['G4', 0.25], ['G5', 1.0], ['E5', 1.0], ['C5', 1.0], ['B4', 1.0], ['A4', 2.0],
    ['REST', 0.5],
    // Phrase 4: Happy Birthday to you!
    ['F5', 0.75], ['F5', 0.25], ['E5', 1.0], ['C5', 1.0], ['D5', 1.0], ['C5', 3.0]
  ];

  // Accompanying chords
  const chords = [
    { startBeat: 0, chord: ['C3', 'G3', 'E4'], durationBeats: 4 },
    { startBeat: 4, chord: ['G3', 'D4', 'B4'], durationBeats: 3 },
    { startBeat: 7.5, chord: ['G3', 'D4', 'F4'], durationBeats: 4 },
    { startBeat: 11.5, chord: ['C3', 'G3', 'E4'], durationBeats: 3 },
    { startBeat: 15, chord: ['C3', 'G3', 'E4'], durationBeats: 4 },
    { startBeat: 19, chord: ['F3', 'C4', 'A4'], durationBeats: 3 },
    { startBeat: 22.5, chord: ['C3', 'G3', 'E4'], durationBeats: 2 },
    { startBeat: 24.5, chord: ['G3', 'D4', 'B4'], durationBeats: 2 },
    { startBeat: 26.5, chord: ['C3', 'G3', 'E4', 'C5'], durationBeats: 4 }
  ];

  let totalBeats = 0;
  melody.forEach(m => totalBeats += m[1]);
  const totalDuration = totalBeats * beatSec + 2.5; // tail reverb
  const totalSamples = Math.floor(SAMPLE_RATE * totalDuration);

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  // Render melody
  let currentSec = 0;
  melody.forEach(([note, beats]) => {
    const dur = beats * beatSec;
    if (note !== 'REST') {
      const freq = noteToFreq(note);
      const tone = renderTone(freq, Math.max(dur + 1.2, 1.8), 0.38);
      const startSample = Math.floor(currentSec * SAMPLE_RATE);
      for (let i = 0; i < tone.length && startSample + i < totalSamples; i++) {
        left[startSample + i] += tone[i] * 0.75;
        right[startSample + i] += tone[i] * 0.85;
      }
    }
    currentSec += dur;
  });

  // Render chords
  chords.forEach(({ startBeat, chord, durationBeats }) => {
    const startSec = startBeat * beatSec;
    const dur = durationBeats * beatSec;
    const startSample = Math.floor(startSec * SAMPLE_RATE);

    chord.forEach((note, nIdx) => {
      const freq = noteToFreq(note);
      const tone = renderTone(freq, dur + 1.5, 0.16);
      const panL = nIdx % 2 === 0 ? 0.8 : 0.4;
      const panR = nIdx % 2 === 0 ? 0.4 : 0.8;
      for (let i = 0; i < tone.length && startSample + i < totalSamples; i++) {
        left[startSample + i] += tone[i] * panL;
        right[startSample + i] += tone[i] * panR;
      }
    });
  });

  return { left, right };
}

// Generate ambient romantic looping background soundtrack
function generateRomanticBackground() {
  const bpm = 72;
  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;

  // 4 chord progression: Cmaj7 - Am9 - Fmaj7 - Gsus4 (repeated twice = 8 bars)
  const progressions = [
    // Bar 1: Cmaj7
    { chord: ['C3', 'G3', 'B3', 'E4', 'G4'], bass: 'C2' },
    // Bar 2: Am9
    { chord: ['A2', 'E3', 'G3', 'C4', 'B4'], bass: 'A1' },
    // Bar 3: Fmaj7
    { chord: ['F2', 'C3', 'E3', 'A3', 'C4'], bass: 'F1' },
    // Bar 4: Gsus4 to G
    { chord: ['G2', 'D3', 'G3', 'B3', 'D4'], bass: 'G1' },
    // Bar 5: Cmaj7
    { chord: ['C3', 'G3', 'E4', 'B4'], bass: 'C2' },
    // Bar 6: Am9
    { chord: ['A2', 'E3', 'C4', 'E4'], bass: 'A1' },
    // Bar 7: Fmaj7
    { chord: ['F2', 'C3', 'A3', 'E4'], bass: 'F1' },
    // Bar 8: G
    { chord: ['G2', 'D3', 'B3', 'D4'], bass: 'G1' }
  ];

  const totalDuration = progressions.length * barSec;
  const totalSamples = Math.floor(SAMPLE_RATE * totalDuration);

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  progressions.forEach((prog, barIdx) => {
    const barStartSec = barIdx * barSec;

    // Arpeggiate chord notes across the bar
    prog.chord.forEach((note, noteIdx) => {
      const noteTime = barStartSec + noteIdx * (barSec / prog.chord.length);
      const startSample = Math.floor(noteTime * SAMPLE_RATE);
      const freq = noteToFreq(note);
      const tone = renderTone(freq, barSec + 1.8, 0.22);
      const panL = 0.5 + Math.sin(noteIdx) * 0.3;
      const panR = 1.0 - panL;

      for (let i = 0; i < tone.length; i++) {
        const dest = (startSample + i) % totalSamples;
        left[dest] += tone[i] * panL;
        right[dest] += tone[i] * panR;
      }
    });

    // Soft warm bass pad
    const bassFreq = noteToFreq(prog.bass);
    const bassTone = renderTone(bassFreq, barSec + 0.5, 0.28);
    const bassSample = Math.floor(barStartSec * SAMPLE_RATE);
    for (let i = 0; i < bassTone.length; i++) {
      const dest = (bassSample + i) % totalSamples;
      left[dest] += bassTone[i] * 0.5;
      right[dest] += bassTone[i] * 0.5;
    }
  });

  return { left, right };
}

// Render and write files
console.log('Synthesizing Happy Birthday audio...');
const bday = generateHappyBirthday();
writeWav(path.join(__dirname, '../audio/birthday_wish.wav'), bday.left, bday.right);
writeWav(path.join(__dirname, '../audio/birthday_wish.mp3'), bday.left, bday.right);
console.log('Saved audio/birthday_wish.mp3 & .wav');

console.log('Synthesizing Romantic Background audio...');
const bg = generateRomanticBackground();
writeWav(path.join(__dirname, '../audio/bg_music.wav'), bg.left, bg.right);
writeWav(path.join(__dirname, '../audio/bg_music.mp3'), bg.left, bg.right);
console.log('Saved audio/bg_music.mp3 & .wav');

