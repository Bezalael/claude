"""Generate the voiceover and phone-call dialogue with Kokoro (Apache 2.0).

usage: python tools/vo.py <model_dir>
Writes public/voiceover/<key>.wav and prints each line's duration for src/timeline.ts.
Adele narrates in the first person and speaks on the call; the patient is a second voice
band-limited to sound like a phone line.
"""
import os
import subprocess
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

ADELE = ("bf_emma", 1.0)
PATIENT = ("bm_george", 1.02)

lines = [
    ("hook", ADELE, "Your practice was built on care. Not on answering the phone.", False),
    ("problem", ADELE, "But the chair is full, the phone keeps ringing, and recalls slip when the team is stretched.", False),
    ("intro", ADELE, "Hi, I'm Adele. The AI receptionist for UK dental practices.", False),
    ("call_a", ADELE, "Good morning, Riverside Dental. This is Adele, how can I help?", False),
    ("call_b", PATIENT, "Hi, I've cracked a tooth. Could I come in today?", True),
    ("call_c", ADELE, "Oh no, I'm sorry. I can see you at two forty today. Shall I book that?", False),
    ("call_d", PATIENT, "Yes please, perfect.", True),
    ("whatsapp", ADELE, "When a patient cancels, I offer the slot on WhatsApp to someone waiting for an earlier visit, and move them in.", False),
    ("hub", ADELE, "I answer calls, WhatsApp and web chat, and book straight into your P M S.", False),
    ("confirm", ADELE, "I ask every patient to confirm. Your team only steps in if there's no reply.", False),
    ("list", ADELE, "And I work your patient list too. Missed enquiries, recalls, and lapsed patients.", False),
    ("clock", ADELE, "Before the doors open, and long after they close, I'm still answering.", False),
    ("cta", ADELE, "See me on a real practice day. Apply for a pilot place at adelecare dot co dot uk.", False),
]

model_dir = sys.argv[1]
k = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
os.makedirs("public/voiceover", exist_ok=True)
for key, (voice, speed), text, phone in lines:
    samples, sr = k.create(text, voice=voice, speed=speed, lang="en-gb")
    out = f"public/voiceover/{key}.wav"
    sf.write(out, samples, sr)
    if phone:
        tmp = out + ".tmp.wav"
        os.replace(out, tmp)
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af",
             "highpass=f=320,lowpass=f=3300,acompressor=threshold=0.1:ratio=4,volume=1.4", out],
            check=True,
        )
        os.remove(tmp)
    print(f"{key:8s} {len(samples) / sr:.2f}")
