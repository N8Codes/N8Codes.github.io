# Rotate face art (sources in _tools/art/src) to match the axes of the CSS box faces it lands on (0 generations).
# On .f-left/.f-right the image's horizontal axis runs along the part's height (z),
# so art drawn upright is turned 90° clockwise (its bottom, the base, goes to z = 0).
import sys
from PIL import Image
art = sys.argv[1]
SRC = __file__.rsplit("/", 1)[0] + "/src"
for src, out in (("ram-side.png", "ram-side-z.png"), ("cooler-front.png", "cooler-fan-z.png"), ("cooler-top.png", "cooler-top-y.png")):
    Image.open(f"{SRC}/{src}").transpose(Image.ROTATE_270).save(f"{art}/{out}")
    print(src, "->", out)
# The rear panel (pc/art/case-rear.png) is used as drawn, on the outward-facing left wall.
