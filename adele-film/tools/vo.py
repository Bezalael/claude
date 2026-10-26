"""Generate the voiceover lines with Kokoro (Apache 2.0).

usage: python tools/vo.py <model_dir> [voice] [speed]
Writes public/voiceover/lineN.wav and prints each line's duration.
"""
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

model_dir = sys.argv[1]
voice = sys.argv[2] if len(sys.argv) > 2 else "bf_emma"
speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
k = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))

lines = [
    "Your practice was built on care. Not on answering the phone.",
    "But the chair is full, the phone keeps ringing, and recalls slip when the team is stretched.",
    "Meet Adele. The AI receptionist for UK dental practices.",
    "She answers calls, WhatsApp and web chat, in a warm, natural voice.",
    "She books straight into your diary, follows your booking rules, and takes the deposit.",
    "Every channel runs through one assistant, and straight into your P M S.",
    "She asks every patient to confirm. Your team only steps in if there's still no reply.",
    "And she works your patient list too. Missed enquiries, recalls, and lapsed patients.",
    "Before the doors open, and long after they close.",
    "See Adele on a real practice day. Apply for a pilot place at adelecare dot co dot uk.",
]
os.makedirs("public/voiceover", exist_ok=True)
for i, text in enumerate(lines):
    samples, sr = k.create(text, voice=voice, speed=speed, lang="en-gb")
    sf.write(f"public/voiceover/line{i}.wav", samples, sr)
    print(f"{i} dur={len(samples) / sr:.2f}")
