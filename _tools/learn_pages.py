# Generates the Learn: Build a PC pages (learn-pc*.html) as plain static HTML.
# Edit the content here, then run from the repo root:  python3 -I _tools/learn_pages.py .
# Never hand-edit the generated pages: the next run overwrites them.
# Not published (Jekyll skips _ folders); not a build step: the output is committed.
import sys, os, html

REPO = sys.argv[1]
# Bump when pc/pc.css or pc/builder.css changes (and the ?v= in pc-builder.html),
# so browsers fetch the new file instead of a cached one.
CSS_V = "20261125j"
FACES = '<i class="f-bottom"></i><i class="f-back"></i><i class="f-right"></i><i class="f-left"></i><i class="f-front"></i><i class="f-top"></i>'

# key -> (page file, short title)
PAGES = [
    ("cpu", "learn-pc-cpu.html", "Processor"),
    ("board", "learn-pc-motherboard.html", "Motherboard"),
    ("ram", "learn-pc-ram.html", "Memory"),
    ("storage", "learn-pc-storage.html", "Storage"),
    ("gpu", "learn-pc-gpu.html", "Graphics card"),
    ("cooler", "learn-pc-cooler.html", "CPU cooler"),
    ("psu", "learn-pc-psu.html", "Power supply"),
    ("case", "learn-pc-case.html", "Case"),
    ("fans", "learn-pc-fans.html", "Case fans"),
]
FILE = {k: f for k, f, _ in PAGES}

# The stage: (part key, classes, label)
STAGE = [
    ("case", "slot-case shape-case case-box", ""),
    ("board", "slot-board shape-board-atx", "Motherboard"),
    ("cpu", "slot-cpu shape-cpu", "Processor"),
    ("cooler", "slot-cooler shape-cooler-tower", "Cooler"),
    ("ram", "slot-ram2 shape-ram", ""),
    ("ram", "slot-ram4 shape-ram", "Memory"),
    ("storage", "slot-m2a shape-m2", "M.2 drive"),
    ("gpu", "slot-gpu shape-gpu-3fan cat-gpu", "Graphics card"),
    ("psu", "slot-psu shape-psu-atx", "Power supply"),
    ("storage", "slot-drive1 shape-drive-35", "Hard drive"),
    ("fans", "slot-fan1 shape-fan cat-fan", "Case fans"),
    ("fans", "slot-fan2 shape-fan cat-fan", ""),
    ("fans", "slot-fan3 shape-fan cat-fan", ""),
]


def stage_overview():
    rows = []
    for key, cls, label in STAGE:
        tag = f'<span class="tag">{label}</span>' if label else ""
        rows.append(f'                <a class="part {cls}" href="{FILE[key]}" tabindex="-1">{FACES}{tag}</a>')
    return "\n".join(rows)


def stage_for(here):
    rows = []
    for key, cls, label in STAGE:
        state = "here" if key == here else "dim"
        tag = f'<span class="tag">{label}</span>' if (label and key == here) else ""
        rows.append(f'                <div class="part {cls} {state}">{FACES}{tag}</div>')
    return "\n".join(rows)


def page(file, title, desc, body):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(title)} | N8Codes</title>
    <meta name="description" content="{html.escape(desc)}">
    <link rel="icon" type="image/png" href="icon.png">
    <link rel="apple-touch-icon" href="icon.png">
    <meta name="theme-color" content="#15803d">
    <link rel="canonical" href="https://n8codes.github.io/{file}">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="pc/pc.css?v={CSS_V}">
</head>
<body>
<header class="container">
    <nav class="nav">
        <a class="brand" href="index.html">N8Codes</a>
        <div class="links">
            <a href="index.html#games">Games</a>
            <a href="index.html#apps">Apps</a>
            <a href="learn-pc.html">Guide</a>
            <a href="pc-builder.html">PC builder</a>
            <a href="privacy.html">Privacy</a>
        </div>
    </nav>
</header>

<main class="container prose">
{body}
</main>

<footer class="site-foot">
    <div class="container foot-grid">
        <section><h2>Safety</h2><p>Unplug before opening the case, touch bare metal first, and never open a power supply. <a href="learn-pc-safety.html">Safety guide</a></p></section>
        <section><h2>Parts</h2><p>Parts shown are generic examples. N8Codes is not affiliated with any hardware maker. Names of standards such as HDMI, DisplayPort, PCIe and Wi-Fi are trademarks of their owners.</p></section>
        <section><h2>Privacy</h2><p>No cookies, no trackers, no scripts. <a href="privacy-pcbuilder.html">Privacy policy</a></p></section>
    </div>
    <div class="container foot-base">© 2026 N. W. Heard. All rights reserved.</div>
</footer>
</body>
</html>
'''


def head(crumb, h1, lede):
    return f'''    <div class="learn-head">
        <p class="crumbs"><a href="learn-pc.html">Build a PC</a> › {crumb}</p>
        <h1>{h1}</h1>
        <p class="lede">{lede}</p>
    </div>'''


def small_stage(here):
    return f'''
    <div class="stage-wrap exploded" aria-hidden="true">
        <div class="scene">
            <div class="rig">
{stage_for(here)}
            </div>
        </div>
    </div>'''


# One plain sentence per spec: what you see on the card before opening it.
GIST = {
    "Socket": "Must match the motherboard exactly.",
    "Cores and threads": "More cores do more jobs at once.",
    "Clock speed": "Higher is faster, within one generation.",
    "Power": "Sets how strong the cooler and power supply must be.",
    "Cache": "Fast memory on the chip; more helps some games.",
    "Memory support": "Which kind of RAM it can use.",
    "Built-in graphics": "Can it show a picture without a graphics card?",
    "Chipset": "Sets how many extra ports and features you get.",
    "Form factor": "Its size: the case has to fit it.",
    "Memory": "How many RAM sticks fit, and which kind.",
    "M.2 slots and SATA ports": "How many drives you can connect.",
    "Expansion slots": "Where the graphics card and add-in cards go.",
    "Back panel": "The ports on the back of the computer.",
    "Type": "DDR4 or DDR5: must match the motherboard.",
    "Capacity": "How much it holds.",
    "Kit size": "Buy a matched pair for full speed.",
    "Speed and latency": "Higher speed and lower CL are faster.",
    "Height": "Must fit: tall parts can block each other or the side panel.",
    "Interface": "NVMe is the fast one.",
    "PCIe generation": "Newer is faster, and works in older slots.",
    "Size code": "The drive's size: 2280 is the usual one.",
    "Endurance": "How much it can write before wearing out. Rarely a worry.",
    "Video memory": "More helps at high resolutions and detail.",
    "Length": "Must fit inside the case.",
    "Thickness": "How many slots wide it is.",
    "Recommended power supply": "The power supply size the card maker suggests.",
    "Power connectors": "The plugs it needs from the power supply.",
    "Outputs": "Plug the monitor in here.",
    "Radiator size": "For liquid coolers: must fit a spot in the case.",
    "Socket support": "Must list your processor's socket.",
    "Cooling rating": "How much heat it can handle.",
    "Wattage": "Must cover all the parts at full load, with room to spare.",
    "Efficiency rating": "Higher wastes less power as heat.",
    "Modular cables": "Lets you leave out the cables you don't need.",
    "Connectors": "Must have the plugs your parts need.",
    "Motherboard sizes": "Which boards fit.",
    "Graphics card length": "The longest card that fits.",
    "CPU cooler height": "The tallest air cooler that fits.",
    "Radiator support": "Where a liquid cooler's radiator can go.",
    "Power supply": "Which power supply size fits.",
    "Drive bays": "Places for hard drives and SATA SSDs.",
    "Size": "Frame width: bigger is usually quieter.",
    "Airflow": "How much air it moves.",
    "Static pressure": "How well it pushes through radiators and filters.",
    "Speed": "Set by the motherboard from temperatures.",
    "Connector": "4-pin lets the board control speed precisely.",
    "Noise": "Lower is quieter.",
}
# Per-page overrides where one name means different things
GIST_PAGE = {
    ("board", "Socket"): "Must match the processor exactly.",
    ("ram", "Capacity"): "More lets you keep more open at once.",
    ("ram", "Height"): "Tall sticks can block a big air cooler.",
    ("cooler", "Height"): "Must fit under the case's side panel.",
    ("gpu", "Power"): "Usually the biggest power user in the computer.",
    ("storage", "Capacity"): "How much it holds.",
    ("psu", "Form factor"): "Its size: ATX for most cases, SFX for small ones.",
    ("case", "Expansion slots"): "Limits how thick the graphics card can be.",
}


def checklist(items):
    lis = "\n".join(f'            <li>{t}</li>' for t in items)
    return f'''
    <div class="check-box">
        <strong>Before you buy</strong>
        <ul>
{lis}
        </ul>
    </div>'''


def more(q, a):
    return f'''
    <details class="more">
        <summary>{q}</summary>
        <p>{a}</p>
    </details>'''


def pager(key):
    i = [k for k, _, _ in PAGES].index(key)
    prev = ('learn-pc.html', 'All parts') if i == 0 else (PAGES[i - 1][1], PAGES[i - 1][2])
    nxt = ('learn-pc-connections.html', 'How it all connects') if i == len(PAGES) - 1 else (PAGES[i + 1][1], PAGES[i + 1][2])
    return f'''
    <nav class="pager" aria-label="Parts">
        <a href="{prev[0]}">← {prev[1]}</a>
        <a href="{nxt[0]}">Next: {nxt[1]} →</a>
    </nav>'''


CONTENT = {}

CONTENT["cpu"] = dict(
    title="The processor (CPU)", desc="What a computer's processor does, what its specs mean, and what it connects to.",
    lede="The processor runs every program on the computer. Each instruction, from moving the mouse to working out a game's physics, passes through it.",
    what='''    <h2>What it does</h2>
    <p>A program is a long list of small steps: add these numbers, compare those, fetch this from memory. The processor works through those steps billions of times a second. It does this on several <strong>cores</strong> at once, and each core is a complete worker of its own. Some jobs split neatly across cores, such as exporting video or compiling code. Others mostly wait on one core, which is true of many games. That is why both the number of cores and the speed of each core matter.</p>
    <p>Many processors also have a small graphics unit built in. It is enough for a desktop and video, but not for demanding games. A processor without one needs a graphics card to show any picture at all.</p>''',
    specs=[
        ("Socket", "e.g. AM5, LGA 1851", "The shape and contact layout of the processor's underside. It must match the motherboard's socket exactly. This is the first thing to check, and the most common mistake."),
        ("Cores and threads", "e.g. 8 cores, 16 threads", "Cores are separate workers. A thread is a stream of work a core keeps going; some cores handle two at once. More cores help most with work that splits up."),
        ("Clock speed", "e.g. 4.2 GHz base, up to 5.4 GHz boost", "How many steps a core takes per second, in billions. Boost is the top speed for short bursts while the processor is cool enough. Only compare clock speeds within the same generation: newer designs do more per step."),
        ("Power", "e.g. 65 W, 120 W", "Roughly how much heat the processor gives off under load, in watts. Makers call it TDP or base power, and most list a higher maximum too, which many processors hold for as long as the load lasts. Size the cooler and power supply for the higher figure. The cooler has to remove it and the power supply has to provide it."),
        ("Cache", "e.g. 32 MB", "A small store of very fast memory on the chip itself. A bigger cache means fewer trips out to the RAM, which helps some games noticeably."),
        ("Memory support", "e.g. DDR5 only", "Which generation of RAM the processor can drive. The motherboard settles the final choice: a board has DDR4 slots or DDR5 slots, never both."),
        ("Built-in graphics", "yes / no", "Whether the processor can drive a monitor on its own, through the motherboard's video ports."),
    ],
    connects=[
        ("Motherboard socket", "It sits in the socket, held down by a lever or a frame. A small triangle on one corner shows which way round it goes."),
        ("Cooler", "The cooler presses on top, with a thin layer of thermal paste between them to carry the heat across."),
        ("Memory", "The processor talks to the RAM directly, through lines running from the socket to the memory slots."),
        ("Graphics card and fast drives", "The processor's own PCIe lanes run to the main graphics slot and usually to the first M.2 slot."),
        ("Power", "A separate 8-pin cable (sometimes two) from the power supply plugs in near the top of the board. It is labelled CPU or EPS."),
    ],
    check=[
        "Make sure the socket matches the motherboard.",
        "Find this exact processor in the motherboard maker's <b>CPU support list</b>. It may need a newer BIOS than the board shipped with.",
        "Check that the cooler fits the socket and can handle the processor's power. Many processors come without a cooler.",
        "No built-in graphics? Then you need a graphics card.",
    ],
    more=[("Why might a processor with the right socket still not start?",
           "The socket only means it fits physically. The board's firmware (BIOS) also has to know the processor, so a board made before the processor came out may need an update first. Some boards can update the BIOS from a USB stick with no processor installed. The support list says which BIOS version is needed.")],
)

CONTENT["board"] = dict(
    title="The motherboard", desc="What a motherboard does, what its specs mean, and what plugs into it.",
    lede="The motherboard is the board everything plugs into. It carries power and data between the parts, and its firmware starts the computer.",
    what='''    <h2>What it does</h2>
    <p>Every other part connects to the motherboard: the processor sits in its socket, the memory and drives go in its slots, and the power supply feeds it. The copper lines in the board are the roads between them.</p>
    <p>The board's <strong>chipset</strong> adds extra connections on top of the processor's own: more drive slots, USB ports, networking and sound. Its <strong>firmware</strong> (the BIOS, or UEFI) is the small program that checks the parts and hands over to the operating system when you press the power button.</p>''',
    specs=[
        ("Socket", "e.g. AM5, LGA 1851", "Which processors fit the board."),
        ("Chipset", "e.g. a B- or Z-series chipset", "Decides how many extra slots and ports the board has, and features such as overclocking. Each processor maker names its own chipset families."),
        ("Form factor", "ATX, Micro-ATX, Mini-ITX", "The board's size and screw-hole layout. ATX is 305 × 244 mm, Micro-ATX up to 244 × 244 mm, Mini-ITX 170 × 170 mm. The case must list it."),
        ("Memory", "e.g. 4 slots, DDR5", "How many memory sticks fit and which generation. Mini-ITX boards usually have two slots."),
        ("M.2 slots and SATA ports", "e.g. 3 × M.2, 4 × SATA", "Where drives connect. M.2 drives plug straight into the board; SATA drives use a cable."),
        ("Expansion slots", "e.g. 1 × PCIe 5.0 x16", "Long slots for a graphics card and other add-in cards. The top long slot is usually the one wired to the processor."),
        ("Back panel", "USB, network, Wi-Fi, video out", "The board's video outputs only work with a processor that has built-in graphics."),
    ],
    connects=[
        ("Processor, memory and drives", "In the socket, the memory slots and the M.2 slots."),
        ("Graphics card", "In the long PCIe x16 slot."),
        ("Power supply", "A large 24-pin cable for the board, plus one or two 8-pin cables for the processor."),
        ("Case", "Screws into raised standoffs in the case. Small cables from the case's power button, USB and audio jacks plug into labelled pins on the board."),
        ("Fans and cooler", "Small 4-pin fan headers, labelled CPU_FAN, CHA_FAN or AIO_PUMP."),
    ],
    check=[
        "The socket matches the processor, and the processor is on the board's CPU support list.",
        "The form factor is one the case supports.",
        "The memory type (DDR4 or DDR5) matches the memory you buy.",
        "There are enough M.2 slots for your drives. Check the manual for slots that share lanes: on some boards, using one M.2 slot turns off a PCIe slot.",
    ],
    more=[("Why can using one slot turn another off?",
           "Slots get their bandwidth from a fixed number of PCIe lanes, from the processor or the chipset. To offer more slots than lanes, makers let two slots share. Use one and the other goes quiet. The board's manual has a table showing which ones share.")],
)

CONTENT["ram"] = dict(
    title="Memory (RAM)", desc="What a computer's memory does, what its specs mean, and how to choose it.",
    lede="Memory is the computer's short-term workspace: fast space for whatever is running right now. It is wiped every time the power goes off.",
    what='''    <h2>What it does</h2>
    <p>Programs and files live on the drive, but the processor can't work on them there: the drive is far too slow. So whatever you're using is copied into memory, where the processor can reach it in well under a millionth of a second.</p>
    <p>More memory means more programs, browser tabs and game data can stay ready at once. When memory runs out, the computer parks some of it on the drive instead, and everything slows down.</p>''',
    specs=[
        ("Type", "DDR4 or DDR5", "The memory generation. The two have their notch in different places, so a stick physically fits only its own kind of slot. The motherboard decides which one you need."),
        ("Capacity", "e.g. 32 GB (2 × 16 GB)", "How much the kit holds in total, and how it's split across sticks."),
        ("Kit size", "e.g. 2 sticks", "Memory works fastest in pairs (dual channel). Buy the sticks as one kit, so they're matched, and put them in the slots the board's manual names, often the second and fourth. Four DDR5 sticks usually run slower than two."),
        ("Speed and latency", "e.g. 6000 MT/s, CL30", "How fast data moves, and how long each request waits. The rated speed usually needs the kit's memory profile turned on in the BIOS; without it, the memory runs at a slower default."),
        ("Height", "e.g. 35 mm", "Tall heat spreaders can get in the way of a large air cooler that overhangs the memory slots."),
    ],
    connects=[
        ("Memory slots", "Next to the processor socket. Clips at the ends lock the stick in when it's pushed down firmly."),
        ("Processor", "The memory controller is inside the processor, so the lines run straight from the slots to the socket."),
    ],
    check=[
        "The type matches the motherboard (DDR4 or DDR5).",
        "The kit doesn't have more sticks than the board has slots.",
        "For the best chance of reaching the rated speed, look for the kit on the board maker's memory support list (often called the QVL).",
        "With a big air cooler, check that the memory isn't too tall.",
    ],
    more=[("Why does a new computer sometimes take a minute to start the first time?",
           "On the first start, the board tests and tunes its timing with each memory stick. With DDR5 this can take a minute or more, and the screen may stay black. Let it finish rather than switching off.")],
)

CONTENT["storage"] = dict(
    title="Storage", desc="SSDs and hard drives: what they do, what their specs mean, and how they connect.",
    lede="Storage keeps your files, programs and operating system while the power is off.",
    what='''    <h2>What it does</h2>
    <p>Everything you keep lives on a drive. When you open something, it's copied from the drive into memory, so a faster drive means faster start-ups and loading screens.</p>
    <p>There are three common kinds:</p>
    <ul>
        <li><strong>M.2 NVMe SSD</strong>: a small stick that plugs straight into the motherboard. The fastest kind, and the usual home for the operating system.</li>
        <li><strong>SATA SSD</strong>: a 2.5-inch box that takes a data cable and a power cable. Slower than NVMe, still much faster than a hard drive.</li>
        <li><strong>Hard drive</strong>: a 3.5-inch box with spinning disks inside. The most space for the money, but slower, a little noisy, and sensitive to knocks.</li>
    </ul>''',
    specs=[
        ("Interface", "NVMe or SATA", "How the drive talks to the board. NVMe uses fast PCIe lanes; SATA is an older, slower link."),
        ("Capacity", "e.g. 2 TB", "Makers count 1 TB as 1000 GB, while computers count in powers of two, so a 2 TB drive shows up as about 1.8 TB."),
        ("PCIe generation", "e.g. Gen 4, Gen 5", "The speed of the link an NVMe drive uses. A newer drive works in an older slot, at the slot's speed."),
        ("Size code", "e.g. 2280", "For M.2 drives: 22 mm wide, 80 mm long. Most boards take 2280; some slots also take shorter or longer drives."),
        ("Endurance", "e.g. 1,200 TBW", "How much data the maker expects can be written before the drive wears out. Normal use takes years to get near it."),
    ],
    connects=[
        ("M.2 slot", "An M.2 drive slides into its slot at an angle and is held down by a screw or latch. No cables."),
        ("SATA port and power", "A SATA drive takes a thin data cable to the board and a power cable from the power supply."),
        ("Case drive bays", "SATA drives screw or clip into bays or brackets in the case."),
    ],
    check=[
        "The board has a free M.2 slot that takes NVMe drives (a few slots are SATA-only), in the drive's size.",
        "SATA drives need a free SATA port on the board and a bay in the case.",
        "Some M.2 slots share lanes with other slots: check the manual.",
    ],
    more=[("Should the operating system go on the fastest drive?",
           "Yes. The operating system and the programs you use most benefit most from a fast drive. Bulk files such as videos and photos are fine on a slower, bigger one.")],
)

CONTENT["gpu"] = dict(
    title="The graphics card (GPU)", desc="What a graphics card does, what its specs mean, and how it fits and connects.",
    lede="The graphics card draws the picture you see. Its chip has thousands of small cores that work on many pixels at once.",
    what='''    <h2>What it does</h2>
    <p>Drawing a frame means working out the color of millions of pixels, dozens of times a second. A graphics card does that with thousands of simple cores running side by side, plus its own fast memory to hold textures and the frame being drawn.</p>
    <p>The same parallel cores also speed up video encoding, 3D rendering and AI work. For everyday use without games, the processor's built-in graphics may be enough.</p>''',
    specs=[
        ("Video memory", "e.g. 12 GB", "Memory on the card itself, for textures and frames. Higher resolutions and detail settings need more."),
        ("Length", "e.g. 242 mm, 330 mm", "Cards vary a lot in length. The case lists the longest card it can hold."),
        ("Thickness", "e.g. 2 slots, 3.1 slots", "How many expansion-slot widths the card covers. Small cases may have room for only two or three."),
        ("Power", "e.g. 250 W", "How much power the card draws under load. Usually the biggest draw in the whole computer."),
        ("Recommended power supply", "e.g. 650 W", "The card maker's suggestion for the whole computer's power supply, with headroom built in."),
        ("Power connectors", "e.g. 2 × 8-pin, or 12V-2x6", "The plugs the card needs from the power supply. Newer cards often use a single 12V-2x6 plug: push it in all the way, and don't bend the cable sharply near the plug. Each 8-pin plug carries up to 150 W, and the card's slot gives 75 W more."),
        ("Outputs", "HDMI, DisplayPort", "Where the monitor plugs in. With a graphics card, plug the monitor into the card, not the motherboard."),
    ],
    connects=[
        ("PCIe x16 slot", "The card goes into the top long slot, and screws to the back of the case."),
        ("Power supply", "One or more power cables straight from the power supply."),
        ("Monitor", "Through the ports on the card's back plate."),
    ],
    check=[
        "The card's length fits the case, with room for front fans or a radiator.",
        "The card's thickness fits: count the case's expansion slots.",
        "The power supply has enough watts and the right plugs.",
        "Long, heavy cards can sag: a support bracket helps.",
    ],
    more=[("Why is the monitor black when the computer is running?",
           "Often the cable is in the motherboard's video port instead of the graphics card's. With a card installed, the board's ports usually stay off.")],
)

CONTENT["cooler"] = dict(
    title="The CPU cooler", desc="Air and liquid CPU coolers: what they do, what their specs mean, and how they fit.",
    lede="The cooler carries the processor's heat away, so it can run at full speed without slowing itself down.",
    what='''    <h2>What it does</h2>
    <p>A busy processor turns a lot of power into heat in a space smaller than a stamp. The cooler pulls that heat out through a metal base, spreads it over a large area, and lets a fan blow it away.</p>
    <ul>
        <li><strong>Air cooler</strong>: heat pipes carry heat from the base up into a tower of thin fins, with a fan pushing air through.</li>
        <li><strong>Low-profile air cooler</strong>: a short version for small cases, with less cooling.</li>
        <li><strong>Liquid cooler (AIO)</strong>: a pump on the processor moves liquid through tubes to a radiator with fans. "All-in-one" means it comes sealed and filled.</li>
    </ul>
    <p>A thin layer of <strong>thermal paste</strong> between the processor and the cooler fills tiny gaps. Many coolers come with it already applied.</p>''',
    specs=[
        ("Height", "e.g. 155 mm", "For air coolers: how tall it stands above the board. The case lists the tallest cooler that fits under its side panel."),
        ("Radiator size", "e.g. 240 mm, 360 mm", "For liquid coolers: the radiator's length, set by its fans (two or three 120 mm fans). The case must have a spot for it."),
        ("Socket support", "e.g. AM5, LGA 1851", "Which processor sockets its mounting brackets fit. A socket that isn't listed may need a separate kit, or may not fit at all."),
        ("Cooling rating", "e.g. up to 250 W", "Roughly how much heat the maker says it can handle. Not every maker gives one."),
    ],
    connects=[
        ("Processor", "The base presses on the processor, with thermal paste between."),
        ("Motherboard", "A bracket around the socket holds it down. Its fan plugs into the CPU_FAN header; a liquid cooler's pump uses AIO_PUMP or CPU_FAN."),
        ("Case", "A liquid cooler's radiator screws to the case at the front, top or side."),
    ],
    check=[
        "The cooler lists your processor's socket.",
        "An air cooler is shorter than the case's limit; a radiator has a place to go in the case.",
        "A large air cooler can overhang tall memory: check its memory clearance.",
        "Peel the protective film off the cooler's base before fitting it.",
    ],
    more=[("Air or liquid?",
           "Both work well. A good air cooler is simple and has no pump to wear out. A liquid cooler moves the heat to wherever the radiator sits and leaves room around the socket. Choose by what fits the case and your processor's power.")],
)

CONTENT["psu"] = dict(
    title="The power supply (PSU)", desc="What a power supply does, what its specs mean, and which cables go where.",
    lede="The power supply turns power from the wall into the low, steady voltages the parts need.",
    what='''    <h2>What it does</h2>
    <p>Wall power is high-voltage alternating current. The parts inside run on low-voltage direct current: mostly 12 volts, plus 5 and 3.3 volts. The power supply converts one to the other and keeps it steady when the load jumps.</p>
    <div class="safety-box"><strong>Never open a power supply.</strong> Even unplugged, its capacitors can hold a charge that can hurt you. If one fails, replace it.</div>''',
    specs=[
        ("Wattage", "e.g. 750 W", "How much power it can deliver continuously. Leave headroom above what the parts draw at full load: the graphics card maker's recommendation is a good guide."),
        ("Efficiency rating", "e.g. Gold, Platinum", "How little power is lost as heat while converting. Higher tiers waste less, run cooler and are often quieter."),
        ("Form factor", "ATX or SFX", "Its size. Most cases take ATX; small cases often need the smaller SFX."),
        ("Modular cables", "fully, semi, or none", "Whether the cables unplug from the power supply, so you only fit the ones you need."),
        ("Connectors", "24-pin, 8-pin, 12V-2x6, SATA", "Which plugs it has, and how many. Check there are enough for the graphics card and the drives. Supplies built to ATX 3.0 or 3.1 are made for graphics cards' short power spikes and usually have a 12V-2x6 cable (12VHPWR on older ones)."),
    ],
    connects=[
        ("Motherboard", "The 24-pin cable for the board, and the 8-pin CPU (EPS) cable or cables for the processor."),
        ("Graphics card", "PCIe 8-pin or 12V-2x6 cables, depending on the card."),
        ("Drives", "SATA power cables for SATA drives. M.2 drives get power through the board."),
        ("The wall", "A standard power cord. The switch on the back must be on (|) to start."),
    ],
    check=[
        "Enough watts, with headroom, for the processor and graphics card together.",
        "The right size (ATX or SFX) for the case.",
        "The plugs the graphics card needs.",
        "Only use the cables that came with this power supply. Modular cables from another model can fit but be wired differently at the power supply end, and that can destroy parts.",
    ],
    more=[("Is a bigger power supply always better?",
           "Not past a point. A power supply only delivers what the parts ask for, so extra watts don't make anything faster. Enough headroom for spikes and future upgrades is the goal.")],
)

CONTENT["case"] = dict(
    title="The case", desc="What to look for in a computer case: sizes, clearances, radiator and drive space.",
    lede="The case holds everything, keeps dust out, and shapes the path the air takes through the parts.",
    what='''    <h2>What it does</h2>
    <p>The case is the frame: the motherboard screws to it, drives and the power supply sit in it, and the front panel gives you the power button and USB ports. Its panels, vents and fan mounts also decide how air can flow through it.</p>''',
    specs=[
        ("Motherboard sizes", "ATX, Micro-ATX, Mini-ITX", "Which board sizes it has holes for. A bigger case usually takes smaller boards too."),
        ("Graphics card length", "e.g. up to 400 mm", "Front fans or a radiator can take some of that space."),
        ("Expansion slots", "e.g. 7, or 3 in small cases", "How many slot covers the back has, which limits how thick a graphics card can be."),
        ("CPU cooler height", "e.g. up to 170 mm", "The tallest air cooler that fits under the side panel."),
        ("Radiator support", "e.g. 360 mm front and top", "Where a liquid cooler's radiator can go, and how long it can be."),
        ("Power supply", "ATX or SFX, max length", "Which power supply size it takes."),
        ("Drive bays", "e.g. 2 × 2.5 in, 2 × 3.5 in", "Places for SATA drives. Many modern cases have few or none, since M.2 drives sit on the board."),
    ],
    connects=[
        ("Motherboard", "Screws onto raised standoffs that match the board's holes. Front-panel cables plug into the board's labelled pins."),
        ("Case fans", "Screw or clip into its fan mounts at the front, top, rear or bottom."),
        ("Everything else", "The graphics card screws to the back slots; drives and the power supply have their own mounts."),
    ],
    check=[
        "It takes your motherboard size and power supply size.",
        "The graphics card fits on length and thickness.",
        "The cooler fits under the side panel, or the radiator has a place.",
        "There are bays for any SATA drives.",
    ],
    more=[("Does a bigger case run cooler?",
           "Not by size alone. A mesh front, room for fans and a clear path from front to back matter more. A small case with good airflow can run cooler than a big one with a solid front panel.")],
)

CONTENT["fans"] = dict(
    title="Case fans", desc="What case fans do, what their specs mean, and how to set them up for airflow.",
    lede="Case fans move air through the computer: cool air in, warm air out, past the parts that make the most heat.",
    what='''    <h2>What they do</h2>
    <p>Every part turns power into heat. The processor's and graphics card's own coolers move that heat into the air inside the case; the case fans then swap that warm air for cool air from the room. Without them, the inside slowly heats up and the parts slow themselves down to stay safe.</p>
    <p>The motherboard sets each fan's speed from the temperatures it reads, so fans stay quiet when the computer is idle and speed up under load.</p>''',
    specs=[
        ("Size", "e.g. 120 mm, 140 mm", "The width of the fan's square frame. A bigger fan moves the same air at a lower speed, so it's quieter. The case lists which sizes fit where."),
        ("Airflow", "e.g. 60 CFM", "How much air it moves, in cubic feet per minute, with nothing in its way. Higher moves more."),
        ("Static pressure", "e.g. 2.0 mm H2O", "How hard it can push air through something dense, like a radiator or a dust filter. Fans on a radiator need more of it."),
        ("Speed", "e.g. 400–1600 RPM", "How fast it spins, in revolutions per minute. The motherboard raises and lowers it with temperature."),
        ("Connector", "4-pin PWM or 3-pin", "A 4-pin (PWM) fan lets the board set its speed precisely; a 3-pin fan is slowed down by lowering its voltage. Both plug into the board's fan headers."),
        ("Noise", "e.g. 25 dBA", "How loud it is at full speed. About 10 dBA more sounds roughly twice as loud."),
    ],
    connects=[
        ("Fan headers", "Into the board's CHA_FAN or SYS_FAN headers, or into a fan hub when there aren't enough."),
        ("Case", "Screwed or clipped into fan mounts at the front, top, rear or bottom."),
        ("Radiator", "A liquid cooler's fans screw onto its radiator."),
    ],
    check=[
        "The case has mounts for the fan size you choose.",
        "The board has enough fan headers, or you add a hub or splitter.",
        "Each fan points the right way: arrows on the frame show the airflow.",
        "On a radiator, use fans rated for higher static pressure.",
    ],
    more=[("Which way should the fans blow?",
           "Usually in at the front (and bottom), out at the back and top, since warm air rises. Arrows on a fan's frame show the airflow direction. Slightly more air coming in than going out keeps dust from being pulled in through gaps.")],
)



# Trading card per part: name, type, a headline stat, the turning part, stats.
CARD = {
    # key: (type badge, headline label, headline value, shape class for the art)
    "cpu": ("CPU", "Power", "65–250 W", "shape-cpu"),
    "board": ("Motherboard", "Size", "ATX", "shape-board-atx"),
    "ram": ("RAM", "Typical", "16–64 GB", "shape-ram"),
    "storage": ("Drive", "Typical", "1–4 TB", "shape-drive-35"),
    "gpu": ("GPU", "Power", "75–600 W", "shape-gpu-3fan"),
    "cooler": ("Cooler", "Type", "Air / Liquid", "shape-cooler-tower"),
    "psu": ("PSU", "Power", "550–1000 W", "shape-psu-atx"),
    "case": ("Case", "Size", "Mid tower", "shape-case"),
    "fans": ("Fan", "Size", "120 mm", "shape-fan"),
}
DIMS = {  # w, d, h in mm, from pc/pc.css shapes
    "shape-cpu": (40, 40, 5), "shape-board-atx": (305, 244, 3), "shape-ram": (7, 133, 32),
    "shape-drive-35": (147, 102, 26), "shape-gpu-3fan": (305, 55, 125), "shape-cooler-tower": (75, 125, 155),
    "shape-psu-atx": (160, 86, 150), "shape-fan": (25, 120, 120), "shape-case": (470, 440, 210),
}



# One short example per stat for the card; the full range is in the (i) bubble.
CARDVAL = {
    "cpu": ["AM5", "8 cores", "5.4 GHz", "120 W", "32 MB", "DDR5", "Yes"],
    "board": ["AM5", "B-series", "ATX", "4 × DDR5", "3 × M.2", "PCIe x16", "USB, Wi-Fi"],
    "ram": ["DDR5", "32 GB", "2 sticks", "6000 MT/s", "35 mm"],
    "storage": ["NVMe", "2 TB", "Gen 4", "2280", "1,200 TBW"],
    "gpu": ["12 GB", "300 mm", "2 slots", "250 W", "650 W", "2 × 8-pin", "HDMI, DP"],
    "cooler": ["155 mm", "360 mm", "AM5", "250 W"],
    "psu": ["750 W", "Gold", "ATX", "Fully", "24-pin +"],
    "case": ["ATX", "400 mm", "7", "170 mm", "360 mm", "ATX", "2 + 2"],
    "fans": ["120 mm", "60 CFM", "2.0 mm H2O", "1600 RPM", "4-pin PWM", "25 dBA"],
}

def card_body(key, compact, sfx=""):
    """The card's inside. `sfx` keeps the (i) ids unique in the enlarged copy."""
    c = CONTENT[key]
    badge, hl, hv, shape = CARD[key]
    title = dict((k, t) for k, _, t in PAGES)[key]
    rows = []
    for i, (name, eg, text) in enumerate(c["specs"]):
        gist = GIST_PAGE.get((key, name), GIST[name])
        val = CARDVAL[key][i]
        full = eg[5:] if eg.startswith("e.g. ") else eg
        pid = f"i-{key}-{i}{sfx}"
        # The plain sentence and the full explanation live in the (i) bubble
        # (HTML popover: no script, light-dismiss and Esc built in).
        rows.append(f"""            <div><dt>{name} <button class="info" type="button" popovertarget="{pid}" aria-label="About {name.lower()}">i</button><span id="{pid}" popover class="bubble"><b>{gist}</b> {text} <span class="eg">Examples: {full}.</span></span></dt><dd class="val">{val}</dd></div>""")
    links = " · ".join(n for n, _ in c["connects"])
    h = 3 if compact else 2
    name = f'<a href="{FILE[key]}">{title}</a>' if compact else title
    return f"""        <header class="tcard-top">
            <h{h} class="tcard-name">{name}</h{h}>
            <span class="tcard-hp"><small>{hl}</small> {hv}</span>
        </header>
        <div class="tcard-art" aria-hidden="true"><div class="tcard-spin fit-{key}"><div class="part {shape}">{FACES}</div></div></div>
        <p class="tcard-type"><span>{badge}</span> {CONTENT_BLURB[key]}</p>
        <dl class="tcard-stats">
{chr(10).join(rows)}
        </dl>
        <p class="tcard-foot"><b>Connects to</b> {links}</p>"""


def card(key, compact=False):
    """A card that grows on hover and opens large on click: a button behind the
    card's content opens a popover holding an enlarged copy (no script; the
    page is shaded by the popover's backdrop; click outside or Esc closes it)."""
    _, _, _, shape = CARD[key]
    title = dict((k, t) for k, _, t in PAGES)[key]
    zid = f"zoom-{key}"
    return f"""
    <article class="tcard zoomable {shape}{' compact' if compact else ''}" aria-label="{title} card">
        <button class="tcard-open" type="button" popovertarget="{zid}" aria-label="Enlarge the {title.lower()} card"></button>
{card_body(key, compact)}
        <div id="{zid}" popover class="card-zoom">
            <article class="tcard {shape}" aria-label="{title} card, enlarged">
{card_body(key, compact, "-z")}
            </article>
            <button class="zoom-close" type="button" popovertarget="{zid}" popovertargetaction="hide" aria-label="Close">×</button>
        </div>
    </article>"""


def detail(key):
    c = CONTENT[key]
    cn = "\n".join(f'            <li><b>{n}</b>: {t}</li>' for n, t in c["connects"])
    return f'''
    <details class="more-detail">
        <summary>How it connects</summary>
        <ul>
{cn}
        </ul>
    </details>'''


# The card's own line is technical; beginner explanations live in the (i)
# bubbles, the page text and "How it connects".
CONTENT_BLURB = {
    "cpu": "Executes program instructions: the arithmetic, logic and control at the core of the system.",
    "board": "Main circuit board: routes power and data between every component; its chipset and firmware run the platform.",
    "ram": "Volatile working memory: holds running programs and their data for the CPU at high speed.",
    "storage": "Non-volatile storage for the operating system, programs and files.",
    "gpu": "Massively parallel processor: renders frames and accelerates video and compute work.",
    "cooler": "Moves heat from the CPU into the air through a heatsink and fan, or a liquid loop.",
    "psu": "Converts mains AC into regulated 12 V, 5 V and 3.3 V DC for every component.",
    "case": "Chassis: mounts the components, routes the cables and sets the airflow path.",
    "fans": "Exchange the air inside the case: cool air in, heated air out.",
}


def part_page(key):
    c = CONTENT[key]
    body = "\n".join([
        head(dict((k, t) for k, _, t in PAGES)[key], c["title"], c["lede"]),
        small_stage(key),
        "",
        c["what"],
        card(key),
        detail(key),
        checklist(c["check"]),
        "".join(more(q, a) for q, a in c["more"]),
        pager(key),
    ])
    return page(FILE[key], c["title"] + " · Build a PC", c["desc"], body)


def overview():
    cards = [card(k, compact=True) for k, _, _ in PAGES]
    body = f'''    <div class="learn-head">
        <h1>Build a PC</h1>
        <p class="lede">A desktop computer is nine kinds of parts that plug into each other. Pull it apart below, then pick a part to see what it does, what its numbers mean, and what it connects to.</p>
    </div>

    <input class="view-switch view-exploded" type="radio" name="view" id="view-exploded" checked>
    <input class="view-switch view-assembled" type="radio" name="view" id="view-assembled">
    <input class="view-switch turn-1" type="radio" name="turn" id="turn-1" checked>
    <input class="view-switch turn-2" type="radio" name="turn" id="turn-2">
    <input class="view-switch turn-3" type="radio" name="turn" id="turn-3">
    <input class="view-switch turn-4" type="radio" name="turn" id="turn-4">

    <div class="stage-wrap learn-stage" aria-hidden="true">
        <div class="scene">
            <div class="rig">
{stage_overview()}
            </div>
        </div>
    </div>
    <div class="stage-controls">
        <div class="seg" role="group" aria-label="View">
            <label for="view-exploded">Apart</label>
            <label for="view-assembled">Together</label>
        </div>
        <div class="seg" role="group" aria-label="Turn">
            <label for="turn-1">Front</label>
            <label for="turn-2">Left</label>
            <label for="turn-3">Back</label>
            <label for="turn-4">Right</label>
        </div>
    </div>

    <h2>The parts</h2>
    <div class="collection">
{"".join(cards)}
    </div>

    <p><a class="btn" href="pc-builder.html">Open the PC builder</a> &nbsp; <a class="btn secondary" href="learn-pc-connections.html">How it all connects</a> &nbsp; <a class="btn secondary" href="learn-pc-safety.html">Build safely</a></p>'''
    return page("learn-pc.html", "Build a PC: what each part does",
                "Learn what each part of a desktop computer does, what its specs mean, and how the parts connect. Free, no ads, no tracking.", body)


def connections():
    body = '''    <div class="learn-head">
        <p class="crumbs"><a href="learn-pc.html">Build a PC</a> › How it all connects</p>
        <h1>How it all connects</h1>
        <p class="lede">Three things flow through a computer: power, data and air. Here is where each one goes.</p>
    </div>

    <h2>Power</h2>
    <p>Everything starts at the power supply. It sends 12 volts out on separate cables, and the motherboard passes power on to the smaller parts.</p>
    <ol class="flow" aria-label="Power path"><li>Wall</li><li>Power supply</li><li>Motherboard (24-pin)</li><li>Memory, M.2 drives, fans, USB</li></ol>
    <ol class="flow" aria-label="Power path"><li>Power supply</li><li>Processor (8-pin CPU cable)</li></ol>
    <ol class="flow" aria-label="Power path"><li>Power supply</li><li>Graphics card (8-pin or 12V-2x6)</li></ol>
    <ol class="flow" aria-label="Power path"><li>Power supply</li><li>SATA drives (SATA power)</li></ol>
    <p>The processor and graphics card draw most of the power, which is why each gets its own cables straight from the power supply.</p>

    <h2>Data</h2>
    <p>Most data travels on <strong>PCIe lanes</strong>: fast, direct links between two parts. Each part gets a set number of lanes, written as x16, x4 or x1.</p>
    <ol class="flow" aria-label="Data path"><li>Processor</li><li>Memory (directly)</li></ol>
    <ol class="flow" aria-label="Data path"><li>Processor</li><li>Graphics card (x16)</li></ol>
    <ol class="flow" aria-label="Data path"><li>Processor</li><li>First M.2 drive (x4)</li></ol>
    <ol class="flow" aria-label="Data path"><li>Processor</li><li>Chipset</li><li>More M.2 slots, SATA, USB, network, sound</li></ol>
    <p>Everything behind the chipset shares one link back to the processor. That's why the graphics card and the main drive connect to the processor directly, and why some slots share lanes: on many boards, using one M.2 slot turns off a PCIe slot. The board's manual lists which.</p>

    <h2>Air</h2>
    <p>Cool air comes in at the front (and often the bottom), passes over the graphics card and the processor's cooler, and leaves at the back and top, where warm air naturally rises.</p>
    <ol class="flow" aria-label="Air path"><li>Front intake fans</li><li>Graphics card and CPU cooler</li><li>Rear and top exhaust</li></ol>
    <p>A liquid cooler's radiator is part of this path: mounted at the top, it exhausts the processor's heat straight out; at the front, it takes in cool outside air but warms the air for everything behind it.</p>

    <h2>Starting up</h2>
    <ol class="flow" aria-label="Start-up"><li>Power button</li><li>Board wakes the power supply</li><li>Firmware checks the parts</li><li>Finds the boot drive</li><li>Operating system starts</li></ol>
    <p>If a part fails the firmware's check, many boards light a small LED marked CPU, DRAM, VGA or BOOT to show which part to look at.</p>

    <nav class="pager" aria-label="Parts">
        <a href="learn-pc-fans.html">← Case fans</a>
        <a href="learn-pc.html">All parts →</a>
    </nav>'''
    return page("learn-pc-connections.html", "How a computer's parts connect · Build a PC",
                "How power, data and air move through a desktop computer, and why some slots share lanes.", body)


def safety():
    body = '''    <div class="learn-head">
        <p class="crumbs"><a href="learn-pc.html">Build a PC</a> › Safety</p>
        <h1>Build safely</h1>
        <p class="lede">Building a computer is safe when you take a little care. This is a general guide, not instructions for your particular parts.</p>
    </div>

    <ul>
        <li><strong>Unplug first.</strong> Shut the computer down, switch the power supply off and unplug its cord before you touch anything inside the case.</li>
        <li><strong>Mind static.</strong> Static electricity can damage parts without any visible sign. Touch bare metal on the case before handling parts, hold them by the edges, keep them in their bags until you fit them, and don't build on carpet. A wrist strap helps.</li>
        <li><strong>Never open a power supply</strong>, even when it's unplugged. It can hold a dangerous charge.</li>
        <li><strong>Use the right cables.</strong> Only use the modular cables that came with your power supply, and push every power plug in until it clicks.</li>
        <li><strong>Your manuals come first.</strong> Wherever they differ from this site, follow the manual for your part.</li>
        <li><strong>Take your time with the socket.</strong> Most sockets have tiny pins that bend easily (on AM4 the pins are on the processor instead). Keep the socket's cover on until the processor goes in, and never force anything.</li>
    </ul>

    <h2>About the information here</h2>
    <p>These pages explain how computer parts work in general. Specifications and compatibility checks are a guide, not a guarantee: they can't cover every part, firmware version or case, and makers change their products. Check each maker's specifications and manuals before you buy or build. This site is provided as is, without warranty.</p>

    <nav class="pager" aria-label="Parts">
        <a href="learn-pc.html">← All parts</a>
        <a href="learn-pc-cpu.html">Start: Processor →</a>
    </nav>'''
    return page("learn-pc-safety.html", "Build a PC safely",
                "Safety basics for building a desktop computer: power, static electricity, power supplies, cables and manuals.", body)


def text_blocks(fragment):
    """Turn a page's "what" HTML into plain blocks for the app (it never parses markup)."""
    import re as _re
    out = []
    for tag, body in _re.findall(r'<(p|li|div)[^>]*>(.*?)</\1>', fragment, flags=_re.S):
        txt = html.unescape(_re.sub(r'<[^>]+>', '', body)).strip()
        if txt and not txt.startswith('What it does'):
            out.append({"kind": "li" if tag == "li" else "p", "text": " ".join(txt.split())})
    return out


def plain(t):
    import re as _re
    return html.unescape(_re.sub(r'<[^>]+>', '', t))


def write_app_content():
    """pc/builder/content.js: the same words as the Learn pages, as data for the builder."""
    import json
    data = {}
    for k, f, short in PAGES:
        c = CONTENT[k]
        badge, hl, hv, shape = CARD[k]
        data[k] = {
            "name": short, "badge": badge, "page": f, "blurb": CONTENT_BLURB[k],
            "lede": plain(c["lede"]), "what": text_blocks(c["what"]),
            "specs": {n: {"gist": GIST_PAGE.get((k, n), GIST[n]), "text": plain(t), "examples": eg[5:] if eg.startswith("e.g. ") else eg}
                      for n, eg, t in c["specs"]},
            "connects": [[n, plain(t)] for n, t in c["connects"]],
            "check": [plain(t) for t in c["check"]],
            "more": [[plain(q), plain(a)] for q, a in c["more"]],
        }
    body = ("// Generated by _tools/learn_pages.py from the Learn pages' content. Do not edit by hand.\n"
            "export const CONTENT = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    os.makedirs(os.path.join(REPO, "pc", "builder"), exist_ok=True)
    with open(os.path.join(REPO, "pc", "builder", "content.js"), "w", encoding="utf-8") as fh:
        fh.write(body)


def write(name, text):
    with open(os.path.join(REPO, name), "w", encoding="utf-8") as f:
        f.write(text)


write("learn-pc.html", overview())
for k, f, _ in PAGES:
    write(f, part_page(k))
write("learn-pc-connections.html", connections())
write("learn-pc-safety.html", safety())
write_app_content()
print("wrote", 2 + len(PAGES) + 1, "pages and pc/builder/content.js")
