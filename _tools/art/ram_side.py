# Memory stick side, 68x16, drawn from the accepted GPU art's own palette.
import sys
from PIL import Image
gpu = Image.open(sys.argv[1]).convert('RGB')
cols = sorted({c for _, c in gpu.getcolors(65536)}, key=lambda c: sum(c))
dark, mid, light = cols[1], cols[len(cols)//2], cols[-3]
gold, gold_d = (201, 162, 58), (150, 115, 40)
im = Image.new('RGB', (68, 16), mid); p = im.load()
for x in range(68):
    for y in range(16):
        if y == 0 or x in (0, 67): p[x, y] = dark                      # outline
        elif y <= 2: p[x, y] = light                                   # top edge of the heat spreader
        elif y >= 13: p[x, y] = gold if (x % 3) else gold_d            # contacts
        elif y == 12: p[x, y] = dark                                   # spreader bottom edge
        elif 4 <= y <= 10 and 6 <= x <= 61: p[x, y] = dark if y in (4, 10) or x in (6, 61) else mid  # recessed panel
im.putpixel((33, 15), dark); im.putpixel((34, 15), dark)              # the key notch
im.save(sys.argv[2]); im.resize((68*8, 16*8), Image.NEAREST).save(sys.argv[2].replace('.png', '-x8.png'))
print('ram', im.size, 'dark', dark, 'mid', mid, 'light', light)
