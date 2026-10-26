export const FPS = 30;
export const TOTAL = 90 * FPS;

const s = (sec: number) => Math.round(sec * FPS);

// Scene windows in seconds. Every cut sits on a beat of the 120 BPM music (bars from 0.5s), and every
// scene plays at natural speed. Slots leave room for the slower ElevenLabs takes as well as the Kokoro ones.
export const SCENES = [
  { id: "intro", from: 0, to: 5.5 },
  { id: "problem", from: 5.5, to: 12.5 },
  { id: "logo", from: 12.5, to: 19.5 },
  { id: "call", from: 19.5, to: 38.5 },
  { id: "whatsapp", from: 38.5, to: 52.5 },
  { id: "hub", from: 52.5, to: 59.5 },
  { id: "confirm", from: 59.5, to: 67 },
  { id: "list", from: 67, to: 74 },
  { id: "clock", from: 74, to: 80.5 },
  { id: "cta", from: 80.5, to: 90 },
].map((x) => ({ ...x, start: s(x.from), dur: s(x.to - x.from) }));

// Voice lines (public/voiceover/<file>.wav): start (seconds) and length, from tools/vo.py.
// Adele narrates in the first person; call_b and call_d are the patient on the phone.
export const VO = [
  { file: "hook", at: 0.6, dur: 3.31 },
  { file: "problem", at: 6.0, dur: 4.27 },
  { file: "intro", at: 13.2, dur: 4.2 },
  { file: "call_a", at: 21.4, dur: 3.61 },
  { file: "call_b", at: 25.8, dur: 3.18 },
  { file: "call_c", at: 29.9, dur: 3.82 },
  { file: "call_d", at: 35.1, dur: 1.75 },
  { file: "whatsapp", at: 39.3, dur: 5.67 },
  { file: "hub", at: 53.2, dur: 4.2 },
  { file: "confirm", at: 60.1, dur: 4.63 },
  { file: "list", at: 67.7, dur: 4.57 },
  { file: "clock", at: 74.6, dur: 3.52 },
  { file: "cta", at: 81.2, dur: 5.18 },
].map((v) => ({ ...v, start: s(v.at) }));

export const SFX = [
  { file: "ring", at: 19.6, volume: 0.55 },
  { file: "chime", at: 37.6, volume: 0.6 },
  { file: "pop", at: 38.9, volume: 0.5 }, // cancellation arrives
  { file: "pop", at: 40.6, volume: 0.45 }, // Adele's WhatsApp offer
  { file: "pop", at: 43.6, volume: 0.45 }, // patient replies
  { file: "pop", at: 44.8, volume: 0.45 }, // Adele confirms
  { file: "chime", at: 45.5, volume: 0.5 }, // gap filled
].map((x) => ({ ...x, start: s(x.at) }));
