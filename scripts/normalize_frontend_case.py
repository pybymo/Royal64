from pathlib import Path
import subprocess
import sys

ROOT = Path(r"E:\Royal64\frontend\royal64-web")
SRC = ROOT / "src"

if not SRC.exists():
    print("src folder not found.")
    sys.exit(1)

subprocess.run(
    ["git", "config", "core.ignorecase", "false"],
    cwd=ROOT,
    check=False,
)

SKIP = {
    ".git",
    ".idea",
    ".vscode",
    "node_modules",
    "dist",
    "build",
}

renamed = []

# از عمیق‌ترین پوشه‌ها شروع می‌کنیم
dirs = sorted(
    [p for p in SRC.rglob("*") if p.is_dir()],
    key=lambda x: len(x.parts),
    reverse=True,
)

for d in dirs:
    if any(part in SKIP for part in d.parts):
        continue

    old_name = d.name
    new_name = old_name.lower()

    if old_name == new_name:
        continue

    tmp = d.parent / (new_name + "_tmp_case")

    rel_old = d.relative_to(ROOT)
    rel_tmp = tmp.relative_to(ROOT)
    rel_new = (d.parent / new_name).relative_to(ROOT)

    print(f"{rel_old} -> {rel_new}")

    subprocess.run(
        ["git", "mv", str(rel_old), str(rel_tmp)],
        cwd=ROOT,
        check=True,
    )

    subprocess.run(
        ["git", "mv", str(rel_tmp), str(rel_new)],
        cwd=ROOT,
        check=True,
    )

    renamed.append((str(rel_old), str(rel_new)))

print()
print(f"Done. Renamed {len(renamed)} folders.")