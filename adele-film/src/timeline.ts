export const FPS = 30;
export const TOTAL = 90 * FPS;

const s = (sec: number) => Math.round(sec * FPS);

// Scene windows in seconds. Neighbouring scenes overlap by OVERLAP for a soft crossfade.
export const OVERLAP = 12;
export const SCENES = [
  { id: "intro", from: 0, to: 8 },
  { id: "problem", from: 8, to: 17 },
  { id: "logo", from: 17, to: 25 },
  { id: "channels", from: 25, to: 35 },
  { id: "booking", from: 35, to: 45 },
  { id: "hub", from: 45, to: 54 },
  { id: "confirm", from: 54, to: 63 },
  { id: "list", from: 63, to: 72 },
  { id: "clock", from: 72, to: 79 },
  { id: "cta", from: 79, to: 90 },
].map((x) => ({ ...x, start: s(x.from), dur: s(x.to - x.from) }));

// Voiceover line starts (seconds) and lengths, from tools/vo.py with bf_emma at 0.95.
export const VO = [
  { at: 1.2, dur: 3.37 },
  { at: 9.0, dur: 4.35 },
  { at: 18.3, dur: 3.82 },
  { at: 26.0, dur: 3.8 },
  { at: 36.0, dur: 4.29 },
  { at: 46.0, dur: 4.18 },
  { at: 55.0, dur: 5.06 },
  { at: 64.0, dur: 4.76 },
  { at: 73.0, dur: 2.67 },
  { at: 80.5, dur: 5.53 },
].map((v) => ({ ...v, start: s(v.at) }));
