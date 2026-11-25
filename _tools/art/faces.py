# The hidden faces of every part (backs, bottoms, edges), drawn in code from the
# installed art's own palettes (0 generations). 1 px = 2 mm, like the rest.
#   python3 -I _tools/art/faces.py OUT_DIR
# Face axes (pc/pc.css): f-top/f-bottom: x right, y down. f-front/f-back: x right,
# row 0 at the board (z = 0). f-left/f-right: column 0 at the board (z = 0), y down.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import png  # noqa: E402

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

# Palettes, taken from the installed art (most common colours of each file).
OUTL = (24, 26, 33)                                                   # outlines
SHROUD = [(40, 42, 52), (50, 53, 65), (62, 64, 77), (105, 110, 123), (150, 155, 168)]   # gpu-3fan-front
STEEL = [(110, 113, 124), (138, 141, 153), (164, 165, 174), (209, 209, 216)]            # hdd-top, psu-fan
PSU = [(36, 37, 45), (44, 46, 55), (61, 63, 73), (80, 82, 94)]                          # psu-fan
PCB = [(18, 42, 31), (24, 55, 40), (31, 68, 51), (42, 82, 61)]                          # board-atx
SOLDER = (170, 175, 185)
GOLD, GOLD_D = (201, 162, 58), (150, 115, 40)                                           # ram/cpu art
COPPER = [(140, 95, 72), (184, 131, 105), (204, 153, 124)]                              # cooler-side
FIN = [(82, 89, 105), (120, 124, 138), (159, 159, 170)]                                 # cooler-side
FRAME = [(18, 21, 28), (48, 50, 61), (58, 60, 70), (75, 78, 90)]                        # case-fan
BLACK = (16, 17, 22)
LABEL = (196, 198, 205)


class Img:
    def __init__(self, w, h, c):
        self.w, self.h, self.p = w, h, png.blank(w, h, c)

    def put(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[y][x] = tuple(c) + (255,)

    def rect(self, x0, y0, x1, y1, c):            # inclusive
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.put(x, y, c)

    def box(self, x0, y0, x1, y1, fill, edge):
        self.rect(x0, y0, x1, y1, fill)
        for x in range(x0, x1 + 1):
            self.put(x, y0, edge); self.put(x, y1, edge)
        for y in range(y0, y1 + 1):
            self.put(x0, y, edge); self.put(x1, y, edge)

    def bevel(self, x0, y0, x1, y1, fill, light, dark):   # raised panel
        self.rect(x0, y0, x1, y1, fill)
        for x in range(x0, x1 + 1):
            self.put(x, y0, light); self.put(x, y1, dark)
        for y in range(y0, y1 + 1):
            self.put(x0, y, light); self.put(x1, y, dark)

    def grain(self, c0, c1, seed=1, every=7):     # a little texture on flat metal
        for y in range(self.h):
            for x in range(self.w):
                n = (x * 374761393 + y * 668265263 + seed * 1442695041) & 0xFFFFFFFF   # hash: speckle, not stripes
                n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
                if self.p[y][x][:3] == tuple(c0) and (n >> 8) % (every * 3) == 0:
                    self.p[y][x] = tuple(c1) + (255,)

    def outline(self, c=OUTL):
        for x in range(self.w):
            self.put(x, 0, c); self.put(x, self.h - 1, c)
        for y in range(self.h):
            self.put(0, y, c); self.put(self.w - 1, y, c)

    def screw(self, x, y, c=STEEL[2], d=OUTL):
        self.put(x, y, c); self.put(x + 1, y, d); self.put(x, y + 1, d); self.put(x + 1, y + 1, c)

    def transposed(self):                          # x <-> y: art drawn along x, used on a z face
        t = Img(self.h, self.w, (0, 0, 0))
        t.p = [[self.p[x][y] for x in range(self.h)] for y in range(self.w)]
        return t

    def save(self, name):
        png.write(os.path.join(OUT, name + ".png"), self.w, self.h, self.p)
        return name


made = []

# ---------- Graphics card (drawn at the 3-fan card's size; the 2-fan card stretches it) ----------
# Backplate (f-back, 152 x 62): brushed plate, screw ring round the chip, flow-through cut-out at the far end.
im = Img(152, 62, SHROUD[2])
im.grain(SHROUD[2], SHROUD[1], 1, 5)
im.bevel(2, 2, 149, 59, SHROUD[2], SHROUD[3], SHROUD[0])
im.grain(SHROUD[2], SHROUD[1], 2, 6)
for x in range(4, 148, 2):                          # a stamped line along the board edge
    im.put(x, 6, SHROUD[1])
im.box(112, 10, 146, 54, BLACK, OUTL)              # flow-through vent, with fin lines showing through
for x in range(114, 145, 3):
    im.rect(x, 12, x, 52, FIN[0])
for (sx, sy) in [(40, 16), (64, 16), (40, 42), (64, 42), (8, 10), (8, 50), (104, 10), (104, 50)]:
    im.screw(sx, sy)
im.box(46, 22, 58, 36, SHROUD[1], SHROUD[3])       # the chip's mounting bracket outline
im.outline()
made.append(im.save("gpu-back"))

# Top edge (f-top, 152 x 27): shroud edge, light strip, power connector two-thirds along.
im = Img(152, 27, SHROUD[1])
im.grain(SHROUD[1], SHROUD[0], 3, 6)
im.rect(0, 0, 151, 3, SHROUD[3])                  # backplate edge
im.rect(6, 12, 92, 14, SHROUD[4])                 # light strip
im.box(100, 8, 116, 19, BLACK, OUTL)              # 16-pin power socket
for x in range(102, 115, 2):
    for y in (11, 15):
        im.put(x, y, STEEL[0])
im.outline()
made.append(im.save("gpu-edge"))

# Bottom edge (f-bottom, 152 x 27): the board's edge and the gold slot contacts.
im = Img(152, 27, SHROUD[1])
im.rect(0, 0, 151, 3, SHROUD[3])
im.rect(0, 9, 151, 17, PCB[1])
for x in range(20, 64):
    im.rect(x, 11, x, 15, GOLD if x % 2 else GOLD_D)
im.rect(64, 11, 66, 15, PCB[0])                    # the key notch
for x in range(67, 110):
    im.rect(x, 11, x, 15, GOLD if x % 2 else GOLD_D)
im.outline()
made.append(im.save("gpu-bottom"))

# Bracket (f-left, 62 x 27; columns run up from the board): steel plate, display outputs, vents.
im = Img(62, 27, STEEL[2])
im.grain(STEEL[2], STEEL[1], 4, 6)
for i, (x0, w) in enumerate([(4, 8), (15, 8), (26, 8), (37, 9)]):   # three display ports, one wider HDMI-style
    im.box(x0, 9, x0 + w, 15, BLACK, OUTL)
    im.rect(x0 + 2, 11, x0 + w - 2, 12, STEEL[0])
for x in range(49, 59, 2):                         # vent slots
    im.rect(x, 4, x, 22, OUTL)
im.rect(0, 0, 61, 1, STEEL[3])
im.outline(STEEL[0])
made.append(im.save("gpu-bracket"))

# Far end (f-right, 62 x 27): shroud end with fins showing.
im = Img(62, 27, SHROUD[1])
im.rect(0, 0, 61, 3, SHROUD[3])
for x in range(6, 56, 3):
    im.rect(x, 7, x, 20, FIN[0])
im.outline()
made.append(im.save("gpu-end"))

# ---------- Power supply (drawn at ATX size; SFX stretches it) ----------
# Rear (f-left, 75 x 43; columns up from the tray): honeycomb, mains socket, switch.
im = Img(75, 43, PSU[1])
for y in range(4, 39, 3):                          # honeycomb vents
    for x in range(4 + (y // 3 % 2) * 2, 40, 4):
        im.rect(x, y, x + 1, y + 1, OUTL)
im.box(46, 10, 62, 24, BLACK, OUTL)                # mains socket
im.rect(50, 14, 51, 20, STEEL[1]); im.rect(57, 14, 58, 20, STEEL[1]); im.rect(53, 21, 55, 22, STEEL[1])
im.box(64, 12, 70, 22, BLACK, OUTL)                # switch
im.rect(66, 14, 68, 16, STEEL[2])
im.screw(2, 2); im.screw(71, 2); im.screw(2, 39); im.screw(71, 39)
im.outline()
made.append(im.save("psu-rear"))

# Cable end (f-right, 75 x 43): modular sockets.
im = Img(75, 43, PSU[1])
for (x0, y0, x1, y1) in [(6, 6, 30, 14), (34, 6, 50, 14), (54, 6, 68, 14), (6, 20, 18, 28), (22, 20, 34, 28),
                         (38, 20, 50, 28), (54, 20, 68, 28), (6, 32, 20, 38), (24, 32, 38, 38)]:
    im.box(x0, y0, x1, y1, BLACK, OUTL)
    for x in range(x0 + 2, x1 - 1, 2):
        im.put(x, y0 + 3, PSU[3]); im.put(x, y1 - 3, PSU[3])
im.outline()
made.append(im.save("psu-cables"))

# Side away from the fan (f-back, 80 x 75): plain steel, a blank recessed label panel, screws.
im = Img(80, 75, PSU[2])
im.grain(PSU[2], PSU[1], 5, 6)
im.bevel(14, 14, 66, 60, PSU[1], PSU[0], PSU[3])
im.screw(4, 4); im.screw(74, 4); im.screw(4, 69); im.screw(74, 69)
im.outline()
made.append(im.save("psu-side"))

# Top and bottom (f-top / f-bottom, 80 x 43): plain steel with a pressed rib.
im = Img(80, 43, PSU[2])
im.grain(PSU[2], PSU[1], 6, 6)
im.rect(6, 20, 73, 21, PSU[3]); im.rect(6, 22, 73, 22, PSU[0])
im.outline()
made.append(im.save("psu-flat"))

# ---------- Drives ----------
def drive_faces(prefix, w, d, h, pcb):
    b = Img(w, d, STEEL[1])                        # underside
    b.grain(STEEL[1], STEEL[0], 7, 6)
    if pcb:                                        # a hard drive's controller board
        b.box(4, 6, w - 5, d - 7, PCB[1], PCB[0])
        b.box(10, 12, 24, 22, BLACK, OUTL); b.box(30, 12, 38, 18, BLACK, OUTL); b.box(10, 28, 16, 32, BLACK, OUTL)
        for x in range(42, w - 8, 4):
            b.put(x, 30, SOLDER); b.put(x, 34, SOLDER)
    else:                                          # a solid-state drive's blank label
        b.box(6, 6, w - 7, d - 7, LABEL, STEEL[1])
    for (x, y) in [(2, 2), (w - 4, 2), (2, d - 4), (w - 4, d - 4)]:
        b.screw(x, y)
    b.outline(STEEL[0])
    made.append(b.save(prefix + "-bottom"))
    s = Img(w, h, STEEL[2])                        # long sides, with the mounting holes
    for x in (w // 6, w // 2, w * 5 // 6):
        s.put(x, h // 2, OUTL)
        if h > 6: s.put(x + 1, h // 2, OUTL)
    s.outline(STEEL[0])
    made.append(s.save(prefix + "-side"))
    e = Img(h, d, STEEL[2])                        # connector end (columns up from the tray)
    e.box(max(1, h // 4), 4, max(2, h * 3 // 4), d // 2 - 2, BLACK, OUTL)          # SATA data
    e.box(max(1, h // 4), d // 2 + 1, max(2, h * 3 // 4), d - 5, BLACK, OUTL)      # SATA power
    e.outline(STEEL[0])
    made.append(e.save(prefix + "-sata"))
    p = Img(h, d, STEEL[2]); p.outline(STEEL[0])
    made.append(p.save(prefix + "-end"))

drive_faces("hdd", 74, 51, 13, True)
drive_faces("ssd", 50, 35, 4, False)

# ---------- Motherboards: the underside (solder, mounting holes) ----------
for name, w, d in [("board-atx", 152, 122), ("board-matx", 122, 122), ("board-itx", 85, 85)]:
    im = Img(w, d, PCB[1])
    im.grain(PCB[1], PCB[0], 8, 5)
    for y in range(6, d - 6, 9):                   # traces
        for x in range(4, w - 4):
            if (x // 11 + y) % 3 == 0:
                im.put(x, y, PCB[2])
    for (x0, y0) in [(60, 20), (64, 20), (68, 20)] if w > 100 else [(20, 12), (24, 12)]:
        for k in range(0, 24, 3):
            im.put(x0, y0 + k, SOLDER)
    for x in range(10, w - 10, 3):                 # socket pins' solder field and slot pins
        im.put(x, d // 2 + 10, SOLDER)
    holes = [(3, 3), (w - 5, 3), (3, d - 5), (w - 5, d - 5), (w // 2, 3), (w // 2, d - 5)]
    for (x, y) in holes:
        im.box(x, y, x + 2, y + 2, GOLD_D, GOLD)
        im.put(x + 1, y + 1, OUTL)
    im.outline(PCB[0])
    made.append(im.save(name + "-bottom"))

# ---------- Processor ----------
im = Img(20, 20, PCB[2])                           # contact pads
for y in range(2, 18):
    for x in range(2, 18):
        if not (7 <= x <= 12 and 7 <= y <= 12):
            im.put(x, y, GOLD if (x + y) % 2 else PCB[1])
for (x, y) in [(2, 16), (2, 17), (3, 17)]:
    im.put(x, y, LABEL)                            # the corner marker
im.outline(PCB[0])
made.append(im.save("cpu-bottom"))
e = Img(20, 3, STEEL[2])                          # edge: substrate below, lid above
e.rect(0, 0, 19, 0, PCB[1]); e.rect(2, 1, 17, 2, STEEL[3]); e.rect(0, 1, 1, 2, PCB[2]); e.rect(18, 1, 19, 2, PCB[2])
made.append(e.save("cpu-edge-x"))
made.append(e.transposed().save("cpu-edge-z"))

# ---------- Memory ----------
im = Img(4, 66, SHROUD[3])                        # top of the heat spreader
for y in range(0, 66, 4):
    im.put(1, y, SHROUD[4]); im.put(2, y + 2, SHROUD[2])
im.rect(0, 0, 0, 65, SHROUD[1]); im.rect(3, 0, 3, 65, SHROUD[1])
made.append(im.save("ram-top"))
im = Img(4, 66, GOLD)                             # contact edge with the key notch
for y in range(66):
    im.put(0, y, PCB[1]); im.put(3, y, PCB[1])
    if y % 2: im.put(1, y, GOLD_D); im.put(2, y, GOLD_D)
im.rect(0, 31, 3, 33, PCB[0])
made.append(im.save("ram-bottom"))
im = Img(4, 16, SHROUD[2])                        # ends: spreader over the board
im.rect(0, 0, 3, 2, PCB[1]); im.rect(0, 13, 3, 15, SHROUD[3])
made.append(im.save("ram-end"))

# ---------- M.2 drive underside ----------
im = Img(40, 11, PCB[1])
im.box(4, 2, 30, 8, LABEL, STEEL[1])
for x in range(37, 40):
    for y in range(11):
        im.put(x, y, GOLD if y % 2 else GOLD_D)
im.rect(0, 4, 1, 6, PCB[0])
made.append(im.save("m2-bottom"))

# ---------- Coolers ----------
im = Img(38, 62, FIN[1])                          # tower: fins seen from below, copper base and pipes
for y in range(0, 62, 2):
    im.rect(0, y, 37, y, FIN[0])
im.box(9, 21, 28, 40, COPPER[1], COPPER[0])
for x in (12, 18, 24):
    im.rect(x, 3, x + 2, 58, COPPER[2]); im.rect(x + 2, 3, x + 2, 58, COPPER[0])
made.append(im.save("cooler-tower-bottom"))

side = Img(48, 24, FIN[1])                        # low-profile: base, fins, fan frame on top
side.rect(0, 0, 47, 2, COPPER[1])
for y in range(4, 17, 2):
    side.rect(0, y, 47, y, FIN[0])
for x in (10, 22, 34):
    side.rect(x, 3, x + 1, 16, COPPER[2])
side.rect(0, 17, 47, 23, FRAME[1]); side.rect(0, 17, 47, 17, FRAME[3])
side.screw(2, 19); side.screw(44, 19)
made.append(side.save("cooler-low-side-x"))
made.append(side.transposed().save("cooler-low-side-z"))
im = Img(48, 48, FIN[1])
for y in range(0, 48, 2):
    im.rect(0, y, 47, y, FIN[0])
im.box(14, 14, 33, 33, COPPER[1], COPPER[0])
made.append(im.save("cooler-low-bottom"))

side = Img(30, 23, PSU[1])                        # pump block: copper plate, body, a lit ring line
side.rect(0, 0, 29, 2, COPPER[1])
side.rect(1, 3, 28, 21, PSU[2]); side.rect(1, 3, 28, 3, PSU[3])
side.rect(2, 16, 27, 16, SHROUD[4])
side.outline()
made.append(side.save("pump-side-x"))
made.append(side.transposed().save("pump-side-z"))
im = Img(30, 30, PSU[2])
im.box(7, 7, 22, 22, COPPER[1], COPPER[0])
for (x, y) in [(2, 2), (26, 2), (2, 26), (26, 26)]:
    im.screw(x, y)
made.append(im.save("pump-bottom"))

# ---------- Radiators: fins behind the fans, tanks at the ends ----------
for name, w in [("rad-240", 138), ("rad-360", 198)]:
    im = Img(w, 60, FIN[1])
    for x in range(8, w - 8):
        if x % 2:
            im.rect(x, 2, x, 57, FIN[0])
    im.rect(0, 0, 7, 59, FRAME[1]); im.rect(w - 8, 0, w - 1, 59, FRAME[1])
    im.rect(8, 0, w - 9, 1, FRAME[2]); im.rect(8, 58, w - 9, 59, FRAME[2])
    im.outline()
    made.append(im.save(name + "-back"))
    e = Img(w, 14, FRAME[2])                      # top and bottom edges: the fin pack's edge
    for x in range(8, w - 8, 2):
        e.rect(x, 3, x, 10, FIN[1])
    e.rect(0, 0, 7, 13, FRAME[1]); e.rect(w - 8, 0, w - 1, 13, FRAME[1])
    e.outline()
    made.append(e.save(name + "-edge"))
e = Img(60, 14, FRAME[1])                         # tank end with the two tube fittings
for cx in (22, 38):
    e.box(cx - 3, 4, cx + 3, 10, BLACK, FRAME[3])
e.outline()
made.append(e.save("rad-tubes"))
e = Img(60, 14, FRAME[1]); e.outline()
made.append(e.save("rad-end"))

# ---------- Case fans: the frame's four edges ----------
im = Img(13, 60, FRAME[2])
im.rect(0, 0, 12, 9, FRAME[3]); im.rect(0, 50, 12, 59, FRAME[3])     # corner lugs
im.rect(6, 10, 6, 49, FRAME[1])                                        # moulding seam
im.screw(5, 4); im.screw(5, 54)
im.outline(FRAME[0])
made.append(im.save("fan-edge"))


# ---------- Thin edges: motherboards and the M.2 drive (3 mm, so 2 px) ----------
# The layered board edge: dark laminate with a copper layer line.
for name, w, d in [("board-atx", 152, 122), ("board-matx", 122, 122), ("board-itx", 85, 85), ("m2", 40, 11)]:
    e = Img(w, 2, PCB[0])
    for x in range(w):
        e.put(x, 1, COPPER[0] if x % 3 else PCB[2])
    made.append(e.save(name + "-edge-x"))                  # f-front / f-back: along x, row 0 at the bottom
    made.append(e.transposed().save(name + "-edge-z"))     # f-left / f-right: column 0 at the bottom
print(len(made), "faces in all")
