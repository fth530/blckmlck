/**
 * Generates minimal WAV sound effects for Block Dash.
 * Run: node scripts/generate-sounds.js
 * Output: assets/sounds/*.wav
 */

const fs = require('fs');
const path = require('path');

function u32le(buf, offset, v) {
  buf[offset]     =  v        & 0xff;
  buf[offset + 1] = (v >>  8) & 0xff;
  buf[offset + 2] = (v >> 16) & 0xff;
  buf[offset + 3] = (v >> 24) & 0xff;
}

function u16le(buf, offset, v) {
  buf[offset]     =  v       & 0xff;
  buf[offset + 1] = (v >> 8) & 0xff;
}

/**
 * @param {number[]} notes  [{freq, dur}] — played in sequence
 * @param {number}   volume 0..1
 * @param {'sine'|'square'|'triangle'} wave
 */
function generateWav(notes, volume = 0.4, wave = 'sine') {
  const SR = 22050;
  const totalSamples = notes.reduce((s, n) => s + Math.floor(SR * n.dur), 0);
  const buf = Buffer.alloc(44 + totalSamples * 2);

  // RIFF / fmt header
  buf.write('RIFF', 0);
  u32le(buf, 4, 36 + totalSamples * 2);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  u32le(buf, 16, 16);
  u16le(buf, 20, 1);      // PCM
  u16le(buf, 22, 1);      // mono
  u32le(buf, 24, SR);
  u32le(buf, 28, SR * 2);
  u16le(buf, 32, 2);
  u16le(buf, 34, 16);
  buf.write('data', 36);
  u32le(buf, 40, totalSamples * 2);

  let sampleIdx = 0;
  for (const { freq, dur } of notes) {
    const n = Math.floor(SR * dur);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const fade = Math.pow(1 - i / n, 0.4);
      const phase = 2 * Math.PI * freq * t;
      let s;
      if (wave === 'square')   s = Math.sign(Math.sin(phase));
      else if (wave === 'triangle') s = (2 / Math.PI) * Math.asin(Math.sin(phase));
      else                     s = Math.sin(phase);
      const val = Math.round(s * fade * volume * 32767);
      const clamped = Math.max(-32768, Math.min(32767, val));
      u16le(buf, 44 + sampleIdx * 2, clamped < 0 ? clamped + 65536 : clamped);
      sampleIdx++;
    }
  }

  return buf;
}

const SOUNDS = {
  // Short satisfying click when piece lands
  place: generateWav([{ freq: 480, dur: 0.07 }], 0.35),

  // Rising two-note chime for line clear
  clear: generateWav([{ freq: 600, dur: 0.1 }, { freq: 900, dur: 0.18 }], 0.45),

  // Higher triple chime for combo
  combo: generateWav([
    { freq: 660, dur: 0.08 },
    { freq: 880, dur: 0.08 },
    { freq: 1100, dur: 0.16 },
  ], 0.5),

  // Low square buzz for invalid placement
  invalid: generateWav([{ freq: 180, dur: 0.1 }], 0.2, 'square'),

  // Descending sad tone for game over
  gameover: generateWav([
    { freq: 440, dur: 0.2 },
    { freq: 330, dur: 0.2 },
    { freq: 220, dur: 0.35 },
  ], 0.4),

  // Tiny soft blip when dragging starts
  select: generateWav([{ freq: 520, dur: 0.04 }], 0.18),

  // Ascending arpeggio for level-up (C5→E5→G5→C6)
  levelup: generateWav([
    { freq: 523, dur: 0.06 },
    { freq: 659, dur: 0.06 },
    { freq: 784, dur: 0.06 },
    { freq: 1047, dur: 0.14 },
  ], 0.45, 'triangle'),

  // Fanfare for new high score (G4→B4→D5→G5→B5, dramatic & sustained)
  highscore: generateWav([
    { freq: 392, dur: 0.09 },
    { freq: 494, dur: 0.09 },
    { freq: 587, dur: 0.09 },
    { freq: 784, dur: 0.12 },
    { freq: 988, dur: 0.28 },
  ], 0.5),

  // Achievement chime for daily challenge complete (E5→G5→C6)
  challenge: generateWav([
    { freq: 659, dur: 0.08 },
    { freq: 784, dur: 0.08 },
    { freq: 1047, dur: 0.2 },
  ], 0.4, 'triangle'),
};

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

for (const [name, buf] of Object.entries(SOUNDS)) {
  const file = path.join(outDir, `${name}.wav`);
  fs.writeFileSync(file, buf);
  console.log(`✓ ${name}.wav  (${buf.length} bytes)`);
}

console.log(`\nSounds written to: ${outDir}`);
