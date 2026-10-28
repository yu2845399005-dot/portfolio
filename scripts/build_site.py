"""Package the portfolio and its referenced assets for static hosting."""

import argparse
import re
import shutil
from html import unescape
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
PAGES = (
    "index.html",
    "contact.html",
    "onboarding.html",
    "live-assistant.html",
    "dialog-agent.html",
    "arena.html",
    "live-assistant-demo.html",
)
TEXT_TYPES = {".html", ".css", ".js", ".svg"}
ATTRIBUTES = re.compile(r'''\b(?:src|href|poster)\s*=\s*["']([^"']+)["']''', re.I)
CSS_URLS = re.compile(r'''url\(\s*["']?([^\s)'"\n]+)["']?\s*\)''', re.I)
JS_ASSETS = re.compile(r'''["'](\./(?:assets|figma-assets)/[^"']+)["']''')


def collect_files():
    pending = [ROOT / page for page in PAGES]
    files = set()
    while pending:
        source = pending.pop().resolve()
        if source in files:
            continue
        if not source.is_relative_to(ROOT) or not source.is_file():
            raise SystemExit(f"Missing or invalid site file: {source}")
        files.add(source)
        if source.suffix not in TEXT_TYPES:
            continue
        content = source.read_text(encoding="utf-8")
        refs = ATTRIBUTES.findall(content)
        if source.suffix in {".html", ".css", ".svg"}:
            refs += CSS_URLS.findall(content)
        if source.suffix == ".js":
            refs += JS_ASSETS.findall(content)
        for ref in refs:
            # Template markup uses assets from the literal JS asset map above.
            if source.suffix == ".js" and "${" in ref:
                continue
            url = urlsplit(unescape(ref))
            if url.scheme or url.netloc or not url.path:
                continue
            if url.path.startswith("/"):
                raise SystemExit(f"Root-relative URL breaks project hosting: {ref} in {source.name}")
            target = (source.parent / unquote(url.path)).resolve()
            pending.append(target)
    return sorted(files)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--list", action="store_true", help="List files without building")
    args = parser.parse_args()
    files = collect_files()
    if args.list:
        for source in files:
            print(source.relative_to(ROOT).as_posix())
        return
    destination = ROOT / "dist"
    # Rebuild only this script's generated output, never the source assets.
    if destination.is_symlink():
        raise SystemExit("Refusing to build into a symlink")
    if destination.exists():
        shutil.rmtree(destination)
    for source in files:
        target = destination / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    (destination / ".nojekyll").touch()
    total = sum(source.stat().st_size for source in files)
    print(f"Built {len(files)} files, {total / 1024 / 1024:.1f} MiB. All local references resolved.")


if __name__ == "__main__":
    main()
