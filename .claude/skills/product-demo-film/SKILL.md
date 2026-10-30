---
name: product-demo-film
description: Make a polished 60-90 second product demo film in Remotion, in the style of the Adele Care film (white canvas, glowing gradient clouds, bold kinetic type, rolling lists, floating UI cards, Apple-clean transitions on the beat), with an ElevenLabs voiceover synced word by word, original music, and a verified MP4 that plays on phones and WhatsApp. Use when asked to make, edit, re-voice or re-render a product, SaaS or explainer video, or to change a line, scene or channel list in the Adele Care film.
---

# Product demo film (Remotion)

The reference build is `adele-film/` in this repo. Start a new film by copying it, not from scratch: the
timeline, transitions, render tool and audio tools are all reusable. Read `adele-film/README.md` first.

## The look (what the user loved)

- 80% modern product-film style, 20% brand: white canvas, soft gradient "blob" clouds, big kinetic
  headlines (words rise in one by one, one or two words in the brand gradient), rolling lists with an
  active row, floating glow cards and phone mock-ups. Only the colours come from the brand.
- Brand colours as tokens in `src/ui.tsx` (`C`): Adele Care uses navy #12304F, blue #1F5F96,
  sky #4A9AD0, orange #E0732A, peach #F2A766. Trace the supplied logo to SVG (`tools/trace_logo.py`) so
  it can draw on, fill and fly through.
- Transitions are clean Apple-style camera moves, one per cut, each landing on a music beat:
  zoom-through, shrink-to-app-icon, fly through the logo, push with motion blur, card lift, iris,
  focus pull (`src/transitions.tsx`). Never a plain crossfade.
- Show the product working, not just claims: a live phone call with a typed transcript, a WhatsApp chat
  that fills a cancelled slot, a diary, a confirmations list, a clock running through the day.

## Pacing rules

- 90 s is the sweet spot for a full story; 60 s if asked. Nothing may feel rushed to read: about one
  idea per 6-7 s, a caption on screen at least 1.5 s, voice lines ending before the cut.
- Every cut sits on a beat of the 120 BPM music (bars from 0.5 s). Scene windows, cuts and voice
  starts all live in `src/timeline.ts` (`SCENES`, `CUTS`, `VO`, `SFX`).

## Voice

- Generate with Creative Claw `generate_speech`, model `speech/elevenlabs-v4`. Adele is "Juliet"
  `QJksobp1edMNvmwcG5lm` (warm British female, first person); the caller is "Ollie" `jRAAK67SEFE9m7ci5DhD`,
  phone-filtered in ffmpeg (`highpass=f=320,lowpass=f=3300` plus light compression).
- Say acronyms with IPA, e.g. `your /piː ɛm ɛs/` for PMS. Audio tags like `[warmly]` work in v4.
- `check_job` returns per-word timings. Put each word's start (seconds into the line) in that line's
  `VO[].words`; scenes cue on-screen text off them with `useWordCues()` / `cue(seconds)`, so text always
  lands on the spoken word. Re-derive cues whenever a line changes.
- Generate one line at a time (parallel calls hit rate limits). A line costs about 2 credits; only
  regenerate lines that changed. Download each to `public/voiceover/<key>.mp3` and set `dur`.
- Never accept an API key pasted in chat; ask the user to revoke it. Offline drafts: `tools/vo.py` (Kokoro).

## Music and sound

- `tools/music.py` composes an original 120 BPM track in numpy (no licence needed), soft under the
  call, breakdown under the clock, drop for the call to action. `tools/sfx.py` makes the UK phone ring,
  chime and chat pop. `musicVolume()` in `timeline.ts` ducks music under every voice line.

## Changing a line or scene (the usual request)

1. Offer 3-4 alternative wordings of similar length (so timing holds) with a recommendation; get a pick.
2. Regenerate only the changed voice lines; update `VO` (`at`, `dur`, `words`) so each line ends before
   its scene's outgoing transition.
3. Update the scene in `src/scenes.tsx`, cueing every element to word timings, plus the README script
   table and `tools/vo.py`.
4. Render check stills of the changed moments and look at them before the full render:
   `npx remotion still <bundle> AdeleCare out.png --frame=<n>` (use the Chromium path below).
5. `python3 tools/render.py <scene ids>` re-renders only the segments showing those scenes, mixes
   audio, encodes once and verifies. Run it in the background (10-20 min on 4 cores).

## Longer demo films

- `adele-film/src/demo/` is a 4-minute story-led demo built from the same parts: a chapter label per day,
  a running counter that pays off in the final report, and one worked example per workflow. Copy its
  pattern for any film over 2 minutes: one protagonist or setting, a problem in act 1, examples in act 2,
  the payoff and invitation in act 3.
- `tools/music.py` takes a plan per film (`PLANS`): sections, crashes, risers and rolls. Add a plan rather
  than copying the script.
- `tools/render.py --film demo` renders it; add new films to `FILMS` in that file.

## Rendering and verification (`tools/render.py`)

- Segment cache split after each transition; segments are CRF 10 mezzanine files, the film is one
  continuous libx264 encode (slow, CRF 18, High profile, level 4.0, yuv420p, BT.709, +faststart).
- Checks that must pass: exact frame count; every join compared by exact frame index against a fresh
  still (PSNR >= 30 dB, no shifted neighbour); High profile at level <= 4.1; audio with no timeline jumps.
- Audio is Remotion's own mix, mastered to -16 LUFS / -1.5 dBTP with two-pass loudnorm followed by
  `asetpts=N/SR/TB`.
- Sharing copy `out/adele-care-share.mp4`: two-pass 1150 kbps, under 15 MB, so it stays under
  WhatsApp's 16 MB inline video limit and plays in the chat with sound.
- Chromium for Remotion here: `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## Delivery

- Deliver the MP4 itself with SendUserFile (`display: "attach"`): the small copy for WhatsApp/email and
  the master for web/editing. Commit both to the branch. Don't rely on an in-app or artifact video
  player as the deliverable.
- If a Windows player says "We can't find an audio playback device (0x8889000F)", the PC has no working
  sound output; the file is fine. Fix: connect or choose an output in Settings > System > Sound, or restart.

## Gotchas learned the hard way

- loudnorm falls back to dynamic mode when linear gain would clip and stamps its final 3 s flush about
  0.1 s late: a dropout and late audio at the end. Always follow it with `asetpts=N/SR/TB`.
- x264 `slow` at 1080p picks enough reference frames for level 5.0, which many phones refuse: pin
  `-profile:v high -level:v 4.0`.
- An SVG `linearGradient` in default bounding-box units paints nothing on a perfectly flat line; use
  `gradientUnits="userSpaceOnUse"` with explicit x1/x2.
- Muxed VP9+Opus WebM fails in Media Source Extensions; separate tracks work (only matters for web players).
- Don't `pkill -f` patterns that match your own shell; stop background jobs with TaskStop.
- Placeholders: fictional practice and patient names, phone numbers from Ofcom's 07700 900xxx drama range.
  Remotion is free for companies of up to 3 people; larger ones need a company licence.
