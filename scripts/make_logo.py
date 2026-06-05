#!/usr/bin/env python3
"""Generate PNG logos for DistroInstall from the SVG mark design."""
import glob
import os
from PIL import Image, ImageDraw, ImageFont

C1 = (99, 102, 241)    # #6366f1
C2 = (168, 85, 247)    # #a855f7
WHITE = (255, 255, 255)
DARK = (15, 23, 42)     # #0f172a
OUT = os.path.join(os.path.dirname(__file__), '..', 'public')

SS = 4  # supersample factor for crisp edges


def diagonal_gradient(size):
    mid = tuple((a + b) // 2 for a, b in zip(C1, C2))
    g = Image.new('RGB', (2, 2))
    g.putpixel((0, 0), C1)
    g.putpixel((1, 0), mid)
    g.putpixel((0, 1), mid)
    g.putpixel((1, 1), C2)
    return g.resize((size, size), Image.BILINEAR)


def make_icon(size, rounded=True):
    W = size * SS
    grad = diagonal_gradient(W)

    # draw the >_ mark onto the gradient
    d = ImageDraw.Draw(grad)
    sc = W / 32.0
    w = int(round(2.6 * sc))

    def p(x, y):
        return (x * sc, y * sc)

    d.line([p(10, 11), p(15, 16), p(10, 21)], fill=WHITE, width=w, joint='curve')
    d.line([p(17.5, 21), p(23, 21)], fill=WHITE, width=w)
    # round caps
    r = w / 2.0
    for (x, y) in [(10, 11), (15, 16), (10, 21), (17.5, 21), (23, 21)]:
        cx, cy = p(x, y)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)

    # rounded-corner mask
    mask = Image.new('L', (W, W), 0)
    md = ImageDraw.Draw(mask)
    radius = int(8 * sc) if rounded else 0
    md.rounded_rectangle([0, 0, W - 1, W - 1], radius=radius, fill=255)

    out = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out.resize((size, size), Image.LANCZOS)


def find_font(bold=True):
    pats = [
        '/usr/share/fonts/**/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/**/DejaVuSans.ttf',
        '/usr/share/fonts/**/*Bold.ttf' if bold else '/usr/share/fonts/**/*.ttf',
    ]
    for pat in pats:
        hits = glob.glob(pat, recursive=True)
        if hits:
            return hits[0]
    return None


def make_social(width=1280, height=640):
    img = Image.new('RGB', (width, height), DARK)
    d = ImageDraw.Draw(img)
    # subtle gradient wash
    wash = diagonal_gradient(width).resize((width, height)).convert('RGB')
    img = Image.blend(img, wash, 0.18)
    d = ImageDraw.Draw(img)

    icon = make_icon(220)
    img.paste(icon, (110, height // 2 - 110), icon)

    bold = find_font(True)
    reg = find_font(False)
    if bold:
        f_title = ImageFont.truetype(bold, 96)
        f_sub = ImageFont.truetype(reg or bold, 40)
        d.text((360, height // 2 - 86), 'DistroInstall', font=f_title, fill=WHITE)
        d.text((362, height // 2 + 28), 'Real stats from real Linux users',
               font=f_sub, fill=(148, 163, 184))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    for s in (512, 1024):
        make_icon(s).save(os.path.join(OUT, f'logo-{s}.png'))
        print(f'wrote logo-{s}.png')
    make_social().save(os.path.join(OUT, 'social-preview.png'))
    print('wrote social-preview.png')


if __name__ == '__main__':
    main()
