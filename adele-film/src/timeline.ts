export const FPS = 30;
export const TOTAL = 67 * FPS;

const s = (sec: number) => Math.round(sec * FPS);

// Scene windows in seconds. Every cut sits on a beat of the 120 BPM music (bars from 1.5s),
// and every scene plays at natural speed so on-screen text has time to be read.
export const SCENES = [
  { id: "intro", from: 0, to: 5.5 },
  { id: "problem", from: 5.5, to: 11.5 },
  { id: "logo", from: 11.5, to: 18.5 },
  { id: "call", from: 18.5, to: 35.5 },
  { id: "hub", from: 35.5, to: 42.5 },
  { id: "confirm", from: 42.5, to: 50.5 },
  { id: "list", from: 50.5, to: 57.5 },
  { id: "cta", from: 57.5, to: 67 },
].map((x) => ({ ...x, start: s(x.from), dur: s(x.to - x.from) }));

// Voice lines (public/voiceover/<file>.wav): start (seconds) and length, from tools/vo.py.
// Adele narrates in the first person; call_b and call_d are the patient on the phone.
export const VO = [
  { file: "hook", at: 0.7, dur: 3.31 },
  { file: "problem", at: 6.1, dur: 4.27 },
  { file: "intro", at: 12.2, dur: 4.2 },
  { file: "call_a", at: 20.4, dur: 3.61 },
  { file: "call_b", at: 24.35, dur: 3.18 },
  { file: "call_c", at: 27.85, dur: 3.82 },
  { file: "call_d", at: 31.95, dur: 1.75 },
  { file: "hub", at: 36.2, dur: 4.2 },
  { file: "confirm", at: 43.2, dur: 4.63 },
  { file: "list", at: 51.2, dur: 4.57 },
  { file: "cta", at: 58.2, dur: 5.18 },
].map((v) => ({ ...v, start: s(v.at) }));

export const SFX = [
  { file: "ring", at: 18.6, volume: 0.55 },
  { file: "chime", at: 33.8, volume: 0.6 },
].map((x) => ({ ...x, start: s(x.at) }));
