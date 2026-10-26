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

// Voice lines (public/voiceover/<file>.mp3): start (seconds) and length. Generated with ElevenLabs v4 through
// Creative Claw: Adele is "Juliet", the patient on the call ("call_b", "call_d") is "Ollie", phone-filtered.
// `words` are each word's start (seconds into the line) from the generation's word timings; scenes cue off them.
export const VO = [
  { file: "hook", at: 0.4, dur: 4.52, words: [0, 0.32, 0.96, 1.32, 1.52, 1.76, 2.8, 3.04, 3.24, 3.68, 3.84] },
  { file: "problem", at: 5.8, dur: 6.19, words: [0, 0.2, 0.32, 0.72, 0.96, 1.76, 2.0, 2.24, 2.56, 3.36, 3.6, 4.16, 4.64, 4.76, 4.88, 5.2, 5.36] },
  { file: "intro", at: 13.2, dur: 4.91, words: [0.46, 0.72, 0.88, 1.68, 2.0, 2.24, 3.12, 3.28, 3.68, 4.04] },
  { file: "call_a", at: 21.0, dur: 4.13, words: [0.08, 0.32, 0.88, 1.4, 2.24, 2.4, 2.56, 3.2, 3.36, 3.52, 3.6] },
  { file: "call_b", at: 25.4, dur: 3.55, words: [0, 0.76, 1.12, 1.44, 1.64, 2.4, 2.56, 2.72, 2.88, 3.12] },
  { file: "call_c", at: 29.3, dur: 5.96, words: [0.24, 0.64, 1.36, 1.68, 2.88, 3.04, 3.2, 3.32, 3.44, 3.6, 4.24, 4.96, 5.2, 5.36, 5.52] },
  { file: "call_d", at: 35.6, dur: 2.35, words: [0.16, 0.56, 1.44] },
  { file: "whatsapp", at: 39.3, dur: 6.77, words: [] as number[] },
  { file: "hub", at: 53.2, dur: 5.25, words: [] as number[] },
  { file: "confirm", at: 60.1, dur: 5.64, words: [] as number[] },
  { file: "list", at: 67.5, dur: 5.96, words: [] as number[] },
  { file: "clock", at: 74.6, dur: 5.41, words: [] as number[] },
  { file: "cta", at: 80.9, dur: 6.19, words: [] as number[] },
].map((v) => ({ ...v, start: s(v.at) }));

export const SFX = [
  { file: "ring", at: 19.7, volume: 0.55 },
  { file: "chime", at: 37.05, volume: 0.6 }, // booked
  { file: "pop", at: 38.9, volume: 0.5 }, // cancellation arrives
  { file: "pop", at: 41.6, volume: 0.45 }, // Adele's WhatsApp offer
  { file: "pop", at: 44.4, volume: 0.45 }, // patient replies
  { file: "pop", at: 45.4, volume: 0.45 }, // Adele confirms
  { file: "chime", at: 46.0, volume: 0.5 }, // gap filled
].map((x) => ({ ...x, start: s(x.at) }));
