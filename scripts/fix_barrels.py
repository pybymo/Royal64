from pathlib import Path
import re

ROOT = Path(r"E:\Royal64\frontend\royal64-web\src")

mapping = {
    "./Header": "./header",
    "./BottomNavigation": "./bottomnavigation",
    "./WalletCard": "./walletcard",
    "./StatsCard": "./statscard",
    "./Badge": "./badge",
    "./Button": "./button",
    "./Card": "./card",
    "./Container": "./container",
    "./Loader": "./loader",
    "./Stack": "./stack",
    "./Text": "./text",
}

count = 0

for file in ROOT.rglob("index.ts"):

    txt = file.read_text(encoding="utf8")
    old = txt

    for k, v in mapping.items():
        txt = txt.replace(k, v)

    if txt != old:
        file.write_text(txt, encoding="utf8")
        print(file.relative_to(ROOT))
        count += 1

print()
print(f"Updated {count} barrel files.")