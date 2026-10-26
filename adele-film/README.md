# Adele Care: 67-second demo film

A Remotion project (4.0.539). The look follows a modern product film (white canvas, glowing gradient clouds, bold kinetic type, rolling lists, floating UI cards) in Adele Care brand colours: navy and blue lead, orange is the accent. Transitions are clean, Apple-style camera moves, each landing on a beat of the music.

## Run it

```
npm i
npm run dev        # Remotion Studio preview
npm run render     # out/adele-care.mp4 (1920x1080, 30fps, H.264, yuv420p)
```

## Structure

- `src/timeline.ts`: scene windows, voice line starts and sound effects (seconds). Change timings here.
- `src/scenes.tsx`: the 8 scenes. Cues use `cue(seconds)` on the absolute clock, so they stay in sync with the voice.
- `src/transitions.tsx`: the transitions (zoom-through, shrink-to-app-icon, fly through the logo, push with motion blur, card lift, iris, focus pull).
- `src/brand.tsx`: the vector symbol (draw-on, gradient fill, sheen), wordmark, lockup and animated logo reveal.
- `src/brandPath.ts`: the symbol traced from `public/brand/symbol.png` by `tools/trace_logo.py`.
- `src/AdeleVideo.tsx`: places scenes and transitions on the timeline and mixes voice, music and sound effects, ducking the music under speech.
- `public/brand/`: the supplied logo files.

## Audio

- Voice: `tools/vo.py` uses Kokoro (Apache 2.0). Adele narrates in the first person with British voice `bf_emma`. The patient on the call is `bm_george`, filtered to sound like a phone line.
  ```
  pip install kokoro-onnx soundfile
  # download kokoro-v1.0.onnx and voices-v1.0.bin (huggingface.co/fastrtc/kokoro-onnx) into <model_dir>
  python tools/vo.py <model_dir>
  ```
  If a line's length changes, update it in `VO` in `src/timeline.ts`.
- Music: `tools/music.py` composes an original 120 BPM track in code (no licence or attribution needed). It goes soft under the phone call and every cut lands on a beat. Convert its WAV to `public/music.mp3` with ffmpeg (see the script header).
- Sound effects: `tools/sfx.py` makes the UK phone ring and the "booked" chime.

## Script

| Time | Scene | Voice |
|---|---|---|
| 0-5.5s | Kinetic headline, ringing phone | Your practice was built on care. Not on answering the phone. |
| 5.5-11.5s | Rolling list of pressures, phone filling with missed calls | But the chair is full, the phone keeps ringing, and recalls slip when the team is stretched. |
| 11.5-18.5s | The day shrinks into the app icon, which opens into the logo | Hi, I'm Adele. The AI receptionist for UK dental practices. |
| 18.5-35.5s | A patient calls. Adele answers, checks the diary and books them, with a live transcript | (the call itself) |
| 35.5-42.5s | Channels orbiting Adele, flowing into "Your PMS" | I answer calls, WhatsApp and web chat, and book straight into your PMS. |
| 42.5-50.5s | Confirmations list, one exception flagged | I ask every patient to confirm. Your team only steps in if there's no reply. |
| 50.5-57.5s | Rolling list of outreach tasks | And I work your patient list too. Missed enquiries, recalls, and lapsed patients. |
| 57.5-67s | Typed URL, apply button, logo builds itself | See me on a real practice day. Apply for a pilot place at adelecare.co.uk. |

## Before external use

- Patient names, phone numbers, "Dr Shah" and "Riverside Dental" are illustrative placeholders.
- The PMS is not named. Confirm partner status before naming one (for example Dentally).
- Remotion is free for companies of up to 3 people. Larger companies need a Remotion company licence.
