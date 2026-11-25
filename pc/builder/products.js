// Real products. Every number was read from the maker's own spec page by the
// owner in a browser and pasted in; the facts are recorded in our own words
// with the source URL and the date checked. Makers change specs: the card shows
// the date. Names follow each owner's trademark rules (mark as an adjective with
// a generic noun; ® / ™ as the owners list them). See CLAUDE.md, "Learn: build a PC".

const CHECKED = "2026-11-24";
const p = (id, cat, name, specs, url, note = "") =>
    Object.freeze({ id, cat, kind: "product", name, cardName: CARD_NAMES[id] ?? name, specs: Object.freeze(specs), source: Object.freeze({ url, checked: CHECKED }), note });

// Shorter names for the card face (two lines at most); marks kept as the owners list them.
const CARD_NAMES = {
    "nvidia-geforce-rtx-5070-fe": "NVIDIA® GeForce RTX™ 5070 Founders Edition",
    "asus-tuf-rx9070xt-o16g-gaming": "ASUS TUF Gaming Radeon™ RX 9070 XT OC",
    "corsair-vengeance-rgb-ddr5-32gb-6000-cl30": "CORSAIR VENGEANCE RGB 32GB DDR5-6000",
    "asus-tuf-gaming-b850-plus-wifi": "ASUS TUF GAMING B850-PLUS WIFI",
    "asus-prime-b850m-a-wifi": "ASUS PRIME B850M-A WIFI",
    "asus-rog-strix-b850-i-gaming-wifi": "ASUS ROG STRIX B850-I GAMING WIFI",
    "asus-prime-z890-p-wifi": "ASUS PRIME Z890-P WIFI",
    "corsair-mp600-pro-2tb": "CORSAIR MP600 PRO 2TB",
    "corsair-a115": "CORSAIR A115",
    "corsair-nautilus-360-rs": "CORSAIR NAUTILUS 360 RS",
    "corsair-rm750e": "CORSAIR RM750e",
    "corsair-rm850x": "CORSAIR RM850x",
    "corsair-sf750": "CORSAIR SF750",
    "corsair-frame-4000d-rs-argb": "CORSAIR FRAME 4000D RS ARGB",
    "corsair-2000d-airflow": "CORSAIR 2000D AIRFLOW",
};

const ALL_AM = ["AM4", "AM5"];

export const PRODUCTS = [
    p("amd-ryzen-5-9600x", "cpu", "AMD Ryzen™ 5 9600X processor",
      { socket: "AM5", memory: ["DDR5"], cores: 6, powerW: 65, maxPowerW: null, igpu: true },
      "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html",
      "No cooler in the box."),
    p("amd-ryzen-7-9800x3d", "cpu", "AMD Ryzen™ 7 9800X3D processor",
      { socket: "AM5", memory: ["DDR5"], cores: 8, powerW: 120, maxPowerW: null, igpu: true },
      "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html",
      "No cooler in the box; AMD recommends a liquid cooler."),
    p("intel-core-ultra-7-265k", "cpu", "Intel® Core™ Ultra 7 processor 265K",
      { socket: "LGA 1851", memory: ["DDR5"], cores: 20, powerW: 125, maxPowerW: 250, igpu: true },
      "https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html",
      "125 W base power, up to 250 W at maximum turbo."),

    p("asus-tuf-gaming-b850-plus-wifi", "board", "ASUS TUF GAMING B850-PLUS WIFI motherboard",
      { socket: "AM5", size: "ATX", memory: "DDR5", ramSlots: 4, m2Slots: 3, sataPorts: 4, maxCpuW: null },
      "https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850-plus-wifi/techspec/",
      "Using the third M.2 slot turns off the board's PCIe 4.0 x16 slot that runs from the chipset."),
    p("asus-prime-b850m-a-wifi", "board", "ASUS PRIME B850M-A WIFI motherboard",
      { socket: "AM5", size: "Micro-ATX", memory: "DDR5", ramSlots: 4, m2Slots: 3, sataPorts: 4, maxCpuW: 170 },
      "https://www.asus.com/motherboards-components/motherboards/prime/prime-b850m-a-wifi/techspec/"),
    p("asus-rog-strix-b850-i-gaming-wifi", "board", "ASUS ROG STRIX B850-I GAMING WIFI motherboard",
      { socket: "AM5", size: "Mini-ITX", memory: "DDR5", ramSlots: 2, m2Slots: 2, sataPorts: 2, maxCpuW: null },
      "https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-i-gaming-wifi/spec/"),
    p("asus-prime-z890-p-wifi", "board", "ASUS PRIME Z890-P WIFI motherboard",
      { socket: "LGA 1851", size: "ATX", memory: "DDR5", ramSlots: 4, m2Slots: 4, sataPorts: 4, maxCpuW: null },
      "https://www.asus.com/motherboards-components/motherboards/prime/prime-z890-p-wifi/techspec/"),

    p("corsair-vengeance-rgb-ddr5-32gb-6000-cl30", "ram", "CORSAIR VENGEANCE RGB 32GB (2×16GB) DDR5 6000 CL30 memory kit",
      { memory: "DDR5", sticks: 2, gbPerStick: 16 },
      "https://www.corsair.com/us/en/p/memory/cmh32gx5m2b6000z30k/vengeance-rgb-32gb-2x16gb-ddr5-dram-6000mt-s-cl30-amd-expo-intel-xmp-memory-kit-cmh32gx5m2b6000z30k",
      "Runs at its rated speed only with its memory profile turned on in the BIOS."),

    p("corsair-mp600-pro-2tb", "storage", "CORSAIR MP600 PRO 2TB M.2 NVMe SSD",
      { type: "M.2 NVMe", capacityGb: 2000 },
      "https://www.corsair.com/us/en/p/data-storage/cssd-f2000gbmp600pro/mp600-pro-2tb-m-2-nvme-pcie-gen-4-x4-ssd-cssd-f2000gbmp600pro"),

    p("nvidia-geforce-rtx-5070-fe", "gpu", "NVIDIA® GeForce RTX™ 5070 Founders Edition GPU",
      { lengthMm: 242, slots: 2, powerW: 250, psuW: 650 },
      "https://www.nvidia.com/en-us/geforce/graphics-cards/compare/",
      "Sizes are for NVIDIA's own card; other makers' versions vary."),
    p("asus-tuf-rx9070xt-o16g-gaming", "gpu", "ASUS TUF Gaming Radeon™ RX 9070 XT OC Edition graphics card",
      { lengthMm: 330, slots: 3.125, powerW: 304, psuW: 850 },
      "https://www.asus.com/motherboards-components/graphics-cards/tuf-gaming/tuf-rx9070xt-o16g-gaming/techspec/",
      "Power is AMD's reference figure for the chip; this factory-overclocked card may draw more."),

    p("corsair-a115", "cooler", "CORSAIR A115 CPU air cooler",
      { type: "Air", heightMm: 165, sockets: ["AM4", "AM5", "LGA 1700"], ratedW: 270 },
      "https://www.corsair.com/us/en/p/cpu-coolers/ct-9010011-ww/a115-twin-tower-cpu-air-cooler-ct-9010011-ww",
      "Fans slide up for tall memory, which adds height. The maker lists 164.8 mm; the checks round it up to 165."),
    p("corsair-nautilus-360-rs", "cooler", "CORSAIR NAUTILUS 360 RS liquid CPU cooler",
      { type: "Liquid (AIO)", radiatorMm: "360", sockets: ["LGA 1851", "LGA 1700", ...ALL_AM], ratedW: null },
      "https://www.corsair.com/us/en/p/cpu-coolers/cw-9061060-ww/nautilus-360-rs-aio-liquid-cpu-cooler-cw-9061060-ww"),

    p("corsair-rm750e", "psu", "CORSAIR RM750e power supply",
      { watts: 750, size: "ATX" },
      "https://www.corsair.com/us/en/p/psu/cp-9020295-na/rme-series-rm750e-fully-modular-low-noise-atx-power-supply-cp-9020295-na"),
    p("corsair-rm850x", "psu", "CORSAIR RM850x power supply",
      { watts: 850, size: "ATX" },
      "https://www.corsair.com/us/en/p/psu/cp-9020270-na/rmx-series-rm850x-fully-modular-power-supply-cp-9020270-na"),
    p("corsair-sf750", "psu", "CORSAIR SF750 power supply",
      { watts: 750, size: "SFX" },
      "https://www.corsair.com/us/en/p/psu/cp-9020284-na/sf-series-sf750-fully-modular-80-plus-platinum-sfx-power-supply-cp-9020284-na",
      "Two 8-pin graphics plugs plus one 12VHPWR."),

    p("corsair-frame-4000d-rs-argb", "case", "CORSAIR FRAME 4000D RS ARGB case",
      { boards: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuMm: 430, expansionSlots: 7, maxCoolerMm: 170, radiators: ["120", "140", "240", "280", "360"], psuSizes: ["ATX"], bays25: null, bays35: null },
      "https://www.corsair.com/us/en/p/pc-cases/cc-9011296-ww/frame-4000d-rs-argb-modular-mid-tower-pc-case-cc-9011296-ww",
      "Comes with three fans."),
    p("corsair-2000d-airflow", "case", "CORSAIR 2000D AIRFLOW case",
      { boards: ["Mini-ITX"], maxGpuMm: 365, expansionSlots: 3, maxCoolerMm: 165, radiators: ["120", "140", "240", "280", "360"], psuSizes: ["SFX"], bays25: 3, bays35: 0 },
      "https://www.corsair.com/us/en/p/pc-cases/cc-9011244-ww/2000d-airflow-mini-itx-pc-case-black-cc-9011244-ww"),
];

