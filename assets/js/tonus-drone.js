/**
 * Tônus drone — shared Web Audio bed (panel Sininho + página Tônus).
 */

const state = {
  ctx: null,
  master: null,
  nodes: [],
  timers: [],
  playing: false,
  volume: Number(localStorage.getItem("rem-music-volume") || 0.7),
};

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(state.playing));
}

function createNoiseBuffer(ctx, seconds = 2) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

function addTone(ctx, destination, { freq, type = "sine", gain = 0.04, detune = 0 }) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  g.gain.value = 0;
  osc.connect(g);
  g.connect(destination);
  osc.start();
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 2.5);
  state.nodes.push(osc, g);
}

function startBreathLfo(ctx, targetGain, depth = 0.012, period = 10) {
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 1 / period;
  lfoGain.gain.value = depth;
  lfo.connect(lfoGain);
  lfoGain.connect(targetGain.gain);
  lfo.start();
  state.nodes.push(lfo, lfoGain);
}

export function isPlaying() {
  return state.playing;
}

export function getVolume() {
  return state.volume;
}

export function setVolume(value) {
  state.volume = Number(value);
  localStorage.setItem("rem-music-volume", String(state.volume));
  if (state.master && state.playing && state.ctx) {
    state.master.gain.setTargetAtTime(state.volume, state.ctx.currentTime, 0.05);
  }
}

export function onPlayingChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function start() {
  if (state.playing) return true;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return false;

  if (!state.ctx) state.ctx = new AudioCtx();
  const ctx = state.ctx;
  if (ctx.state === "suspended") ctx.resume();

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  state.master = master;
  state.nodes = [master];

  const pad = ctx.createGain();
  pad.gain.value = 0.7;
  pad.connect(master);

  addTone(ctx, pad, { freq: 110, type: "sine", gain: 0.045 });
  addTone(ctx, pad, { freq: 164.81, type: "sine", gain: 0.028, detune: -4 });
  addTone(ctx, pad, { freq: 220, type: "triangle", gain: 0.012, detune: 3 });
  addTone(ctx, pad, { freq: 329.63, type: "sine", gain: 0.008 });

  startBreathLfo(ctx, pad, 0.015, 10);

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 3);
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.7;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.016;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();
  state.nodes.push(noise, filter, noiseGain);

  const chime = () => {
    if (!state.playing || !state.ctx) return;
    const t = state.ctx.currentTime;
    const o = state.ctx.createOscillator();
    const g = state.ctx.createGain();
    o.type = "sine";
    o.frequency.value = 523.25 + Math.random() * 40;
    g.gain.value = 0;
    o.connect(g);
    g.connect(master);
    g.gain.linearRampToValueAtTime(0.01, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
    o.start(t);
    o.stop(t + 4);
  };
  const chimeTimer = window.setInterval(chime, 14000 + Math.random() * 8000);
  state.timers.push(chimeTimer);
  window.setTimeout(chime, 4000);

  master.gain.linearRampToValueAtTime(state.volume, ctx.currentTime + 2.2);
  state.playing = true;
  notify();
  return true;
}

export function stop() {
  if (!state.playing || !state.ctx || !state.master) {
    state.playing = false;
    notify();
    return;
  }

  const ctx = state.ctx;
  const master = state.master;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 1.2);

  state.timers.forEach((id) => window.clearInterval(id));
  state.timers = [];
  state.playing = false;
  notify();

  window.setTimeout(() => {
    state.nodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop();
      } catch {
        /* already stopped */
      }
      try {
        node.disconnect();
      } catch {
        /* noop */
      }
    });
    state.nodes = [];
    state.master = null;
    notify();
  }, 1300);
}

export function toggle() {
  if (state.playing) stop();
  else start();
}
