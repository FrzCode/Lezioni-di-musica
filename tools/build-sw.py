#!/usr/bin/env python3
"""Rigenera l'elenco dei file da precaricare in sw.js e incrementa la versione
solo se l'elenco cambia. Va lanciato dalla radice del repository dopo aver aggiunto
o rinominato pagine, script, stili o icone: python3 tools/build-sw.py"""
import json, os, re, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SW = os.path.join(ROOT, "sw.js")
INCLUDE_DIRS = ["docs", "scripts", "style", "icons", "img"]
EXT = {".html", ".css", ".js", ".json", ".png", ".webmanifest"}
SKIP = {"docs/indice.html", "docs/modello.html"}

files = ["manifest.webmanifest"]
for d in INCLUDE_DIRS:
    for dp, dn, fn in os.walk(os.path.join(ROOT, d)):
        dn.sort()
        for f in sorted(fn):
            rel = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")
            if os.path.splitext(f)[1].lower() in EXT and rel not in SKIP:
                files.append(rel)
files = [urllib.parse.quote(f, safe="/.-_~") for f in files]

src = open(SW, encoding="utf-8").read()
block = "/*PRECACHE-START*/\nconst PRECACHE = " + json.dumps(files, indent=2, ensure_ascii=False) + ";\n/*PRECACHE-END*/"
m = re.search(r"/\*PRECACHE-START\*/.*?/\*PRECACHE-END\*/", src, re.S)
old = m.group(0)
if old != block:
    n = int(re.search(r'lezioni-v(\d+)', src).group(1)) + 1
    src = src.replace(old, block)
    src = re.sub(r'lezioni-v\d+', f'lezioni-v{n}', src, count=1)
    open(SW, "w", encoding="utf-8", newline="\n").write(src)
    print(f"sw.js aggiornato: versione v{n}, {len(files)} file")
else:
    print("sw.js gia aggiornato")
