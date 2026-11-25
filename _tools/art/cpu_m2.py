# CPU lid (20x20) and M.2 drive top (40x12), drawn from the installed art's palettes.
import sys
from PIL import Image
art = sys.argv[1]
gpu = Image.open(f'{art}/gpu-3fan-front.png').convert('RGB')
g = sorted({c for _, c in gpu.getcolors(65536)}, key=sum)
dark, mid, light, hi = g[1], g[len(g)//2], g[-4], g[-2]
board = Image.open(f'{art}/board-atx.png').convert('RGB')
b = sorted({c for _, c in board.getcolors(65536)}, key=sum)
pcb, pcb_d = b[len(b)//3], b[2]
gold, gold_d = (201, 162, 58), (150, 115, 40)
# CPU: green substrate edge, silver heat spreader, corner triangle marker
cpu = Image.new('RGB', (20, 20), pcb); p = cpu.load()
for x in range(20):
    for y in range(20):
        if x in (0, 19) or y in (0, 19): p[x, y] = pcb_d
        elif 2 <= x <= 17 and 2 <= y <= 17:
            edge = x in (2, 17) or y in (2, 17)
            p[x, y] = mid if edge else (hi if (x == 3 or y == 3) else light)
for (x, y) in [(3, 15), (3, 16), (4, 16)]: p[x, y] = gold          # alignment triangle
cpu.save(f'{art}/cpu-top.png')
# M.2: PCB with two dark chips, gold contacts at one end, screw notch at the other
m2 = Image.new('RGB', (40, 12), pcb); q = m2.load()
for x in range(40):
    for y in range(12):
        if y in (0, 11): q[x, y] = pcb_d
        if x >= 37: q[x, y] = gold if y % 2 else gold_d               # contacts
        if 6 <= x <= 17 and 3 <= y <= 8: q[x, y] = dark                # controller / memory chips
        if 20 <= x <= 33 and 2 <= y <= 9: q[x, y] = dark
        if x <= 1 and 4 <= y <= 7: q[x, y] = pcb_d                     # screw notch
q[7, 3] = mid; q[21, 2] = mid
m2.save(f'{art}/m2-top.png')
for n, im in (('cpu-top', cpu), ('m2-top', m2)): im.resize((im.width * 10, im.height * 10), Image.NEAREST).save(f'{sys.argv[2]}/{n}-x10.png')
print('ok', cpu.size, m2.size)
