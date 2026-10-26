"""Compose the 60s music bed from scratch (original, no licence needed).

usage: python tools/music.py  -> public/music.wav
then: ffmpeg -i public/music.wav -b:a 192k public/music.mp3

Upbeat 120 BPM pop-house: four-on-the-floor kick, claps, offbeat hats,
syncopated chord stabs and a bouncing bass, all pumping against the kick.
Bars start at 1.5s and every scene cut (5.5, 11.5, 17.5, 23.5, 29.5, 35.5, 43.5, 49.5s) lands on a downbeat.
Shape: build (0-5.5s), kick in (5.5s), full drop on the logo (11.5s), short breakdown into the
call to action (49.5-51.5s), back in (51.5s), ring out (57.5-60s).
"""
import numpy as np
import soundfile as sf

SR = 44100
DUR = 60.0
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
OFFSET = 1.5  # first downbeat
N = int(SR * DUR)
rng = np.random.default_rng(11)

music = np.zeros((N, 2))  # harmonic parts, pumped by the kick
drums = np.zeros((N, 2))


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(buf, sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i] * gain
    buf[i : i + len(sig), 0] += sig * np.sqrt(0.5 * (1 - pan))
    buf[i : i + len(sig), 1] += sig * np.sqrt(0.5 * (1 + pan))


def tvec(dur):
    return np.arange(int(dur * SR)) / SR


def saw(f, t, harmonics=14):
    s = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if f * k > 12000:
            break
        s += np.sin(2 * np.pi * f * k * t) / k
    return s


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # short notes only, so the loop stays cheap
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def stab(notes, dur=0.32, bright=1.0):
    t = tvec(dur)
    s = sum(saw(hz(m) * (1 + d), t, 10) for m in notes for d in (-0.004, 0.004))
    s = lowpass(s, 1800 + 2600 * bright)
    return s * np.exp(-t * 9) * np.minimum(1, t / 0.003) / len(notes)


def pad(notes, dur):
    t = tvec(dur)
    s = sum(np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(4 * np.pi * hz(m) * t) for m in notes)
    return s * np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4) / len(notes)


def bass(m, dur=0.22):
    t = tvec(dur)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * saw(f, t, 6)
    return s * np.minimum(1, t / 0.004) * np.exp(-t * 6)


def bell(m, dur=1.0):
    t = tvec(dur)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t + 1.2 * np.exp(-t * 5) * np.sin(2 * np.pi * 3.5 * f * t))
    return s * np.exp(-t * 3.5) * np.minimum(1, t / 0.002)


def kick():
    t = tvec(0.4)
    ph = 2 * np.pi * np.cumsum(50 + 110 * np.exp(-t * 35)) / SR
    return np.tanh(2 * np.sin(ph) * np.exp(-t * 8))


def noise_hit(dur, decay, hp=True):
    t = tvec(dur)
    n = rng.standard_normal(len(t))
    if hp:
        n = np.diff(n, prepend=0)
    return n * np.exp(-t * decay)


def clap():
    t = tvec(0.3)
    n = np.diff(rng.standard_normal(len(t)), prepend=0)
    env = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, 0.011, 0.022)) + 0.6 * np.exp(-t * 14)
    return lowpass(n, 5000) * env


def crash():
    return noise_hit(2.2, 2.0) * 0.6


def riser(dur):
    t = tvec(dur)
    n = rng.standard_normal(len(t))
    sweep = lowpass(n, 6000) * (t / dur) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1200 * (t / dur) ** 2) / SR) * (t / dur) ** 3 * 0.3
    return sweep + tone


# A major, I-V-vi-IV, one chord per bar: (stab voicing, bass root)
prog = [
    ([69, 73, 76, 81], 45),  # A
    ([68, 71, 76, 80], 40),  # E
    ([69, 73, 78, 81], 42),  # F#m
    ([69, 74, 78, 81], 38),  # D
]
STAB_RHYTHM = [0, 1.5, 2.5, 3.5]  # beats, syncopated
STAB_RHYTHM_B = [0, 0.75, 1.5, 2.5, 3, 3.5]
BASS_RHYTHM = [0.5, 1.5, 2.5, 3.5]  # offbeat bounce
HOOK = [(0, 81), (0.5, 83), (1, 85), (2, 81), (2.5, 78), (3, 76)]  # bell motif


def section(t):
    if t < 5.5:
        return "build"
    if t < 11.5:
        return "groove"
    if 49.5 <= t < 51.5:
        return "break"
    if t >= 57.5:
        return "end"
    return "full"


kicks = []
bar_i = 0
t = OFFSET
add(music, pad([57, 61, 64, 69], OFFSET + 0.2), 0, gain=0.25)
while t < DUR:
    notes, root = prog[bar_i % 4]
    sec = section(t)
    fill = (t + BAR) in (11.5, 17.5, 23.5, 29.5, 35.5, 43.5)

    if sec in ("build", "break"):
        add(music, pad([n - 12 for n in notes], BAR + 0.3), t, gain=0.32)
    if sec != "end":
        rhythm = STAB_RHYTHM_B if sec == "full" and bar_i % 2 else STAB_RHYTHM
        bright = {"build": min(1.0, t / 5.5) * 0.6, "groove": 0.7, "full": 1.0, "break": 0.3}[sec]
        for b in rhythm:
            add(music, stab(notes, bright=bright), t + b * BEAT, pan=0.15 * np.sin(b * 3), gain=0.38)
    else:
        add(music, pad(notes, 3.2), t, gain=0.35)
        add(music, stab(notes, 0.6, 1.0), t, gain=0.4)

    if sec in ("groove", "full"):
        for b in BASS_RHYTHM:
            add(music, bass(root + (12 if b in (1.5, 3.5) else 0)), t + b * BEAT, gain=0.55)
        add(music, bass(root, 0.12), t, gain=0.35)

    if sec in ("full", "break") and bar_i % 2 == 0:
        for b, m in HOOK:
            add(music, bell(m), t + b * BEAT, pan=0.3, gain=0.10 if sec == "full" else 0.16)

    for b in range(4):
        tb = t + b * BEAT
        if sec in ("groove", "full"):
            add(drums, kick(), tb, gain=0.85)
            kicks.append(tb)
            if b in (1, 3):
                add(drums, clap(), tb, pan=0.05, gain=0.35)
            add(drums, noise_hit(0.18, 22), tb + BEAT / 2, pan=0.35, gain=0.13)  # open hat
        if sec in ("build", "groove", "full"):
            for h in range(4):
                if h != 2 or sec == "build":
                    add(drums, noise_hit(0.04, 90), tb + h * BEAT / 4, pan=-0.35, gain=0.05 if h % 2 else 0.035)
        if sec == "build" and b in (1, 3) and t > 3:
            add(drums, clap(), tb, gain=0.18)

    if fill:  # snare roll over the last half bar into the next scene
        for k in range(8):
            add(drums, clap(), t + 2 * BEAT + k * BEAT / 4, gain=0.08 + 0.03 * k)
    t += BAR
    bar_i += 1

for c in (11.5, 51.5):
    add(drums, crash(), c, gain=0.35)
add(drums, riser(2.0), 9.5, gain=0.35)
add(drums, riser(2.0), 49.5, gain=0.4)
add(drums, kick(), 57.5, gain=0.9)

# sidechain pump: duck the harmonic parts after every kick
t_axis = np.arange(N) / SR
pump = np.ones(N)
for k in kicks:
    i = int(k * SR)
    j = min(N, i + int(BEAT * SR))
    x = (t_axis[i:j] - k) / BEAT
    pump[i:j] = np.minimum(pump[i:j], 0.35 + 0.65 * np.clip(x / 0.6, 0, 1) ** 1.5)
music *= pump[:, None]

# short room reverb on the harmonic parts
ir_len = int(1.2 * SR)
ti = np.arange(ir_len) / SR
wet = np.zeros_like(music)
for c in range(2):
    ir = rng.standard_normal(ir_len) * np.exp(-ti * 5)
    ir[: int(0.015 * SR)] = 0
    nfft = 1 << (N + ir_len - 1).bit_length()
    wet[:, c] = np.fft.irfft(np.fft.rfft(music[:, c], nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
wet *= np.max(np.abs(music)) / (np.max(np.abs(wet)) + 1e-9)

out = music + 0.25 * wet + drums
out *= np.minimum(1, t_axis / 0.5)[:, None] * np.clip((DUR - t_axis) / 2.5, 0, 1)[:, None]
out = np.tanh(out / np.max(np.abs(out)) * 1.6)
out /= np.max(np.abs(out))
out *= 10 ** (-1 / 20)
sf.write("public/music.wav", out.astype(np.float32), SR)
print("music.wav written", out.shape)
