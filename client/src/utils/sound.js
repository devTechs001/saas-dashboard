// Tiny Web Audio synth for UI sounds — no audio assets required.
// Sounds are disabled when the user turns them off in Settings → Notifications.

const isBrowser = () => typeof window !== 'undefined';

let ctx = null;

const getCtx = () => {
  if (!isBrowser()) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

export const isSoundEnabled = () => {
  if (!isBrowser()) return false;
  try {
    return localStorage.getItem('soundEnabled') !== 'false';
  } catch {
    return true; // storage blocked (private mode) — sound stays available
  }
};

export const setSoundEnabled = (enabled) => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem('soundEnabled', enabled ? 'true' : 'false');
  } catch {
    /* storage unavailable — non-critical */
  }
};

const playNotes = (notes, { type = 'sine', volume = 0.12, gap = 0.12, decay = 0.35 } = {}) => {
  const ac = getCtx();
  if (!ac) return;
  try {
    notes.forEach((freq, i) => {
      const t0 = ac.currentTime + i * gap;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + decay + 0.05);
    });
  } catch {
    /* audio is a nice-to-have — never break the UI over it */
  }
};

/** Gentle two-note "ding" for incoming notifications. */
export const playNotificationSound = () => {
  if (!isSoundEnabled()) return;
  playNotes([659.25, 880], { volume: 0.11 });
};

/** Softer tick for chat messages. */
export const playMessageSound = () => {
  if (!isSoundEnabled()) return;
  playNotes([523.25], { type: 'triangle', volume: 0.08, decay: 0.18 });
};

/** Rising three-note chime for success actions (report ready, saved). */
export const playSuccessSound = () => {
  if (!isSoundEnabled()) return;
  playNotes([523.25, 659.25, 783.99], { volume: 0.1, gap: 0.1, decay: 0.3 });
};

/** Two low notes for errors. */
export const playErrorSound = () => {
  if (!isSoundEnabled()) return;
  playNotes([220, 174.61], { type: 'square', volume: 0.07, gap: 0.14, decay: 0.25 });
};
