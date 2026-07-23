from pathlib import Path

ROOT = Path(r"E:\Royal64\frontend\royal64-web\src")

fixed = 0

for index_file in ROOT.rglob("index.ts"):

    folder = index_file.parent

    # تمام فایل‌های tsx داخل همان پوشه (به جز index)
    tsx_files = [
        f for f in folder.glob("*.tsx")
        if f.stem.lower() != "index"
    ]

    if len(tsx_files) != 1:
        continue

    component = tsx_files[0].stem

    expected = f'export * from "./{component}";\n'

    current = index_file.read_text(encoding="utf8")

    if current != expected:
        index_file.write_text(expected, encoding="utf8")
        print(index_file.relative_to(ROOT))
        fixed += 1

print()
print(f"Fixed {fixed} index.ts files.")