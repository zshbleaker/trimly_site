#!/usr/bin/env python3
"""Build the static site in every language.

    python3 site-src/build.py            # build, falling back to English for missing strings
    python3 site-src/build.py --strict   # fail on any missing or malformed translation

Strings live in site-src/i18n/<lang>.json (en.json is the source). The homepage body
comes from site-src/templates/index.html, where {{dotted.key}} is replaced by a string
and {{root}} by the path back to the shared assets. Support, changelog and privacy are
generated from their string arrays below. Output is plain HTML: English at OUT/,
every other language at OUT/<lang>/.

Translations may contain inline HTML, but must keep exactly the same tags, in the same
order, as the English string; the build checks this.
"""
import html
import json
import re
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent / "next"
BASE_URL = "https://trimly.zshbleaker.me/next/"
STORE = "https://apps.apple.com/app/id6773276396"
MAIL = "hi@zshbleaker.me"

# (code, output folder, hreflang, native name). English is the source and lives at the root.
LANGS = [
    ("en", "", "en", "English"),
    ("zh", "zh", "zh-Hans", "简体中文"),
    ("ja", "ja", "ja", "日本語"),
    ("ko", "ko", "ko", "한국어"),
    ("es", "es", "es", "Español"),
    ("ar", "ar", "ar", "العربية"),
]
PAGES = ["index.html", "support.html", "changelog.html", "privacy.html"]
CLIP_COLORS = ["var(--clip-1)", "var(--clip-2)", "var(--clip-3)"]

APPLE_LOGO = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>'

TAG = re.compile(r"<[^>]+>")
PLACEHOLDER = re.compile(r"\{\{([\w.]+)\}\}")


# ---------- Strings ----------

def load(code):
    path = SRC / "i18n" / f"{code}.json"
    return json.loads(path.read_text()) if path.exists() else None


def merge(source, translated, path, problems):
    """English shape, translated leaves. Records missing keys and tag mismatches."""
    if isinstance(source, dict):
        translated = translated if isinstance(translated, dict) else {}
        return {k: merge(v, translated.get(k), f"{path}.{k}" if path else k, problems) for k, v in source.items()}
    if isinstance(source, list):
        translated = translated if isinstance(translated, list) else []
        if translated and len(translated) != len(source):
            problems.append(f"{path}: {len(translated)} items, English has {len(source)}")
        return [merge(v, translated[i] if i < len(translated) else None, f"{path}.{i}", problems) for i, v in enumerate(source)]
    if not isinstance(translated, str) or not translated.strip():
        problems.append(f"{path}: missing")
        return source
    if isinstance(source, str) and TAG.findall(source) != TAG.findall(translated):
        problems.append(f"{path}: tags differ from English {TAG.findall(source)}")
        return source
    return translated


def get(strings, dotted):
    node = strings
    for part in dotted.split("."):
        node = node[int(part)] if isinstance(node, list) else node[part]
    return node


# ---------- Paths ----------

def rel(from_dir, to_dir, page):
    """Link from a page in from_dir to `page` in to_dir (folders are '' or a code)."""
    up = "../" if from_dir else ""
    down = f"{to_dir}/" if to_dir else ""
    return f"{up}{down}{page}"


def absolute(folder, page):
    path = f"{folder}/" if folder else ""
    return BASE_URL + path + ("" if page == "index.html" else page)


# ---------- Chrome ----------

def head(s, folder, page, title, description, root, scripts=""):
    alternates = "\n".join(
        f'    <link rel="alternate" hreflang="{hl}" href="{absolute(f, page)}">' for _, f, hl, _ in LANGS
    )
    return f'''<!DOCTYPE html>
<html lang="{s["meta"]["htmlLang"]}" dir="{s["meta"]["dir"]}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>{title}</title>
    <meta name="description" content="{html.escape(description)}">
    <link rel="canonical" href="{absolute(folder, page)}">
{alternates}
    <link rel="alternate" hreflang="x-default" href="{absolute("", page)}">
    <link rel="icon" type="image/png" sizes="32x32" href="{root}../assets/icon/favicon-light-32x32.png">
    <link rel="stylesheet" href="{root}next.css">{scripts}
</head>'''


def lang_links(folder, page, indent):
    pad = " " * indent
    out = []
    for _, f, hl, name in LANGS:
        current = ' aria-current="true"' if f == folder else ""
        out.append(f'{pad}<a href="{rel(folder, f, page)}" hreflang="{hl}" lang="{hl}"{current}>{name}</a>')
    return "\n".join(out)


def nav(s, folder, page, root):
    return f'''    <header class="nav">
        <a class="brand" href="index.html">
            <img src="{root}../assets/icon/apple-touch-icon-light.png" alt="" width="28" height="28">
            <span>Trimly</span>
        </a>
        <div class="nav-end">
            <details class="lang-menu">
                <summary class="lang" aria-label="{s["common"]["language"]}">{s["meta"]["short"]}</summary>
                <nav class="lang-list" aria-label="{s["common"]["language"]}">
{lang_links(folder, page, 20)}
                </nav>
            </details>
            <a class="btn-store btn-small" href="{STORE}">{s["common"]["getTrimly"]}</a>
        </div>
    </header>'''


def footer(s, folder, page, root):
    f = s["footer"]

    def link(href, label, key):
        cur = ' aria-current="page"' if key == page else ""
        return f'<li><a href="{href}"{cur}>{label}</a></li>'

    return f'''    <footer class="site-foot">
        <div class="foot-rail" aria-hidden="true" dir="ltr">
            <i style="--a:.06;--b:.13;--c:var(--clip-1)"></i>
            <i style="--a:.41;--b:.5;--c:var(--clip-2)"></i>
            <i style="--a:.77;--b:.84;--c:var(--clip-3)"></i>
            <span class="foot-rail-head"></span>
        </div>
        <div class="foot-inner">
            <div class="foot-brand">
                <a class="brand" href="index.html">
                    <img src="{root}../assets/icon/apple-touch-icon-light.png" alt="" width="36" height="36">
                    <span>Trimly</span>
                </a>
                <p class="foot-tagline">{f["tagline"]}</p>
                <a class="btn-store btn-small" href="{STORE}">{APPLE_LOGO}<span>{s["common"]["downloadOnAppStore"]}</span></a>
                <p class="foot-platforms">{f["platforms"]}</p>
            </div>
            <nav class="foot-cols" aria-label="Footer">
                <div>
                    <h2>{f["help"]}</h2>
                    <ul>
                        {link("support.html", f["support"], "support.html")}
                        {link("changelog.html", f["changelog"], "changelog.html")}
                        {link(f"mailto:{MAIL}", f["contact"], None)}
                    </ul>
                </div>
                <div>
                    <h2>{f["legal"]}</h2>
                    <ul>
                        {link("privacy.html", f["privacy"], "privacy.html")}
                        {link("#notices", f["trademarks"], None)}
                    </ul>
                </div>
            </nav>
        </div>
        <div class="foot-bottom">
            <p class="foot-legal" id="notices">{f["notices"]}</p>
            <p class="foot-copy">&copy; 2026 Trimly · {f["crafted"]} <a href="https://zshbleaker.me" rel="noopener">@zshbleaker</a></p>
        </div>
    </footer>'''


def document(s, folder, page, title, description, body, scripts=""):
    root = "../" if folder else ""
    return f'''{head(s, folder, page, title, description, root, scripts)}
<body>
{nav(s, folder, page, root)}

    <main{' class="page"' if page != "index.html" else ""}>
{body}
    </main>

{footer(s, folder, page, root)}
</body>
</html>
'''


# ---------- Pages ----------

def home_body(s, root):
    template = (SRC / "templates" / "index.html").read_text()
    extra = {"root": root, "store": STORE, "appleLogo": APPLE_LOGO, "supportHref": "support.html"}

    def value(key):
        return extra[key] if key in extra else get(s, key)

    # Placeholders used as attribute values are escaped; everything else is inserted as HTML.
    template = re.sub(r'="\{\{([\w.]+)\}\}"', lambda m: '="' + html.escape(value(m.group(1)), quote=True) + '"', template)
    return PLACEHOLDER.sub(lambda m: value(m.group(1)), template).rstrip("\n")


def support_body(s):
    p = s["support"]
    chips = "\n".join(f'            <a href="#{g["id"]}">{g["title"]}</a>' for g in p["groups"])
    groups = []
    for g in p["groups"]:
        items = "\n".join(
            f'''            <details class="faq-item">
                <summary>{i["q"]}</summary>
                <div class="faq-answer">{i["a"]}</div>
            </details>''' for i in g["items"]
        )
        groups.append(f'''        <section class="faq-group" id="{g["id"]}">
            <h2>{g["title"]}</h2>
{items}
        </section>''')
    groups = "\n\n".join(groups)
    return f'''        <header class="page-head">
            <p class="page-eyebrow">{p["eyebrow"]}</p>
            <h1>{p["h1"]}</h1>
            <p class="page-lede">{p["lede"]}</p>
        </header>

        <div class="contact-card">
            <div>
                <h2>{p["contactTitle"]}</h2>
                <p>{p["contactBody"]}</p>
            </div>
            <a class="btn-store btn-small" href="mailto:{MAIL}?subject=Trimly%20Support">{MAIL}</a>
        </div>

        <nav class="page-chips" aria-label="{p["topicsLabel"]}">
{chips}
        </nav>

{groups}'''


def changelog_body(s):
    c = s["changelog"]
    entries = []
    for i, r in enumerate(c["releases"]):
        new = "\n".join(f"                <li>{x}</li>" for x in r["new"])
        fixes = ""
        if r["fixes"]:
            fixed = "\n".join(f"                <li>{x}</li>" for x in r["fixes"])
            fixes = f'''
            <h3>{c["bugFixes"]}</h3>
            <ul>
{fixed}
            </ul>'''
        entries.append(f'''        <article class="release" id="v{r["version"]}" style="--c:{CLIP_COLORS[i % 3]}">
            <p class="release-meta"><span class="release-version">{r["version"]}</span><span>{r["date"]}</span></p>
            <h2>{r["headline"]}</h2>
            <h3>{c["whatsNew"]}</h3>
            <ul>
{new}
            </ul>{fixes}
        </article>''')
    entries = "\n\n".join(entries)
    return f'''        <header class="page-head">
            <p class="page-eyebrow">{c["eyebrow"]}</p>
            <h1>{c["h1"]}</h1>
            <p class="page-lede">{c["lede"]}</p>
        </header>

        <div class="draft-banner draft-banner-page" lang="en" dir="ltr">
            <p><b>Draft</b> — 1.8.1 is the published App Store text. Earlier entries are drafted from the commit history; please review before publishing.</p>
        </div>

        <div class="releases">
{entries}
        </div>'''


def privacy_body(s):
    p = s["privacyPage"]
    facts = "\n".join(f'            <li><b>{f["h"]}</b>{f["p"]}</li>' for f in p["facts"])
    sections = "\n".join(
        f'''            <section>
                <h2>{x["h"]}</h2>
                <p>{x["p"]}</p>
            </section>''' for x in p["sections"]
    )
    return f'''        <header class="page-head">
            <p class="page-eyebrow">{p["eyebrow"]}</p>
            <h1>{p["h1"]}</h1>
            <p class="page-lede">{p["updated"]}</p>
        </header>

        <ul class="privacy-facts">
{facts}
        </ul>

        <p class="prose-intro">{p["intro"]}</p>

        <div class="prose">
{sections}
        </div>

        <p class="prose-contact">{p["contact"]} <a href="mailto:{MAIL}">{MAIL}</a>.</p>'''


# ---------- Build ----------

def main():
    strict = "--strict" in sys.argv
    english = load("en")
    failed = False

    for code, folder, _, _ in LANGS:
        problems = []
        translated = load(code)
        if code == "en":
            s = english
        elif translated is None:
            print(f"[{code}] no i18n/{code}.json — skipped")
            continue
        else:
            s = merge(english, translated, "", problems)
            s["meta"] = translated.get("meta", s["meta"])
        if problems:
            failed = True
            print(f"[{code}] {len(problems)} problem(s), English used for these:")
            for p in problems:
                print(f"    {p}")

        root = "../" if folder else ""
        out = OUT / folder if folder else OUT
        out.mkdir(parents=True, exist_ok=True)
        scripts = f'\n    <script defer src="{root}hero.js"></script>\n    <script defer src="{root}sections.js"></script>'
        pages = {
            "index.html": (s["home"]["title"], s["home"]["description"], home_body(s, root), scripts),
            "support.html": (s["support"]["title"], s["support"]["description"], support_body(s), ""),
            "changelog.html": (s["changelog"]["title"], s["changelog"]["description"], changelog_body(s), ""),
            "privacy.html": (s["privacyPage"]["title"], s["privacyPage"]["description"], privacy_body(s), ""),
        }
        for page, (title, description, body, page_scripts) in pages.items():
            (out / page).write_text(document(s, folder, page, title, description, body, page_scripts))
        print(f"[{code}] wrote {len(pages)} pages to {out.relative_to(SRC.parent)}/")

    if strict and failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
