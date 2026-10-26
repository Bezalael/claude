"""Synthesise the sound effects: a UK phone ring, a soft "booked" chime and a message pop.

usage: python tools/sfx.py  -> public/sfx/ring.wav, public/sfx/chime.wav, public/sfx/pop.wav
"""
import numpy as np
import soundfile as sf

SR = 44100


def tvec(d):
    return np.arange(int(d * SR)) / SR


# UK ring cadence: 0.4s on, 0.2s off, 0.4s on, using 400 + 450 Hz. One full double ring, then a second cut short by the answer.
ring = np.zeros(int(1.75 * SR))
for start, dur in [(0.0, 0.4), (0.6, 0.4), (1.3, 0.4)]:
    t = tvec(dur)
    tone = (np.sin(2 * np.pi * 400 * t) + np.sin(2 * np.pi * 450 * t)) * 0.5
    env = np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.01)
    i = int(start * SR)
    ring[i : i + len(t)] += tone * env
ring = np.tanh(ring * 1.5) * 0.5
sf.write("public/sfx/ring.wav", ring.astype(np.float32), SR)

# Two-note bell (E6 then A6) with a gentle FM shimmer.
chime = np.zeros(int(1.6 * SR))
for start, f in [(0.0, 1318.5), (0.12, 1760.0)]:
    t = tvec(1.4)
    s = np.sin(2 * np.pi * f * t + 0.8 * np.exp(-t * 6) * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 4)
    i = int(start * SR)
    chime[i : i + len(t)] += s * np.minimum(1, t / 0.003)
chime *= 0.45 / np.max(np.abs(chime))
sf.write("public/sfx/chime.wav", chime.astype(np.float32), SR)
# Short rising "bloop" for a chat message arriving.
t = tvec(0.16)
pop = np.sin(2 * np.pi * np.cumsum(520 + 900 * (t / 0.16)) / SR) * np.exp(-t * 28) * np.minimum(1, t / 0.002)
pop *= 0.5 / np.max(np.abs(pop))
sf.write("public/sfx/pop.wav", pop.astype(np.float32), SR)
print("sfx written")
