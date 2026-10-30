"""Generate responsive WebP previews; original PNGs remain available for zoom.

Run locally with Pillow installed, then commit the generated previews and manifest.
The hosting build only copies files and does not need Pillow.
"""

import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageOps

from build_site import ROOT, collect_files


OUTPUT = ROOT / "assets/image-previews"
MANIFEST = OUTPUT / "manifest.json"


def encode(source):
    relative = source.relative_to(ROOT).as_posix()
    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        width, height = image.size
        if max(width, height) < 512:
            return None
        variants = []
        # This portrait is rendered only as a 36px interview avatar.
        targets = {min(width, 96), min(width, 192)} if relative.endswith("ui/f7357.png") else {
            min(width, 960), min(width, 2656)
        }
        for target in sorted(targets):
            path = OUTPUT / f"{digest}-{target}.webp"
            if not path.exists():
                preview = image if target == width else image.resize(
                    (target, round(height * target / width)), Image.Resampling.LANCZOS
                )
                temporary = path.with_suffix(".webp.tmp")
                preview.save(
                    temporary, "WEBP", quality=94, method=6,
                    icc_profile=original.info.get("icc_profile", b""),
                )
                temporary.replace(path)
            # Keep the PNG when encoding a full-size candidate would make it larger.
            selected = source if target == width and path.stat().st_size >= source.stat().st_size else path
            variants.append({
                "src": "./" + selected.relative_to(ROOT).as_posix(),
                "width": target, "bytes": selected.stat().st_size,
            })
        return relative, {
            "width": width, "height": height,
            "originalBytes": source.stat().st_size, "variants": variants,
        }


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = [p for p in collect_files() if p.suffix.lower() == ".png"
               and p.stat().st_size >= 48 * 1024]
    with ThreadPoolExecutor(max_workers=4) as pool:
        manifest = dict(result for result in pool.map(encode, sources) if result)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    original = sum(item["originalBytes"] for item in manifest.values())
    desktop = sum(item["variants"][-1]["bytes"] for item in manifest.values())
    small = sum(item["variants"][0]["bytes"] for item in manifest.values())
    print(f"{len(manifest)} originals retained. Display images: "
          f"{original / 1048576:.2f} MiB → {desktop / 1048576:.2f} MiB desktop / "
          f"{small / 1048576:.2f} MiB small screens.")


if __name__ == "__main__":
    main()
