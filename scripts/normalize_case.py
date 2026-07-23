from pathlib import Path
import re

ROOT = Path(r"E:\Royal64\frontend\royal64-web\src")

# ---------- rename folders ----------

dirs = sorted(
    [p for p in ROOT.rglob("*") if p.is_dir()],
    key=lambda x: len(str(x)),
    reverse=True,
)

rename_map = {}

for d in dirs:

    lower = d.name.lower()

    if lower != d.name:

        tmp = d.with_name(d.name + "__tmp__")

        d.rename(tmp)

        new_path = tmp.with_name(lower)

        tmp.rename(new_path)

        rename_map[d.name] = lower

print(rename_map)

# ---------- rewrite imports ----------

pattern = re.compile(r'(["\'])([^"\']+)(["\'])')

for file in ROOT.rglob("*"):

    if file.suffix not in {".ts", ".tsx"}:
        continue

    text = file.read_text(encoding="utf8")

    new_text = text

    for old, new in rename_map.items():

        new_text = new_text.replace(f"/{old}/", f"/{new}/")

        new_text = new_text.replace(f"./{old}/", f"./{new}/")

        new_text = new_text.replace(f"../{old}/", f"../{new}/")

    if new_text != text:

        file.write_text(new_text, encoding="utf8")

print("DONE")