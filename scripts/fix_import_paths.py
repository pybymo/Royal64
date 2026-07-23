from pathlib import Path
import re

ROOT = Path(r"E:\Royal64\frontend\royal64-web\src")

# پوشه‌هایی که lowercase شده‌اند
mapping = {
    "Header": "header",
    "BottomNavigation": "bottomnavigation",
    "WalletCard": "walletcard",
    "StatsCard": "statscard",
    "Badge": "badge",
    "Button": "button",
    "Card": "card",
    "Container": "container",
    "Loader": "loader",
    "Stack": "stack",
    "Text": "text",
}

count = 0

for file in ROOT.rglob("*"):
    if file.suffix not in [".ts", ".tsx"]:
        continue

    txt = file.read_text(encoding="utf8")

    original = txt

    for old, new in mapping.items():

        txt = re.sub(
            rf'(@/.*/){old}(?=["\'])',
            rf'\1{new}',
            txt,
        )

        txt = re.sub(
            rf'(\./){old}(?=["\'])',
            rf'\1{new}',
            txt,
        )

        txt = re.sub(
            rf'(\.\./){old}(?=["\'])',
            rf'\1{new}',
            txt,
        )

    if txt != original:
        file.write_text(txt, encoding="utf8")
        print(file.relative_to(ROOT))
        count += 1

print()
print(f"Updated {count} files.")