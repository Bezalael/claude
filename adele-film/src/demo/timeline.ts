// The demo film: "One week at Riverside Dental" (see demo/SCRIPT.md). Same conventions as ../timeline.ts:
// times in seconds, every cut on a beat of the 120 BPM music (bars from 0.5s), scenes at natural speed.
export const FPS = 30;
export const TOTAL = 7425; // 247.5s

const s = (sec: number) => Math.round(sec * FPS);

export const SCENES = [
  { id: "open", from: 0, to: 10 },
  { id: "cost", from: 10, to: 32.5 },
  { id: "how", from: 32.5, to: 47.5 },
  { id: "call", from: 47.5, to: 80.5 },
  { id: "portal", from: 80.5, to: 102.5 },
  { id: "whatsapp", from: 102.5, to: 128.5 },
  { id: "tuesday", from: 128.5, to: 142 },
  { id: "wednesday", from: 142, to: 152.5 },
  { id: "thursday", from: 152.5, to: 176.5 },
  { id: "friday", from: 176.5, to: 197.5 },
  { id: "report", from: 197.5, to: 212.5 },
  { id: "control", from: 212.5, to: 222 },
  { id: "trust", from: 222, to: 234.5 },
  { id: "cta", from: 234.5, to: 247.5 },
].map((x) => ({ ...x, start: s(x.from), dur: s(x.to - x.from) }));

// One transition per cut, in scene order (presentations are assigned in DemoVideo.tsx).
export const CUTS: { at: number; frames: number; anchor?: number }[] = [
  { at: 10, frames: 20 },
  { at: 32.5, frames: 26 },
  { at: 47.5, frames: 20 },
  { at: 80.5, frames: 16 },
  { at: 102.5, frames: 16 },
  { at: 128.5, frames: 22 },
  { at: 142, frames: 16 },
  { at: 152.5, frames: 24 },
  { at: 176.5, frames: 20 },
  { at: 197.5, frames: 22 },
  { at: 212.5, frames: 20 },
  { at: 222, frames: 16 },
  { at: 234.5, frames: 24 },
];

export const framesBefore = (c: { frames: number; anchor?: number }) => Math.round(c.frames * (c.anchor ?? 0.5));

// Voice lines (public/voiceover-demo/<file>.mp3, generated with ElevenLabs v4; see demo/vo.json). Adele is
// "Juliet"; the caller ("call_b", "call_d") is "Ollie", phone-filtered. `words` holds each word's start
// (seconds into the line); scenes cue off them so text lands on the spoken word.
export const VO = [
  { file: "open", at: 1.5, dur: 7.08, words: [0, 0.32, 0.48, 0.96, 1.12, 1.44, 2.4, 2.96, 3.28, 3.6, 3.88, 4.08, 4.24, 4.84, 4.96, 5.12, 5.52, 6.04, 6.4] },
  { file: "cost", at: 10.6, dur: 20.11, words: [0, 0.48, 1.12, 2, 2.24, 3.12, 3.44, 4.56, 4.88, 5.52, 6, 6.24, 6.56, 6.88, 7.6, 7.76, 8, 8.4, 9.52, 9.76, 10.2, 10.48, 10.64, 11.76, 12.12, 12.84, 13.04, 13.84, 14.08, 14.4, 15.12, 15.36, 15.76, 16.08, 17.2, 17.36, 17.84, 18.08, 18.32, 18.64, 18.88, 19.44] },
  { file: "how", at: 33.1, dur: 13.09, words: [0, 0.6, 0.8, 0.96, 1.2, 2.16, 2.72, 3.6, 4.16, 4.32, 4.64, 5.52, 5.68, 6, 6.24, 6.72, 6.96, 7.28, 8.24, 8.56, 8.72, 9.04, 9.96, 10.2, 10.4, 11.2, 11.48, 11.84, 12.16, 12.4] },
  { file: "call_a", at: 50.8, dur: 4.13, words: [0.08, 0.32, 0.88, 1.4, 2.24, 2.4, 2.56, 3.2, 3.36, 3.52, 3.6] },
  { file: "call_b", at: 55.3, dur: 4.52, words: [0, 0.64, 0.96, 1.12, 1.36, 1.48, 1.6, 2.32, 2.52, 2.72, 3.28, 3.44, 3.64, 3.76] },
  { file: "call_c", at: 60.1, dur: 4.6, words: [0.206, 0.32, 1.36, 1.6, 1.76, 2.28, 2.4, 2.72, 3.52, 3.72, 3.84, 4.2] },
  { file: "call_d", at: 65.0, dur: 2.35, words: [0.16, 0.56, 1.44] },
  { file: "call_e", at: 67.6, dur: 5.41, words: [0, 0.96, 1.24, 1.44, 1.52, 1.8, 2.08, 2.36, 2.48, 2.56, 3.44, 3.84, 4.4, 4.56] },
  { file: "monday", at: 73.6, dur: 4.83, words: [0, 0.96, 1.64, 1.8, 2.08, 2.56, 3.32, 3.6, 4.08] },
  { file: "portal", at: 81.1, dur: 20.19, words: [0, 0.24, 0.4, 0.8, 1.36, 1.52, 1.88, 2.16, 2.36, 2.48, 2.64, 3.12, 3.6, 3.92, 4.12, 4.24, 5.16, 5.36, 5.8, 5.92, 6.24, 6.4, 6.48, 7.12, 7.4, 7.6, 8.28, 8.4, 8.56, 9.08, 9.28, 9.6, 11.04, 11.48, 11.6, 11.84, 12.2, 12.56, 12.72, 13.08, 13.2, 13.36, 14, 14.16, 14.48, 14.68, 14.8, 15.04, 15.44, 16, 16.32, 17.2, 17.68, 18.48, 18.68, 18.88, 18.96, 19.2, 19.6] },
  { file: "whatsapp", at: 103.1, dur: 23.41, words: [0, 0.16, 0.64, 1.28, 1.52, 1.8, 2.08, 2.64, 3.6, 3.76, 4, 4.16, 4.48, 4.72, 5.44, 5.6, 6.32, 6.48, 6.8, 7.24, 7.6, 8.32, 8.6, 8.8, 9.72, 9.88, 10, 10.16, 10.4, 10.96, 11.16, 11.32, 11.68, 12.48, 12.68, 12.8, 13.76, 14, 14.32, 14.64, 14.88, 15.8, 15.92, 16.32, 16.96, 17.12, 17.52, 17.96, 18.6, 18.72, 18.88, 19.6, 19.92, 20.16, 20.96, 21.12, 21.88, 22, 22.16, 22.64] },
  { file: "tuesday", at: 129.1, dur: 11.39, words: [0, 1.28, 1.4, 1.52, 2.08, 2.56, 2.8, 3.12, 4.24, 4.44, 4.64, 4.88, 5.08, 5.2, 5.4, 5.8, 6.24, 6.84, 6.96, 7.16, 7.36, 7.76, 7.92, 8.08, 8.56, 8.72, 9.04, 9.84, 10.12, 10.4, 10.88] },
  { file: "wednesday", at: 142.6, dur: 8.52, words: [0, 1.28, 1.44, 2.16, 2.36, 2.56, 3.52, 3.92, 4.12, 4.32, 4.8, 5.12, 5.8, 6, 6.48, 6.72, 6.96, 7.12, 7.28, 7.4, 7.52, 7.76] },
  { file: "thursday", at: 153.1, dur: 22.44, words: [0, 0.6, 0.96, 1.12, 2.24, 2.4, 2.64, 3.36, 3.52, 3.68, 3.76, 4.32, 4.72, 5.2, 5.36, 6.48, 6.64, 7.12, 7.6, 7.8, 8, 8.36, 9.04, 9.44, 9.6, 10.48, 10.72, 11.64, 11.76, 11.92, 12.16, 12.32, 12.48, 13.52, 14.08, 14.64, 14.72, 15, 15.24, 15.36, 15.72, 16.48, 16.72, 17.12, 17.48, 17.68, 17.96, 18.56, 18.72, 19.04, 19.28, 19.44, 19.92, 20.52, 20.72, 21, 21.2, 21.68] },
  { file: "friday", at: 177.1, dur: 19.33, words: [0, 0.64, 0.88, 1.36, 2.08, 2.24, 2.88, 3.04, 3.28, 3.6, 3.68, 3.92, 4.32, 4.48, 5.6, 6.16, 6.6, 6.8, 7.24, 7.36, 8.08, 8.32, 8.56, 8.72, 8.88, 9.68, 9.84, 10.32, 10.48, 10.72, 11.84, 12.2, 12.32, 12.8, 13.48, 13.6, 13.76, 14.2, 14.8, 14.96, 15.92, 16.04, 16.64, 16.92, 17.04, 17.6, 17.92, 18.08, 18.16, 18.56, 18.72] },
  { file: "report", at: 198.1, dur: 12.93, words: [0, 0.36, 0.8, 1.04, 2.16, 2.48, 3.6, 3.84, 4.6, 5.28, 5.4, 5.52, 6, 6.16, 7.2, 7.36, 7.6, 8.64, 8.96, 9.76, 10.16, 10.56, 11.52, 11.84, 12.24] },
  { file: "control", at: 213.1, dur: 8.2, words: [0, 0.2, 0.56, 1.04, 1.48, 2.32, 2.64, 3.2, 3.44, 4.32, 4.48, 5.28, 5.52, 6.36, 6.48, 6.68, 6.88, 7.04, 7.44, 7.76] },
  { file: "trust", at: 222.6, dur: 11.31, words: [0, 0.32, 0.88, 1.12, 1.48, 1.6, 2.52, 2.64, 2.96, 3.28, 3.68, 4.16, 4.64, 5.68, 5.92, 6.373, 6.72, 7.2, 7.76, 8.8, 8.96, 9.84, 10.48, 10.64] },
  { file: "cta", at: 235.1, dur: 9.09, words: [0.24, 0.4, 0.56, 0.68, 0.88, 1.2, 1.76, 2.56, 3.08, 3.36, 3.52, 4, 4.32, 5.48, 6.16, 6.72, 6.92, 7.6, 7.84, 8.24, 8.4] },
].map((v) => ({ ...v, start: s(v.at) }));

/** Absolute time (seconds) of word `i` of voice line `file`. */
export const word = (file: string, i: number) => {
  const v = VO.find((x) => x.file === file)!;
  return v.at + v.words[i];
};

// Story beats that both the picture and the sound effects hit (seconds).
export const BEAT = {
  callRing: 48.6,
  callAnswer: 50.5,
  callBooked: 65.7,
  waOffer: 106.9,
  waReply: 109.6,
  waBooked: 112.7,
  tueCancel: word("tuesday", 4),
  tueOffer: word("tuesday", 9),
  tueReply: word("tuesday", 23),
  tueFilled: word("tuesday", 25),
  thuWhatsApp: word("thursday", 21),
  thuCall: word("thursday", 29),
  thuFlag: word("thursday", 37),
  thuRebook: word("thursday", 51),
};

// The "Chairs filled this week" counter: running total after each step (an example week).
export const CHAIRS: { at: number; total: number }[] = [
  { at: word("monday", 1), total: 1 }, // the 8am new patient
  { at: word("portal", 17), total: 6 }, // weekend and early-morning bookings
  { at: BEAT.waBooked, total: 7 }, // the WhatsApp enquiry
  { at: BEAT.tueFilled, total: 8 }, // Tuesday's cancellation refilled
  { at: BEAT.thuRebook, total: 9 }, // a missed visit rebooked
  { at: word("friday", 24), total: 32 }, // recall bookings (counted up over the following seconds)
];
export const RECALL_COUNT_END = word("friday", 39);

export const SFX = [
  { file: "ring", at: 0.5, volume: 0.5 },
  { file: "ring", at: 3.5, volume: 0.32 },
  { file: "ring", at: 6.5, volume: 0.22 },
  { file: "ring", at: BEAT.callRing, volume: 0.5 },
  { file: "chime", at: BEAT.callBooked, volume: 0.5 },
  { file: "pop", at: BEAT.waOffer, volume: 0.45 },
  { file: "pop", at: BEAT.waReply, volume: 0.45 },
  { file: "chime", at: BEAT.waBooked, volume: 0.45 },
  { file: "pop", at: BEAT.tueOffer, volume: 0.45 },
  { file: "pop", at: BEAT.tueReply, volume: 0.45 },
  { file: "chime", at: BEAT.tueFilled, volume: 0.5 },
  { file: "pop", at: BEAT.thuWhatsApp, volume: 0.4 },
  { file: "chime", at: BEAT.thuRebook, volume: 0.45 },
].map((x) => ({ ...x, start: s(x.at) }));

const ramp = (x: number, xs: number[], ys: number[]) => {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1]);
  }
  return ys[ys.length - 1];
};

/** Music volume at frame f: a bed under a four-minute voiceover, ducking further while Adele speaks. */
export const musicVolume = (f: number) => {
  const t = f / FPS;
  let duck = 0;
  for (const v of VO) duck = Math.max(duck, ramp(t, [v.at - 0.35, v.at, v.at + v.dur, v.at + v.dur + 0.6], [0, 1, 1, 0]));
  const fade = ramp(f, [0, FPS, TOTAL - 2 * FPS, TOTAL], [0, 1, 1, 0]);
  return (0.3 - 0.19 * duck) * fade;
};
