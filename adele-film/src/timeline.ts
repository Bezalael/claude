export const FPS = 30;
export const TOTAL = 60 * FPS;

const s = (sec: number) => Math.round(sec * FPS);

// Scene windows in seconds; every cut lands on a downbeat of the 120 BPM music (bars from 1.5s).
// `speed` runs a scene's own animation clock faster so its choreography fits the slot.
// Neighbouring scenes overlap by OVERLAP frames for a soft crossfade.
export const OVERLAP = 12;
export const SCENES = [
  { id: "intro", from: 0, to: 5.5, speed: 1.3 },
  { id: "problem", from: 5.5, to: 11.5, speed: 1.5 },
  { id: "logo", from: 11.5, to: 17.5, speed: 1.3 },
  { id: "channels", from: 17.5, to: 23.5, speed: 1.6 },
  { id: "booking", from: 23.5, to: 29.5, speed: 1.6 },
  { id: "hub", from: 29.5, to: 35.5, speed: 1.5 },
  { id: "confirm", from: 35.5, to: 43.5, speed: 1.1 },
  { id: "list", from: 43.5, to: 49.5, speed: 1.5 },
  { id: "cta", from: 49.5, to: 60, speed: 1.05 },
].map((x) => ({ ...x, start: s(x.from), dur: s(x.to - x.from) }));

// Voiceover line starts (seconds) and lengths, from tools/vo.py with bf_emma at 1.0.
export const VO = [
  { at: 0.7, dur: 3.31 },
  { at: 6.1, dur: 4.27 },
  { at: 12.3, dur: 3.71 },
  { at: 18.0, dur: 3.71 },
  { at: 24.1, dur: 4.16 },
  { at: 30.2, dur: 4.12 },
  { at: 36.2, dur: 4.97 },
  { at: 44.1, dur: 4.63 },
  { at: 50.4, dur: 5.42 },
].map((v) => ({ ...v, start: s(v.at) }));
