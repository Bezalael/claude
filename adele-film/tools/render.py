"""Render the film in cached segments and assemble it with one final encode.

usage:
  python tools/render.py                  render missing segments, then assemble and verify
  python tools/render.py call whatsapp    re-render the segments showing these scenes, then assemble
  python tools/render.py --all            re-render every segment
  python tools/render.py --audio          force a fresh audio mix (it is also redone automatically when audio inputs change)
  python tools/render.py --draft ...      the same at half resolution, in out/draft/

The timeline is split just after each transition, so segment k holds scene k plus the transition
into scene k+1. A scene therefore appears in its own segment and the one before it, and naming a
scene re-renders both. Segments are rendered muted from one shared bundle as near-lossless mezzanine
files (CRF 10), then the joined film is encoded once as a single continuous H.264 stream (CRF 18, slow),
so every frame gets the same quality; joining final-quality segments by stream copy would leave each
segment's last frame softer, because the encoder spends less on frames nothing later depends on. The audio is Remotion's own mix, rendered on its own and cached: it is redone only when the
voice, music, sound effects, timeline or composition change. It is mastered to -16 LUFS and muxed in.

Every assembly is verified: the frame count must equal the composition length, and the frames either
side of each join are compared (PSNR, by exact frame index, BT.709) against a fresh still. A join passes
when the frame clears a codec-tolerance floor and no neighbouring frame matches the still clearly better;
a neighbour only counts when it differs from the frame itself by more than codec noise, since at the
still end of a transition adjacent frames are near-identical and cannot reveal a shift. Segments older than the latest change under src/ or public/ are reported as
possibly stale.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMP = "AdeleCare"
BROWSER = os.environ.get("REMOTION_BROWSER", "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell")
MIN_PSNR = 30.0  # dB; H.264 at CRF 18 scores 30-48 against a lossless still, a wrong frame far lower


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


def extract_frames(video, frames, out_dir):
    """Decode `video` once and save the given frame indices as PNGs (BT.709, full range). Returns {frame: path}."""
    frames = sorted(set(frames))
    expr = "+".join(f"eq(n\\,{f})" for f in frames)
    pattern = os.path.join(out_dir, "frame-%04d.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf",
                    f"select='{expr}',scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24",
                    "-vsync", "0", pattern], check=True)
    return {f: pattern % (k + 1) for k, f in enumerate(frames)}


def psnr(a, b):
    """PSNR in dB between two images of the same size, or None."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", a, "-i", b, "-lavfi", "[0:v]format=rgb24[x];[1:v]format=rgb24[y];[x][y]psnr",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"average:(\S+)", r.stderr)
    if not m:
        return None
    return float("inf") if m.group(1) == "inf" else float(m.group(1))


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
                     "--codec", "h264", "--crf", "10", "--pixel-format", "yuv420p", "--color-space", "bt709", "--concurrency", "4", *scale)

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
    inputs = [os.path.join(ROOT, seg_path(i, sid)) for i, sid, _, _ in t["segments"]] + [audio_abs]
    if os.path.exists(os.path.join(ROOT, final)) and os.path.getmtime(os.path.join(ROOT, final)) > max(map(os.path.getmtime, inputs)):
        print("segments and audio unchanged since the last encode; reusing", final)
    else:
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(seg_dir, "list.txt"), "-i", audio,
             "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
             "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
             "-af", norm, "-c:a", "aac", "-b:a", "192k", "-shortest",
             "-movflags", "+faststart", final])

    # Verify: exact length, and every join matches a fresh still of the same frame.
    n = frame_count(os.path.join(ROOT, final))
    problems = [] if n == t["total"] else [f"frame count {n}, expected {t['total']}"]
    checks = sorted({f for _, _, first, last in t["segments"] for f in (first, last)})
    tmp = os.path.join(ROOT, seg_dir, "verify")
    os.makedirs(tmp, exist_ok=True)
    decoded = extract_frames(os.path.join(ROOT, final), [g for f in checks for g in (f - 1, f, f + 1) if 0 <= g < n], tmp)
    refs = {f: os.path.join(tmp, f"still-{f}.png") for f in checks}
    with ThreadPoolExecutor(max_workers=4) as pool:  # each still pays a browser start-up, so run them side by side
        list(pool.map(lambda f: remotion("still", bundle, COMP, refs[f], f"--frame={f}", *scale), checks))
    for f in checks:
        ref = refs[f]
        here = psnr(decoded[f], ref)
        # a neighbour is evidence of a shift only if it matches the still clearly better AND is itself
        # clearly different from this frame (otherwise the two are the same picture up to codec noise)
        suspects = []
        for g in (f - 1, f + 1):
            if g in decoded:
                score, apart = psnr(decoded[g], ref), psnr(decoded[g], decoded[f])
                if score is not None and here is not None and score > here + 0.5 and apart is not None and apart < here:
                    suspects.append((g, score, apart))
        print(f"frame {f:5d}: {here if here is not None else 'n/a'} dB" + (f"  suspect neighbours {suspects}" if suspects else ""))
        if here is None or here < MIN_PSNR:
            problems.append(f"frame {f} does not match a direct render ({here} dB)")
        elif suspects:
            problems.append(f"frame {f}: neighbour {suspects[0][0]} matches its render better and is a different picture: shifted join")
    for name in os.listdir(tmp):
        os.remove(os.path.join(tmp, name))

    print(f"\n{final}: {n} frames")
    if stale:
        print("possibly stale (older than the latest change under src/ or public/):\n  " + "\n  ".join(stale))
    if problems:
        sys.exit("VERIFY FAILED:\n  " + "\n  ".join(problems))
    print("verified: exact length, all joins match direct renders")


if __name__ == "__main__":
    main()
