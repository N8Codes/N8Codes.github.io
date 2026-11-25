# Crop a white margin off pixel art, fill outside corner notches from their
# neighbours, then repeat edge rows/cols to get back the canvas's proportions.
import sys
from PIL import Image
def fix(src, out):
    im = Image.open(src).convert('RGBA'); W0, H0 = im.size
    light = lambda p: p[3] < 128 or min(p[:3]) > 200
    px = im.load(); w, h = im.size
    # margin = light rows/cols at the edges only
    def edge_light(line): return sum(map(light, line)) / len(line) > 0.6
    l, t, r, b = 0, 0, w, h
    while l < r and edge_light([px[l, y] for y in range(h)]): l += 1
    while r > l and edge_light([px[r-1, y] for y in range(h)]): r -= 1
    while t < b and edge_light([px[x, t] for x in range(w)]): t += 1
    while b > t and edge_light([px[x, b-1] for x in range(w)]): b -= 1
    im = im.crop((l, t, r, b)); px = im.load(); w, h = im.size
    seen, out_set = set(), set(); st = [(x, y) for x in range(w) for y in (0, h-1)] + [(x, y) for y in range(h) for x in (0, w-1)]
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y))
        if light(px[x, y]): out_set.add((x, y)); st += [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
    n = 0
    while out_set:
        nxt = set()
        for (x, y) in out_set:
            nb = [px[a, c] for a, c in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)) if 0 <= a < w and 0 <= c < h and (a, c) not in out_set]
            if nb: px[x, y] = nb[0]; n += 1
            else: nxt.add((x, y))
        if nxt == out_set: break
        out_set = nxt
    # restore the aspect ratio by repeating edge rows or columns
    target = W0 / H0; cw, ch = w, h
    if cw / ch > target + 0.01: ch = round(cw / target)
    elif cw / ch < target - 0.01: cw = round(ch * target)
    canvas = Image.new('RGBA', (cw, ch)); ox, oy = (cw - w) // 2, (ch - h) // 2
    canvas.paste(im, (ox, oy))
    for y in range(oy): canvas.paste(im.crop((0, 0, w, 1)), (ox, y))
    for y in range(oy + h, ch): canvas.paste(im.crop((0, h-1, w, h)), (ox, y))
    for x in range(ox): canvas.paste(canvas.crop((ox, 0, ox+1, ch)), (x, 0))
    for x in range(ox + w, cw): canvas.paste(canvas.crop((ox+w-1, 0, ox+w, ch)), (x, 0))
    canvas.save(out)
    c = canvas.load(); bd = [c[x,0] for x in range(cw)]+[c[x,ch-1] for x in range(cw)]+[c[0,y] for y in range(ch)]+[c[cw-1,y] for y in range(ch)]
    print(f'{src.split("/")[-1]:16s} {W0}x{H0} -> crop {w}x{h} -> {cw}x{ch}  notches {n}  light edge px {sum(map(light, bd))}')
for f in sys.argv[1:]: fix(f, f.replace('.png', '-fixed.png'))
