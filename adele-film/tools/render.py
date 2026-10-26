"""Render the film in cached segments and assemble it without re-encoding.

usage:
  python tools/render.py                  render missing segments, then assemble and verify
  python tools/render.py call whatsapp    re-render the segments showing these scenes, then assemble
  python tools/render.py --all            re-render every segment
  python tools/render.py --audio          force a fresh audio mix (it is also redone automatically when audio inputs change)
  python tools/render.py --draft ...      the same at half resolution, in out/draft/

The timeline is split just after each transition, so segment k holds scene k plus the transition
into scene k+1. A scene therefore appears in its own segment and the one before it, and naming a
scene re-renders both. Segments are rendered muted from one shared bundle and joined with an H.264
stream copy. The audio is Remotion's own mix, rendered on its own and cached: it is redone only when the
voice, music, sound effects, timeline or composition change. It is mastered to -16 LUFS and muxed in.

Every assembly is verified: the frame count must equal the composition length, and the frames either
side of each join are compared (PSNR) against a fresh still of the same frame. Segments older than the
latest change under src/ or public/ are reported as possibly stale.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMP = "AdeleCare"
BROWSER = os.environ.get("REMOTION_BROWSER", "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell")
MIN_PSNR = 38.0  # dB; identical renders score far higher, a wrong or shifted frame far lower


def run(cmd, **kw):
    print("$", " ".join(cmd), flush=True)
    return subprocess.run(cmd, cwd=ROOT, check=True, **kw)


def remotion(*args):
    extra = ["--browser-executable", BROWSER] if os.path.exists(BROWSER) else []
    return run(["npx", "remotion", *args, *extra, "--timeout", "120000", "--log", "error"])


def timeline():
    js = (
        "import('./src/timeline.ts').then(m=>console.log(JSON.stringify({fps:m.FPS,total:m.TOTAL,"
        "scenes:m.SCENES.map(s=>s.id),"
        "bounds:m.CUTS.map(c=>Math.round(c.at*m.FPS)-m.framesBefore(c)+c.frames)})))"
    )
    out = subprocess.run(["node", "--experimental-strip-types", "--no-warnings", "-e", js], cwd=ROOT, check=True, capture_output=True, text=True).stdout
    t = json.loads(out)
    edges = [0, *t["bounds"], t["total"]]
    assert edges == sorted(edges) and len(edges) == len(t["scenes"]) + 1, edges
    t["segments"] = [(i, sid, edges[i], edges[i + 1] - 1) for i, sid in enumerate(t["scenes"])]
    return t


def newest_mtime(*paths):
    newest = 0.0
    for top in paths:
        top = os.path.join(ROOT, top)
        if os.path.isfile(top):
            newest = max(newest, os.path.getmtime(top))
        for dirpath, _, files in os.walk(top):
            for f in files:
                newest = max(newest, os.path.getmtime(os.path.join(dirpath, f)))
    return newest


AUDIO_INPUTS = ("public/voiceover", "public/sfx", "public/music.mp3", "src/timeline.ts", "src/AdeleVideo.tsx")


def frame_count(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    return int(out)


def psnr(video, frame, fps, reference):
    """PSNR between frame `frame` of `video` and the PNG `reference`."""
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-ss", f"{(frame + 0.5) / fps:.4f}", "-i", video, "-i", reference,
         "-frames:v", "1", "-lavfi", "[0:v]format=rgb24[a];[1:v]format=rgb24[b];[a][b]psnr", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    m = re.search(r"average:(\S+)", r.stderr)
    return float("inf") if m and m.group(1) == "inf" else float(m.group(1)) if m else 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scenes", nargs="*", help="scene ids to re-render (see SCENES in src/timeline.ts)")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--audio", action="store_true", help="re-render only the audio")
    ap.add_argument("--draft", action="store_true", help="half resolution, in out/draft/")
    a = ap.parse_args()

    t = timeline()
    base = os.path.join("out", "draft" if a.draft else "")
    seg_dir = os.path.join(base, "segments")
    os.makedirs(os.path.join(ROOT, seg_dir), exist_ok=True)
    scale = ["--scale", "0.5"] if a.draft else []
    unknown = set(a.scenes) - set(t["scenes"])
    if unknown:
        sys.exit(f"unknown scenes: {', '.join(sorted(unknown))}; choose from {', '.join(t['scenes'])}")

    bundle = os.path.join("out", "bundle")
    remotion("bundle", "src/index.ts", "--out-dir", bundle)

    seg_path = lambda i, sid: os.path.join(seg_dir, f"{i:02d}-{sid}.mp4")
    wanted = set()
    for i, sid, _, _ in t["segments"]:
        here = {sid, t["scenes"][i + 1]} if i + 1 < len(t["scenes"]) else {sid}
        if a.all or (here & set(a.scenes)) or not os.path.exists(os.path.join(ROOT, seg_path(i, sid))):
            wanted.add(i)
    for i, sid, first, last in t["segments"]:
        if i in wanted:
            remotion("render", bundle, COMP, seg_path(i, sid), f"--frames={first}-{last}", "--muted",
                     "--codec", "h264", "--crf", "18", "--pixel-format", "yuv420p", "--color-space", "bt709", "--concurrency", "4", *scale)

    stale_after = newest_mtime("src", "public")
    stale = [seg_path(i, sid) for i, sid, _, _ in t["segments"] if os.path.getmtime(os.path.join(ROOT, seg_path(i, sid))) < stale_after]

    audio = os.path.join(seg_dir, "audio.wav")
    audio_abs = os.path.join(ROOT, audio)
    if a.audio or not os.path.exists(audio_abs) or os.path.getmtime(audio_abs) < newest_mtime(*AUDIO_INPUTS):
        remotion("render", bundle, COMP, audio, "--codec", "wav", "--concurrency", "4")
    else:
        print("audio unchanged; reusing", audio)

    with open(os.path.join(ROOT, seg_dir, "list.txt"), "w") as fh:
        for i, sid, _, _ in t["segments"]:
            fh.write(f"file '{os.path.basename(seg_path(i, sid))}'\n")

    # Two-pass loudness mastering for online video: -16 LUFS integrated, -1.5 dBTP.
    target = "I=-16:TP=-1.5:LRA=11"
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", audio, "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"],
                          cwd=ROOT, capture_output=True, text=True).stderr
    m = json.loads(meas[meas.rindex("{"): meas.rindex("}") + 1])
    norm = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
            f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")

    final = os.path.join(base, "adele-care.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(seg_dir, "list.txt"), "-i", audio,
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", norm, "-c:a", "aac", "-b:a", "192k", "-shortest",
         "-movflags", "+faststart", final])

    # Verify: exact length, and every join matches a fresh still of the same frame.
    n = frame_count(os.path.join(ROOT, final))
    problems = [] if n == t["total"] else [f"frame count {n}, expected {t['total']}"]
    checks = sorted({f for _, _, first, last in t["segments"] for f in (first, last)})
    for f in checks:
        ref = os.path.join(seg_dir, f"check-{f}.png")
        remotion("still", bundle, COMP, ref, f"--frame={f}", *scale)
        score = psnr(os.path.join(ROOT, final), f, t["fps"], os.path.join(ROOT, ref))
        print(f"frame {f:5d}: PSNR {score:.1f} dB")
        if score < MIN_PSNR:
            problems.append(f"frame {f} differs from a direct render (PSNR {score:.1f} dB)")
        os.remove(os.path.join(ROOT, ref))

    print(f"\n{final}: {n} frames")
    if stale:
        print("possibly stale (older than the latest change under src/ or public/):\n  " + "\n  ".join(stale))
    if problems:
        sys.exit("VERIFY FAILED:\n  " + "\n  ".join(problems))
    print("verified: exact length, all joins match direct renders")


if __name__ == "__main__":
    main()
