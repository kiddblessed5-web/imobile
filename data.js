/* =========================================================
   iMobile — catalogue data + device artwork
   Replace names, prices and specs with your real stock.
   To use a real photo for any product, add  image: "assets/products/file.jpg"
   ========================================================= */

const CATALOGUE = [
  /* ---------------- PHONES ---------------- */
  {
    id: "aero-15-pro",
    name: "Aero 15 Pro",
    brand: "Aero",
    category: "phones",
    type: "phone",
    price: 164999,
    was: 179999,
    tag: "New",
    colors: [
      { name: "Titanium", hex: "#bdb9b1" },
      { name: "Graphite", hex: "#2c2c2f" },
      { name: "Glacier", hex: "#cfd6dc" },
    ],
    storage: ["256GB", "512GB", "1TB"],
    blurb: "A titanium flagship with a pro triple camera, all-day battery and a 6.7\" 120Hz display.",
    specs: {
      Display: '6.7" OLED, 120Hz',
      Camera: "48MP main · 12MP ultra-wide · 12MP 5× tele",
      Battery: "4,600 mAh · 45W wired",
      Chip: "Octa-core 3nm",
      Network: "5G · Dual SIM · eSIM",
    },
  },
  {
    id: "pixelline-9",
    name: "Pixelline 9",
    brand: "Pixelline",
    category: "phones",
    type: "phone",
    price: 104999,
    tag: "Bestseller",
    colors: [
      { name: "Obsidian", hex: "#1f1f22" },
      { name: "Porcelain", hex: "#e9e5de" },
      { name: "Sage", hex: "#a9b4a3" },
    ],
    storage: ["128GB", "256GB"],
    blurb: "Clean software, a brilliant camera and seven years of updates in a compact body.",
    specs: {
      Display: '6.3" OLED, 120Hz',
      Camera: "50MP main · 48MP ultra-wide",
      Battery: "4,700 mAh · 27W wired",
      Chip: "Octa-core 4nm",
      Network: "5G · Dual SIM",
    },
  },
  {
    id: "nova-s24",
    name: "Nova S24",
    brand: "Nova",
    category: "phones",
    type: "phone",
    price: 89999,
    was: 99999,
    colors: [
      { name: "Onyx", hex: "#232326" },
      { name: "Marble", hex: "#d8d6d2" },
      { name: "Cobalt", hex: "#3d4a63" },
    ],
    storage: ["128GB", "256GB"],
    blurb: "Flagship power for less: a bright AMOLED panel, fast charging and a tough glass back.",
    specs: {
      Display: '6.2" AMOLED, 120Hz',
      Camera: "50MP main · 12MP ultra-wide · 10MP tele",
      Battery: "4,000 mAh · 25W wired",
      Chip: "Octa-core 4nm",
      Network: "5G · Dual SIM",
    },
  },
  {
    id: "nova-a55",
    name: "Nova A55",
    brand: "Nova",
    category: "phones",
    type: "phone",
    price: 42999,
    tag: "Value",
    colors: [
      { name: "Ice", hex: "#d6dbe0" },
      { name: "Navy", hex: "#2a3245" },
    ],
    storage: ["128GB", "256GB"],
    blurb: "Everything you need for everyday: big battery, sharp screen, solid cameras.",
    specs: {
      Display: '6.6" AMOLED, 120Hz',
      Camera: "50MP main · 12MP ultra-wide",
      Battery: "5,000 mAh · 25W wired",
      Chip: "Octa-core 5nm",
      Network: "5G · Dual SIM",
    },
  },
  {
    id: "volt-12",
    name: "Volt 12",
    brand: "Volt",
    category: "phones",
    type: "phone",
    price: 69999,
    colors: [
      { name: "Carbon", hex: "#1c1c1e" },
      { name: "Flare", hex: "#c9c3b8" },
    ],
    storage: ["256GB", "512GB"],
    blurb: "Built for speed: 100W charging takes you from 0 to full in under 30 minutes.",
    specs: {
      Display: '6.8" AMOLED, 120Hz',
      Camera: "50MP main · 8MP ultra-wide",
      Battery: "5,400 mAh · 100W wired",
      Chip: "Octa-core 4nm",
      Network: "5G · Dual SIM",
    },
  },
  {
    id: "aero-fold",
    name: "Aero Fold",
    brand: "Aero",
    category: "phones",
    type: "phone",
    price: 219999,
    tag: "Premium",
    colors: [
      { name: "Shadow", hex: "#262629" },
      { name: "Silver", hex: "#cfd0d2" },
    ],
    storage: ["512GB", "1TB"],
    blurb: "A phone that opens into a tablet. Multitask on a 7.6\" inner screen.",
    specs: {
      Display: '7.6" inner · 6.3" cover, 120Hz',
      Camera: "50MP main · 12MP ultra-wide · 10MP tele",
      Battery: "4,400 mAh · 25W wired",
      Chip: "Octa-core 4nm",
      Network: "5G · Dual SIM · eSIM",
    },
  },
  {
    id: "aero-tab-11",
    name: "Aero Tab 11",
    brand: "Aero",
    category: "phones",
    type: "tablet",
    price: 74999,
    colors: [
      { name: "Space", hex: "#3a3a3d" },
      { name: "Silver", hex: "#d4d5d7" },
    ],
    storage: ["128GB", "256GB"],
    blurb: "An 11\" tablet for work, study and streaming, with stylus support.",
    specs: {
      Display: '11" LCD, 120Hz',
      Camera: "12MP rear · 12MP front",
      Battery: "8,000 mAh · 30W wired",
      Chip: "Octa-core 5nm",
      Network: "Wi-Fi 6 · optional 5G",
    },
  },
  {
    id: "pixelline-8a",
    name: "Pixelline 8a",
    brand: "Pixelline",
    category: "phones",
    type: "phone",
    price: 54999,
    was: 61999,
    colors: [
      { name: "Bay", hex: "#9fb3c4" },
      { name: "Charcoal", hex: "#2a2a2c" },
    ],
    storage: ["128GB"],
    blurb: "The smart camera phone at a friendly price.",
    specs: {
      Display: '6.1" OLED, 120Hz',
      Camera: "64MP main · 13MP ultra-wide",
      Battery: "4,500 mAh · 18W wired",
      Chip: "Octa-core 4nm",
      Network: "5G · Dual SIM",
    },
  },

  /* ---------------- ACCESSORIES ---------------- */
  {
    id: "pulse-watch-2",
    name: "Pulse Watch 2",
    brand: "Pulse",
    category: "accessories",
    sub: "Smartwatches",
    type: "watch",
    price: 34999,
    was: 39999,
    tag: "New",
    colors: [
      { name: "Chalk", hex: "#e3e1dc" },
      { name: "Midnight", hex: "#202024" },
      { name: "Moss", hex: "#8f9a86" },
    ],
    blurb: "Heart-rate, sleep and workout tracking with a bright always-on display.",
    specs: {
      Display: '1.4" AMOLED, always-on',
      Battery: "Up to 2 days",
      Sensors: "Heart rate · SpO₂ · GPS",
      Water: "5 ATM",
    },
  },
  {
    id: "pulse-watch-lite",
    name: "Pulse Watch Lite",
    brand: "Pulse",
    category: "accessories",
    sub: "Smartwatches",
    type: "watch",
    price: 14999,
    colors: [
      { name: "Graphite", hex: "#2d2d30" },
      { name: "Rose", hex: "#d9c3bb" },
    ],
    blurb: "Notifications, steps and sleep on your wrist for a full week per charge.",
    specs: {
      Display: '1.3" LCD',
      Battery: "Up to 7 days",
      Sensors: "Heart rate · SpO₂",
      Water: "5 ATM",
    },
  },
  {
    id: "echo-buds-pro",
    name: "Echo Buds Pro",
    brand: "Echo",
    category: "accessories",
    sub: "Earbuds",
    type: "earbuds",
    price: 19999,
    tag: "Bestseller",
    colors: [
      { name: "White", hex: "#f1f0ed" },
      { name: "Black", hex: "#232325" },
    ],
    blurb: "Active noise cancelling, spatial audio and 30 hours with the case.",
    specs: {
      "Noise cancelling": "Active (ANC)",
      Battery: "6h buds · 30h with case",
      Charging: "USB-C · wireless",
      Water: "IPX4",
    },
  },
  {
    id: "echo-buds-go",
    name: "Echo Buds Go",
    brand: "Echo",
    category: "accessories",
    sub: "Earbuds",
    type: "earbuds",
    price: 6999,
    was: 8499,
    colors: [
      { name: "Fog", hex: "#cfd2d4" },
      { name: "Ink", hex: "#26262a" },
    ],
    blurb: "Everyday wireless earbuds with punchy sound and quick pairing.",
    specs: {
      Battery: "5h buds · 24h with case",
      Charging: "USB-C",
      Water: "IPX4",
    },
  },
  {
    id: "gan-65w",
    name: "GaN 65W Charger",
    brand: "Volt",
    category: "accessories",
    sub: "Chargers & Cables",
    type: "charger",
    price: 4499,
    colors: [
      { name: "White", hex: "#f2f2f0" },
      { name: "Black", hex: "#222224" },
    ],
    blurb: "One compact brick fast-charges your phone, tablet and laptop.",
    specs: {
      Output: "65W max · 2× USB-C · 1× USB-A",
      Plug: "UK 3-pin (Type G)",
      Tech: "GaN, foldable pins",
    },
  },
  {
    id: "braided-cable",
    name: "Braided USB-C Cable 2m",
    brand: "Volt",
    category: "accessories",
    sub: "Chargers & Cables",
    type: "cable",
    price: 1499,
    colors: [
      { name: "Graphite", hex: "#2e2e31" },
      { name: "Stone", hex: "#cbc8c1" },
    ],
    blurb: "Tough braided cable rated for 100W charging and fast data.",
    specs: {
      Length: "2 m",
      Power: "Up to 100W",
      Build: "Nylon braided",
    },
  },
  {
    id: "volt-power-20k",
    name: "Volt Power 20K",
    brand: "Volt",
    category: "accessories",
    sub: "Power Banks",
    type: "powerbank",
    price: 5999,
    was: 6999,
    tag: "Hot",
    colors: [
      { name: "Black", hex: "#232325" },
      { name: "Sand", hex: "#d2c8b8" },
    ],
    blurb: "20,000 mAh to keep two phones going through a long day out.",
    specs: {
      Capacity: "20,000 mAh",
      Output: "22.5W · USB-C + USB-A",
      Display: "Digital battery level",
    },
  },
  {
    id: "clear-case",
    name: "Clear Armour Case",
    brand: "Shield",
    category: "accessories",
    sub: "Cases",
    type: "case",
    price: 2499,
    colors: [
      { name: "Clear", hex: "#dfe3e6" },
      { name: "Smoke", hex: "#4a4a4f" },
    ],
    blurb: "Slim drop protection that shows off your phone's colour.",
    specs: {
      Protection: "2 m drop tested",
      Fit: "Made for Aero, Nova & Pixelline models",
      Extras: "Magnetic ring built in",
    },
  },
  {
    id: "leather-case",
    name: "Leather Folio Case",
    brand: "Shield",
    category: "accessories",
    sub: "Cases",
    type: "case",
    price: 3999,
    colors: [
      { name: "Tan", hex: "#a9836a" },
      { name: "Black", hex: "#1f1f21" },
    ],
    blurb: "Genuine leather with card slots and a stand.",
    specs: {
      Material: "Genuine leather",
      Extras: "2 card slots · stand",
      Fit: "Made for Aero & Nova models",
    },
  },
];

/* ---------- helpers ---------- */
const money = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");
const findProduct = (id) => CATALOGUE.find((p) => p.id === id);
const discount = (p) => (p.was ? Math.round((1 - p.price / p.was) * 100) : 0);

/* ---------- device artwork (SVG) ---------- */
let artSeq = 0;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 140;
}

function deviceArt(type, color = "#2c2c2f") {
  const id = "a" + ++artSeq;
  const hi = shade(color, 40), lo = shade(color, -45);
  const edge = isLight(color) ? shade(color, -70) : shade(color, 70);
  const glass = "#0d0d0f";

  const defs = `
    <defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${lo}"/>
      </linearGradient>
      <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="${id}l" cx=".35" cy=".35" r=".7">
        <stop offset="0" stop-color="#5b6170"/><stop offset=".5" stop-color="#15161a"/><stop offset="1" stop-color="#000"/>
      </radialGradient>
      <radialGradient id="${id}sh" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>`;

  const lens = (x, y, r) =>
    `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="${edge}" opacity=".55"/>
     <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}l)"/>
     <circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.22}" fill="#fff" opacity=".5"/>`;

  const shadow = (cx, cy, rx, ry) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}sh)"/>`;

  const shapes = {
    phone: `
      ${shadow(200, 352, 120, 16)}
      <g transform="rotate(-9 200 200)">
        <rect x="128" y="58" width="150" height="290" rx="30" fill="url(#${id}b)"/>
        <rect x="128" y="58" width="150" height="290" rx="30" fill="url(#${id}s)"/>
        <rect x="131" y="61" width="144" height="284" rx="27" fill="none" stroke="${edge}" stroke-opacity=".35"/>
        <rect x="142" y="74" width="74" height="78" rx="20" fill="${lo}" opacity=".55"/>
        ${lens(162, 95, 11)}${lens(162, 131, 11)}${lens(195, 113, 11)}
        <circle cx="198" cy="140" r="3.5" fill="#f4e7c7" opacity=".8"/>
        <rect x="278" y="120" width="4" height="40" rx="2" fill="${lo}"/>
        <text x="203" y="285" text-anchor="middle" font-family="Inter Tight, sans-serif" font-weight="800" font-size="14" fill="${edge}" opacity=".45">iM</text>
      </g>`,
    tablet: `
      ${shadow(200, 356, 150, 16)}
      <g transform="rotate(-6 200 200)">
        <rect x="80" y="70" width="240" height="280" rx="22" fill="url(#${id}b)"/>
        <rect x="80" y="70" width="240" height="280" rx="22" fill="url(#${id}s)"/>
        <rect x="96" y="86" width="44" height="44" rx="14" fill="${lo}" opacity=".55"/>
        ${lens(118, 108, 11)}
        <rect x="190" y="66" width="40" height="4" rx="2" fill="${lo}"/>
      </g>`,
    watch: `
      ${shadow(200, 360, 90, 12)}
      <path d="M160 40h80l-6 85h-68z" fill="url(#${id}b)"/>
      <path d="M166 275h68l6 85h-80z" fill="url(#${id}b)"/>
      <path d="M160 40h80l-6 85h-68z" fill="url(#${id}s)"/>
      <circle cx="200" cy="200" r="92" fill="#c9cacc"/>
      <circle cx="200" cy="200" r="86" fill="#8d8f93"/>
      <circle cx="200" cy="200" r="80" fill="${glass}"/>
      <path d="M200 200 L248 158" stroke="#e9e6d8" stroke-width="5" stroke-linecap="round"/>
      <path d="M200 200 L172 168" stroke="#e9e6d8" stroke-width="9" stroke-linecap="round"/>
      <circle cx="200" cy="200" r="6" fill="#e9e6d8"/>
      <circle cx="200" cy="200" r="80" fill="url(#${id}s)" opacity=".5"/>
      <rect x="290" y="186" width="14" height="28" rx="5" fill="#a9abaf"/>`,
    earbuds: `
      ${shadow(200, 340, 130, 14)}
      <rect x="110" y="170" width="150" height="160" rx="60" fill="url(#${id}b)"/>
      <rect x="110" y="170" width="150" height="160" rx="60" fill="url(#${id}s)"/>
      <path d="M112 228 H258" stroke="${edge}" stroke-opacity=".35" stroke-width="2"/>
      <circle cx="185" cy="262" r="4" fill="${edge}" opacity=".5"/>
      <g transform="rotate(14 270 130)">
        <circle cx="270" cy="110" r="30" fill="url(#${id}b)"/>
        <rect x="258" y="120" width="24" height="90" rx="12" fill="url(#${id}b)"/>
        <circle cx="262" cy="104" r="12" fill="${glass}" opacity=".85"/>
      </g>
      <g transform="rotate(-18 120 110)">
        <circle cx="130" cy="96" r="26" fill="url(#${id}b)"/>
        <rect x="120" y="104" width="20" height="74" rx="10" fill="url(#${id}b)"/>
        <circle cx="138" cy="90" r="10" fill="${glass}" opacity=".85"/>
      </g>`,
    charger: `
      ${shadow(200, 330, 110, 14)}
      <rect x="168" y="62" width="14" height="44" rx="3" fill="#a9abaf"/>
      <rect x="218" y="62" width="14" height="44" rx="3" fill="#a9abaf"/>
      <rect x="193" y="40" width="14" height="50" rx="3" fill="#a9abaf"/>
      <rect x="120" y="100" width="160" height="220" rx="26" fill="url(#${id}b)"/>
      <rect x="120" y="100" width="160" height="220" rx="26" fill="url(#${id}s)"/>
      <rect x="160" y="250" width="30" height="12" rx="6" fill="${glass}"/>
      <rect x="210" y="250" width="30" height="12" rx="6" fill="${glass}"/>
      <rect x="181" y="276" width="38" height="16" rx="3" fill="${glass}"/>
      <text x="200" y="190" text-anchor="middle" font-family="Inter Tight, sans-serif" font-weight="800" font-size="22" fill="${edge}" opacity=".5">65W</text>`,
    cable: `
      ${shadow(200, 340, 130, 14)}
      <g fill="none" stroke="url(#${id}b)" stroke-width="16" stroke-linecap="round">
        <ellipse cx="200" cy="215" rx="110" ry="70"/>
        <ellipse cx="200" cy="205" rx="92" ry="56"/>
        <ellipse cx="200" cy="195" rx="74" ry="42"/>
      </g>
      <path d="M126 160 L96 80" stroke="url(#${id}b)" stroke-width="16" stroke-linecap="round"/>
      <rect x="78" y="40" width="34" height="56" rx="9" fill="#b9bbbe" transform="rotate(-20 95 68)"/>
      <path d="M274 160 L308 90" stroke="url(#${id}b)" stroke-width="16" stroke-linecap="round"/>
      <rect x="292" y="50" width="34" height="56" rx="9" fill="#b9bbbe" transform="rotate(22 309 78)"/>`,
    powerbank: `
      ${shadow(200, 352, 110, 14)}
      <g transform="rotate(-8 200 200)">
        <rect x="132" y="60" width="140" height="284" rx="26" fill="url(#${id}b)"/>
        <rect x="132" y="60" width="140" height="284" rx="26" fill="url(#${id}s)"/>
        <rect x="160" y="96" width="84" height="46" rx="8" fill="${glass}"/>
        <text x="202" y="127" text-anchor="middle" font-family="Inter Tight, sans-serif" font-weight="800" font-size="20" fill="#e9e6d8">98%</text>
        <rect x="166" y="62" width="30" height="8" rx="4" fill="${glass}"/>
        <rect x="208" y="62" width="30" height="8" rx="4" fill="${glass}"/>
        <text x="202" y="300" text-anchor="middle" font-family="Inter Tight, sans-serif" font-weight="800" font-size="16" fill="${edge}" opacity=".45">20000</text>
      </g>`,
    case: `
      ${shadow(200, 352, 120, 16)}
      <g transform="rotate(8 200 200)">
        <rect x="126" y="54" width="154" height="296" rx="34" fill="${color}" opacity=".9"/>
        <rect x="126" y="54" width="154" height="296" rx="34" fill="url(#${id}s)"/>
        <rect x="140" y="70" width="80" height="84" rx="22" fill="#f4f4f2" opacity=".75"/>
        <circle cx="203" cy="240" r="46" fill="none" stroke="${edge}" stroke-opacity=".4" stroke-width="4"/>
        <rect x="126" y="54" width="154" height="296" rx="34" fill="none" stroke="${edge}" stroke-opacity=".4" stroke-width="3"/>
      </g>`,
  };

  return `<svg class="art" viewBox="0 0 400 400" role="img" aria-label="${type}">${defs}${shapes[type] || shapes.phone}</svg>`;
}

/* product media: real photo if given, otherwise artwork */
function productMedia(p, colorIndex = 0) {
  if (p.image) return `<img src="${p.image}" alt="${p.name}" loading="lazy" />`;
  return deviceArt(p.type, p.colors[colorIndex].hex);
}
