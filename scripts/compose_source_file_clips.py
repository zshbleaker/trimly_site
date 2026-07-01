from pathlib import Path
from math import sin, cos, radians

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SHOT_DIR = ROOT / "assets" / "screenshots"
OUT_SIZE = (2880, 1800)

FONT_CANDIDATES = [
    "/Library/Fonts/SF-Pro.ttf",
    "/System/Library/Fonts/SFNS.ttf",
    "/System/Library/Fonts/HelveticaNeue.ttc",
]
MONO_CANDIDATES = [
    "/System/Library/Fonts/SFNSMono.ttf",
    "/Library/Fonts/SF-Compact-Text-Semibold.otf",
]


def font(size, weight="regular", mono=False):
    candidates = MONO_CANDIDATES if mono else FONT_CANDIDATES
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


def hex_to_rgb(value):
    value = value.strip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def shadow_for(mask, blur, opacity, color=(0, 0, 0)):
    shadow = Image.new("RGBA", mask.size, color + (0,))
    alpha = mask.filter(ImageFilter.GaussianBlur(blur)).point(lambda p: int(p * opacity))
    shadow.putalpha(alpha)
    return shadow


def paste_rounded(canvas, img, xy, radius=44, shadow=60, opacity=0.22, border=None):
    x, y = xy
    mask = rounded_mask(img.size, radius)
    pad = shadow * 2
    shadow_mask = Image.new("L", (img.size[0] + pad * 2, img.size[1] + pad * 2), 0)
    shadow_mask.paste(mask, (pad, pad))
    shadow_img = shadow_for(shadow_mask, shadow, opacity)
    canvas.alpha_composite(shadow_img, (x - pad, y - pad))
    canvas.paste(img, (x, y), mask)

    if border:
        draw = ImageDraw.Draw(canvas)
        draw.rounded_rectangle(
            (x, y, x + img.size[0] - 1, y + img.size[1] - 1),
            radius=radius,
            outline=border,
            width=2,
        )


def draw_background(theme):
    width, height = OUT_SIZE
    if theme == "light":
        top = hex_to_rgb("#fffaf1")
        mid = hex_to_rgb("#f6efe4")
        bottom = hex_to_rgb("#e7d8c6")
        line = (143, 55, 45, 24)
        glow_1 = (184, 120, 57, 52)
        glow_2 = (83, 97, 67, 42)
    else:
        top = hex_to_rgb("#1d2632")
        mid = hex_to_rgb("#151e28")
        bottom = hex_to_rgb("#0e1519")
        line = (142, 164, 193, 26)
        glow_1 = (95, 168, 255, 44)
        glow_2 = (56, 216, 107, 28)

    base = Image.new("RGBA", OUT_SIZE)
    px = base.load()
    for y in range(height):
        t = y / (height - 1)
        if t < 0.42:
            color = mix(top, mid, t / 0.42)
        else:
            color = mix(mid, bottom, (t - 0.42) / 0.58)
        for x in range(width):
            px[x, y] = color + (255,)

    overlay = Image.new("RGBA", OUT_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for i in range(-460, width + 260, 82):
        draw.line((i, 0, i + 760, height), fill=line, width=2)

    center = (-120, 60)
    for r in range(420, 1780, 42):
        box = (center[0] - r, center[1] - r // 2, center[0] + r * 2, center[1] + r)
        draw.arc(box, 200, 356, fill=(line[0], line[1], line[2], max(9, line[3] - r // 80)), width=3)

    base = Image.alpha_composite(base, overlay)

    for cx, cy, color, radius in [
        (540, 260, glow_1, 680),
        (2410, 1250, glow_2, 760),
        (1700, 270, (255, 255, 255, 26) if theme == "light" else (255, 255, 255, 10), 520),
    ]:
        glow = Image.new("RGBA", OUT_SIZE, (0, 0, 0, 0))
        gpx = glow.load()
        for y in range(max(0, cy - radius), min(height, cy + radius)):
            for x in range(max(0, cx - radius), min(width, cx + radius)):
                d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / radius
                if d < 1:
                    alpha = int(color[3] * (1 - d) ** 2)
                    gpx[x, y] = color[:3] + (alpha,)
        base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(16)))

    return base


def add_glass_card(canvas, xy, size, theme, title, value, accent, footer=None):
    x, y = xy
    w, h = size
    fill = (255, 250, 241, 178) if theme == "light" else (18, 27, 34, 188)
    border = (255, 255, 255, 170) if theme == "light" else (175, 198, 226, 58)
    text = (47, 41, 34, 255) if theme == "light" else (244, 247, 251, 255)
    muted = (119, 109, 97, 255) if theme == "light" else (165, 175, 188, 255)

    card = Image.new("RGBA", size, (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle((0, 0, w - 1, h - 1), radius=34, fill=fill, outline=border, width=2)
    cd.rounded_rectangle((26, 28, 38, h - 28), radius=6, fill=accent)
    cd.text((58, 30), title, font=font(34), fill=muted)
    cd.text((58, 78), value, font=font(52), fill=text)
    if footer:
        cd.text((58, 144), footer, font=font(28), fill=muted)

    mask = rounded_mask(size, 34)
    shadow = shadow_for(mask, 42, 0.22 if theme == "light" else 0.44)
    canvas.alpha_composite(shadow, (x, y + 18))
    canvas.alpha_composite(card, xy)


def add_export_strip(canvas, theme):
    x, y = 430, 1532
    w, h = 2020, 106
    fill = (255, 250, 241, 155) if theme == "light" else (16, 24, 31, 178)
    border = (255, 255, 255, 162) if theme == "light" else (142, 164, 193, 50)
    muted = (119, 109, 97, 255) if theme == "light" else (165, 175, 188, 255)
    line = (47, 41, 34, 52) if theme == "light" else (142, 164, 193, 42)

    strip = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(strip)
    sd.rounded_rectangle((0, 0, w - 1, h - 1), radius=52, fill=fill, outline=border, width=2)
    sd.line((96, h // 2, w - 96, h // 2), fill=line, width=6)
    for start, length, color in [
        (150, 330, (95, 168, 255, 230)),
        (620, 245, (255, 117, 112, 230)),
        (1010, 290, (87, 211, 133, 230)),
        (1430, 380, (255, 203, 92, 230)),
    ]:
        sd.rounded_rectangle((start, 30, start + length, 76), radius=23, fill=color)
    sd.text((96, -2), "source media", font=font(28), fill=muted)
    sd.text((w - 386, -2), "keepers only", font=font(28), fill=muted)
    paste_rounded(canvas, strip, (x, y), radius=52, shadow=36, opacity=0.16, border=None)


def compose(theme):
    if theme == "light":
        list_name = "CleanShot 2026-07-01 at 11.32.45@2x.png"
        menu_name = "CleanShot 2026-07-01 at 11.33.37@2x.png"
        border = (255, 255, 255, 190)
        card_accent = (40, 124, 255, 255)
        red = (255, 92, 87, 255)
        green = (77, 118, 84, 255)
    else:
        list_name = "CleanShot 2026-07-01 at 11.32.55@2x.png"
        menu_name = "CleanShot 2026-07-01 at 11.33.14@2x.png"
        border = (160, 186, 220, 76)
        card_accent = (95, 168, 255, 255)
        red = (255, 117, 112, 255)
        green = (56, 216, 107, 255)

    canvas = draw_background(theme)
    list_img = Image.open(SHOT_DIR / list_name).convert("RGBA")
    menu_img = Image.open(SHOT_DIR / menu_name).convert("RGBA")

    list_w = 1500
    list_img = list_img.resize((list_w, round(list_img.height * list_w / list_img.width)), Image.Resampling.LANCZOS)
    menu_w = 1310
    menu_img = menu_img.resize((menu_w, round(menu_img.height * menu_w / menu_img.width)), Image.Resampling.LANCZOS)

    paste_rounded(canvas, list_img, (210, 245), radius=72, shadow=78, opacity=0.24 if theme == "light" else 0.48, border=border)
    paste_rounded(canvas, menu_img, (1265, 370), radius=54, shadow=72, opacity=0.22 if theme == "light" else 0.46, border=border)

    add_glass_card(canvas, (1765, 186), (620, 210), theme, "Original file", "1.9 GB", card_accent, "Open in place")
    add_glass_card(canvas, (2080, 686), (535, 210), theme, "Marked", "4 clips", red, "No full export")
    add_glass_card(canvas, (1868, 1156), (665, 230), theme, "Export mode", "Quality", green, "Balance and efficiency ready")
    add_export_strip(canvas, theme)

    vignette = Image.new("RGBA", OUT_SIZE, (0, 0, 0, 0))
    vd = ImageDraw.Draw(vignette)
    for i in range(0, 180, 2):
        alpha = int((i / 180) ** 2 * (34 if theme == "light" else 70))
        vd.rectangle((i, i, OUT_SIZE[0] - i, OUT_SIZE[1] - i), outline=(0, 0, 0, alpha), width=2)
    canvas = Image.alpha_composite(canvas, vignette)

    output = SHOT_DIR / f"source-file-clips-{theme}.webp"
    canvas.convert("RGB").save(output, "WEBP", quality=92, method=6)
    print(output)


if __name__ == "__main__":
    compose("light")
    compose("dark")
