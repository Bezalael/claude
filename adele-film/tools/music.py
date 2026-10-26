"""Compose the 90s music bed from scratch (original, no licence needed).

usage: python tools/music.py  -> public/music.wav
then: ffmpeg -i public/music.wav -b:a 192k public/music.mp3
Soft pads, an electric-piano arpeggio, sub bass and a light beat at 96 BPM.
The beat drops out for the clock scene (72-79s) and returns for the close.
"""
import numpy as np
import soundfile as sf

SR = 44100
DUR = 90.0
BPM = 96
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    mix[i : i + len(sig), 0] += sig * np.sqrt(0.5 * (1 - pan))
    mix[i : i + len(sig), 1] += sig * np.sqrt(0.5 * (1 + pan))


def pad(notes, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for m in notes:
        for det in (-0.07, 0.07):
            f = hz(m + det)
            s += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)
    return s * env * (1 + 0.15 * np.sin(2 * np.pi * 0.2 * t)) / len(notes)


def keys(m, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t + 0.6 * np.exp(-t * 6) * np.sin(2 * np.pi * 2 * f * t))
    s += 0.2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 4)
    return s * np.exp(-t * 2.4) * np.minimum(1, t / 0.004)


def bass(m, dur):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t / 0.02) * np.exp(-t * 0.6) * np.minimum(1, (dur - t) / 0.05)


def kick():
    t = np.arange(int(0.45 * SR)) / SR
    ph = 2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 30)) / SR
    return np.sin(ph) * np.exp(-t * 7)


def hat(dur=0.05):
    t = np.arange(int(dur * SR)) / SR
    n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)  # crude high-pass
    return n * np.exp(-t * 70)


def clap():
    t = np.arange(int(0.25 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)
    return n * (np.exp(-t * 25) + 0.5 * np.exp(-((t - 0.012) ** 2) / 1e-5))


# D major: Dmaj9, Bm9, Gmaj7(#11), A6sus  -> two bars each
prog = [
    ([62, 66, 69, 73, 76], 38, [62, 66, 69, 73, 76, 73, 69, 66]),
    ([59, 62, 66, 69, 73], 35, [59, 62, 66, 69, 73, 69, 66, 62]),
    ([55, 59, 62, 66, 69], 31, [55, 62, 66, 69, 71, 69, 66, 62]),
    ([57, 61, 64, 66, 71], 33, [57, 61, 64, 66, 69, 66, 64, 61]),
]
bar = 4 * BEAT
chord_len = 2 * bar
beat_on = lambda t: (12.0 <= t < 71.5) or (79.0 <= t < 87.5)
arp_on = lambda t: 5.0 <= t < 88.0

t, ci = 0.0, 0
while t < DUR:
    notes, root, arp = prog[ci % 4]
    add(pad(notes, chord_len + 1.0), t, gain=0.16)
    add(pad([n + 12 for n in notes[1:4]], chord_len + 1.0), t, pan=0.3, gain=0.05)
    if t >= 8.0:
        add(bass(root, chord_len * 0.5), t, gain=0.35)
        add(bass(root, chord_len * 0.5), t + chord_len * 0.5, gain=0.3)
    step = BEAT / 2
    for k in range(16):
        tt = t + k * step
        if arp_on(tt):
            add(keys(arp[k % 8] + (12 if k >= 8 and ci % 2 else 0)), tt, pan=0.35 * np.sin(k), gain=0.10 + 0.02 * (k % 2 == 0))
    for b in range(8):
        tb = t + b * BEAT
        if beat_on(tb):
            add(kick(), tb, gain=0.5 if b % 2 == 0 else 0.0)
            if b % 2 == 1:
                add(clap(), tb, gain=0.06)
            for h in range(2):
                add(hat(), tb + h * BEAT / 2 + 0.01 * h, pan=0.4, gain=0.035 if h else 0.02)
    t += chord_len
    ci += 1

# simple stereo reverb: decaying-noise impulse response
ir_len = int(2.2 * SR)
ti = np.arange(ir_len) / SR
wet = np.zeros_like(mix)
for c in range(2):
    ir = rng.standard_normal(ir_len) * np.exp(-ti * 3.0)
    ir[: int(0.02 * SR)] = 0
    L = N + ir_len
    nfft = 1 << (L - 1).bit_length()
    wet[:, c] = np.fft.irfft(np.fft.rfft(mix[:, c], nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
wet /= np.max(np.abs(wet)) + 1e-9
out = mix / (np.max(np.abs(mix)) + 1e-9) * 0.8 + wet * 0.35

tt = np.arange(N) / SR
out *= np.minimum(1, tt / 1.0)[:, None] * np.clip((DUR - tt) / 3.0, 0, 1)[:, None]
out = np.tanh(out * 1.2)
out /= np.max(np.abs(out))
out *= 10 ** (-1 / 20)
sf.write("public/music.wav", out.astype(np.float32), SR)
print("music.wav written", out.shape)
