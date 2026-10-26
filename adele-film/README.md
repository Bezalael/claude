# Adele Care: 60-second demo film

A Remotion project (4.0.539) styled after a modern product film (white canvas, glowing gradient clouds, bold kinetic type, rolling lists, floating UI cards), in Adele Care brand colours: navy and blue lead, orange is the accent.

## Run it

```
npm i
npm run dev        # Remotion Studio preview
npm run render     # out/adele-care-60s.mp4 (1920x1080, 30fps, H.264, yuv420p)
```

## Structure

- `src/timeline.ts`: scene windows, per-scene animation speed, and voiceover start times (seconds). Change timings here.
- `src/scenes.tsx`: the 9 scenes (intro, problem, logo, channels, booking, hub, confirm, list, cta).
- `src/ui.tsx`: shared pieces (gradient blob, kinetic words, rolling list, glow card, chat bubbles, logo).
- `src/AdeleVideo.tsx`: places scenes with soft blur crossfades, adds voice lines and the music bed, ducking the music under the voice.

## Audio

- Voice: `tools/vo.py`, Kokoro (Apache 2.0), British voice `bf_emma` at speed 1.0. Output in `public/voiceover/`.
  ```
  pip install kokoro-onnx soundfile
  # download kokoro-v1.0.onnx and voices-v1.0.bin (huggingface.co/fastrtc/kokoro-onnx) into <model_dir>
  python tools/vo.py <model_dir> bf_emma 1.0
  ```
  If you change a line, update its length in `VO` in `src/timeline.ts`. For a male voice, try `bm_george`.
- Music: `tools/music.py` composes an original upbeat 120 BPM track in code, with every scene cut on a downbeat, so there is no licence or attribution to manage. Convert its WAV to `public/music.mp3` with ffmpeg (see the script header). To use a library track instead, drop it in `public/` and change the `staticFile` path in `AdeleVideo.tsx`.

## Script

| Time | On screen | Voice |
|---|---|---|
| 0-5.5s | Kinetic headline, ringing phone | Your practice was built on care. Not on answering the phone. |
| 5.5-11.5s | Rolling list of pressures, phone filling with missed calls | But the chair is full, the phone keeps ringing, and recalls slip when the team is stretched. |
| 11.5-17.5s | Logo reveal (music drop) | Meet Adele. The AI receptionist for UK dental practices. |
| 17.5-23.5s | Calls / WhatsApp / Web chat, with a live UI card for each | She answers calls, WhatsApp and web chat, in a warm, natural voice. |
| 23.5-29.5s | Chat booking a check-up, diary slot fills, deposit paid | She books straight into your diary, follows your booking rules, and takes the deposit. |
| 29.5-35.5s | Channels orbiting Adele, flowing into "Your PMS" | Every channel runs through one assistant, and straight into your PMS. |
| 35.5-43.5s | Confirmations list, one exception flagged | She asks every patient to confirm. Your team only steps in if there's still no reply. |
| 43.5-49.5s | Rolling list of outreach tasks | And she works your patient list too. Missed enquiries, recalls, and lapsed patients. |
| 49.5-60s | Typed URL pill, apply button, end logo | See Adele on a real practice day. Apply for a pilot place at adelecare.co.uk. |

## Before external use

- Patient names, phone numbers and the "Riverside Dental" practice are illustrative placeholders.
- The `AdeleCare` wordmark is set in Urbanist as a stand-in. Put the supplied logo files in `public/brand/` and swap them into `Logo` in `src/ui.tsx`.
- The PMS is not named. Confirm partner status before naming one (for example Dentally).
- Remotion is free for companies of up to 3 people. Larger companies need a Remotion company licence.
