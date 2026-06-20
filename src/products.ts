import { Product, PromoCode } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'AeroSound ANC Headphones',
    category: 'Electronics',
    price: 249.99,
    rating: 4.8,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    description: 'Immerse yourself in pure auditory bliss. The AeroSound headphones feature Hybrid Active Noise Cancellation, high fidelity 40mm dynamic drivers, and an unprecedented 45-hour battery life.',
    features: [
      'Hybrid ANC up to 40dB reduction',
      'High-Resolution Audio Certification',
      'Ultra-soft protein leather earcups',
      'Multipoint Bluetooth 5.2 connectivity',
      '45-hour playback with fast-charge technology'
    ],
    colors: ['Obsidian Black', 'Silver Frost', 'Forest Muse'],
    inStock: true,
    isPopular: true,
    reviews: [
      { id: 'rev_1', reviewer: 'Lucas G.', rating: 5, comment: 'The noise cancellation is on par with the best in the market. Bass is warm and rich without being overwhelming.', date: 'May 12, 2026' },
      { id: 'rev_2', reviewer: 'Sophia M.', rating: 4, comment: 'Super comfortable for long flights! Very light on the head, though the storage case is a bit bulky.', date: 'June 01, 2026' }
    ]
  },
  {
    id: 'prod_2',
    name: 'AeroTypist Mechanical Keyboard',
    category: 'Electronics',
    price: 139.99,
    rating: 4.9,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop',
    description: 'Elevate your daily typing experience. Crafted with a premium aluminum chassis, hot-swappable tactile linear switches, and customizable dynamic RGB backlighting for perfectionists.',
    features: [
      'Hot-swappable MX Cherry Red switches',
      'CNC-milled anodized aluminum top frame',
      'PBT double-shot wear-resistant keycaps',
      'Triple connectivity: 2.4Ghz, Bluetooth & USB-C',
      'Fully customizable layers via open-source software'
    ],
    colors: ['Classic Gray', 'Arctic White', 'Retro Glow'],
    inStock: true,
    reviews: [
      { id: 'rev_3', reviewer: 'Aaron T.', rating: 5, comment: 'Hands down the best typing feel. Acoustic dampening pads inside make it sound incredibly clean.', date: 'April 20, 2026' }
    ]
  },
  {
    id: 'prod_3',
    name: 'Voyager OLED Smartwatch',
    category: 'Electronics',
    price: 189.99,
    rating: 4.6,
    reviewCount: 110,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop',
    description: 'Track your health and navigate your world. Outfitted with an always-on ultra-bright AMOLED screen, continuous blood-oxygen tracker, GPS mapping, and up to 10 days of continuous standby.',
    features: [
      '1.43-inch AMOLED Always-On Display',
      'Advanced 24/7 heart rate & SpO2 sensors',
      'Dual-band GNSS GPS navigation tracking',
      '5ATM water resistance up to 50 meters',
      'Compatible with both iOS and Android'
    ],
    colors: ['Midnight Grey', 'Earthy Olive', 'Desert Rose'],
    inStock: true,
    reviews: [
      { id: 'rev_4', reviewer: 'Nate K.', rating: 4, comment: 'Excellent screen visibility under bright sunlight. GPS locks fast during my morning trail runs.', date: 'May 28, 2026' }
    ]
  },
  {
    id: 'prod_4',
    name: 'Vanguard All-Weather Parka',
    category: 'Apparel',
    price: 179.99,
    rating: 4.7,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
    description: 'Stormproof shielding engineered for the urban explorer. Built from dense, breathable water-repellent performance textiles with custom adjustable storm hoods and heat-seal storm ventilation.',
    features: [
      'Triple-layer DWR water repellent outer barrier',
      'Thermoregulating lightweight synthetic down filling',
      'Concealed double-zip weatherproof side pockets',
      'Drawstring fleece-lined protective storm hood',
      'Reflective safety trim details on cuffs'
    ],
    colors: ['Navy Dusk', 'Moss Green', 'Stealth Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isPopular: true,
    reviews: [
      { id: 'rev_5', reviewer: 'Julian R.', rating: 5, comment: 'Kept me perfectly dry during an absolute downpour yesterday. Incredible quality-to-price ratio.', date: 'June 02, 2026' }
    ]
  },
  {
    id: 'prod_5',
    name: 'Ascent Merino Wool Hoodie',
    category: 'Apparel',
    price: 89.99,
    rating: 4.5,
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
    description: 'Nature-derived performance comfort. Whipped up from ethically sourced 100% fine New Zealand Merino Wool, delivering unparalleled insulation and natural odor resistance for years.',
    features: [
      'Premium ultra-breathable 240g/m² Merino wool fabric',
      'Natural moisture-wicking and odor-resistant tech',
      'Flatlocked seam structure eliminates friction chafing',
      'Thumb-hole cuffs prevent sleeve shift during activity',
      'Fully biodegradable eco-conscious materials'
    ],
    colors: ['Slate Grey', 'Wine Berry', 'Sage Melange'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    reviews: [
      { id: 'rev_6', reviewer: 'Maya L.', rating: 5, comment: 'Cozy, odor-free, packs super light. Wore it hiking 3 days in a row without a single wash, feels and smells like new.', date: 'May 15, 2026' }
    ]
  },
  {
    id: 'prod_6',
    name: 'Velocity Knit Running Shoes',
    category: 'Apparel',
    price: 119.99,
    rating: 4.8,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    description: 'Weightless speed for your stride. Featuring a custom single-thread woven upper and an ultra-reactive foam midsole, designed to cradle your feet with high-energy response.',
    features: [
      'Seamless multi-direction stretch knit upper',
      'SuperCloud responsive foam cushioning core',
      'Carbon-fiber composite speed propulsion plate',
      'High-traction decoupled rubber tread design',
      'Featherlight construction (only 7.4 oz)'
    ],
    colors: ['Solar Orange', 'Cool Coral', 'Cosmic Blue'],
    sizes: ['8', '9', '10', '11'],
    inStock: true,
    isPopular: true,
    reviews: [
      { id: 'rev_7', reviewer: 'Marcus B.', rating: 5, comment: 'Feels like running on marshmallows that push you forward. Absolute game changer for my knee joints!', date: 'June 10, 2026' }
    ]
  },
  {
    id: 'prod_7',
    name: 'Nordic Brass LED Table Lamp',
    category: 'Home & Living',
    price: 74.99,
    rating: 4.7,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
    description: 'A structural beacon of light. Impeccably cast from warm brushed brass, featuring a touch-activated pedestal with three-level dimming capacity and flicker-free energy efficient LED elements.',
    features: [
      'Hand-finished genuine solid brass pedestal and shade',
      'Energy-conserving warm white 12W built-in LED',
      '3-stage capacitive smart touch control sensor',
      'Frosted opal diffusers for comfortable eye safety',
      'Weighted scratch-free felt protective base'
    ],
    colors: ['Satin Brass', 'Brushed Bronze'],
    inStock: true,
    reviews: [
      { id: 'rev_8', reviewer: 'Amara V.', rating: 4, comment: 'Adds a very pleasant mid-century aesthetic to my study space. Wish the cord was slightly longer.', date: 'April 30, 2026' }
    ]
  },
  {
    id: 'prod_8',
    name: 'Linen Scented Soy Candle Duo',
    category: 'Home & Living',
    price: 29.99,
    rating: 4.9,
    reviewCount: 125,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop',
    description: 'Infuse calming stillness into your space. Pure botanical soy wax hand-poured inside textured ceramic jars. Includes notes of sun-bleached cotton, white cedar, and delicate seaside lavender.',
    features: [
      '100% natural organic soot-free soy wax composition',
      'Double lead-free woven organic cotton wicks',
      '55-hour extensive clean burn per candle jar',
      'Reusable matte-finished earthenware storage canisters',
      'Sourced and blended with premium essential oils'
    ],
    inStock: true,
    reviews: [
      { id: 'rev_9', reviewer: 'Elena P.', rating: 5, comment: 'Smells incredibly clean and tranquil. Not perfume-y at all. The matching jars look lovely on my shelf!', date: 'May 04, 2026' }
    ]
  },
  {
    id: 'prod_9',
    name: 'AeroPur Smart Air Purifier',
    category: 'Home & Living',
    price: 159.99,
    rating: 4.7,
    reviewCount: 63,
    image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=1000&auto=format&fit=crop',
    description: 'Pure, crisp respiration within minutes. Harnessing a True HEPA H13 advanced carbon-filter core target-erasing 99.97% of fine pollutants, pollen, smoke, and household dander.',
    features: [
      'Medical-grade True HEPA H13 multi-stage filter system',
      'Activated carbon honeycomb structure absorbs odors',
      'Built-in real-time laser ambient air quality sensor',
      'Whisper-quiet sleep setting operates at only 22dB',
      'Cleans spaces up to 500 sq ft once every 15 minutes'
    ],
    inStock: false,
    reviews: [
      { id: 'rev_10', reviewer: 'David S.', rating: 4, comment: 'My seasonal spring allergies completely vanished after running this in the bedroom for two days.', date: 'June 18, 2026' }
    ]
  },
  {
    id: 'prod_10',
    name: 'Commuter Roll-Top Backpack',
    category: 'Accessories',
    price: 94.99,
    rating: 4.8,
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
    description: 'Forged for multi-modal city transits. Generous expandable capacity with secure magnetic roll-top closure, dedicated side padded laptop sleeve, and water-intercepting ballistic Cordura skin.',
    features: [
      'Form-protecting 1050D highly durable ballistic Nylon',
      'Ergonomic high-density padded shoulder harnesses',
      'Padded quick-access 16" side laptop envelope',
      'Fidlock secure magnetic fast-release chest buckles',
      'Luggage handle pass-through strap for travel ease'
    ],
    colors: ['Charcoal Heather', 'Earthy Ochre', 'Stealth Navy'],
    inStock: true,
    isPopular: true,
    reviews: [
      { id: 'rev_11', reviewer: 'Tyler M.', rating: 5, comment: 'Love how flat it compresses when empty, yet scales enormously for weekend trips. The laptop side door is so easy at airport security.', date: 'May 09, 2026' }
    ]
  },
  {
    id: 'prod_11',
    name: 'Carbon Polarized Sunglasses',
    category: 'Accessories',
    price: 69.99,
    rating: 4.5,
    reviewCount: 38,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
    description: 'Chrystal clarity engineered for intense daylight. Premium lightweight hand-polished frames featuring multi-layer anti-scratch Japanese polarization filters and complete UVB shelter.',
    features: [
      'TAC Multi-layer impact-resistant polarized lenses',
      'Full spectrum protection: 100% UVA & UVB coverage',
      'Super-elastic steel-reinforced flexible hinge arms',
      'Includes premium eco-leather roll-up travel pouch',
      'Virtually indestructible featherweight resin frame'
    ],
    colors: ['Tortured Amber', 'Carbon Black', 'Olive Translucent'],
    inStock: true,
    reviews: [
      { id: 'rev_12', reviewer: 'Clara W.', rating: 5, comment: 'Cuts through water surface glare perfectly. Remarkably lightweight, they do not slide off my face.', date: 'June 14, 2026' }
    ]
  },
  {
    id: 'prod_12',
    name: 'Double-Wall Glass Thermos',
    category: 'Accessories',
    price: 34.99,
    rating: 4.6,
    reviewCount: 71,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1000&auto=format&fit=crop',
    description: 'Keep your hot brews steamy and green cold infusions perfectly chilled. Double-wall insulated shockproof glass structure equipped with custom laser-etched bamboo safety cap and inner loose tea strainer.',
    features: [
      'Heatproof high-borosilic glass body structure',
      'Vacuum double-wall retains cold (24h) or hot (12h)',
      'Natural organic secure-screw authentic bamboo lid',
      'Dual part micromesh active loose leaf tea filter basket',
      'Sweat-proof condensation-free clean outer grip'
    ],
    inStock: true,
    reviews: [
      { id: 'rev_13', reviewer: 'Evelyn H.', rating: 4, comment: 'Super chic design! The tea infuser is stellar. Took off one star because it is glass so I have to travel carefully.', date: 'June 17, 2026' }
    ]
  }
];

export const VALID_PROMOS: PromoCode[] = [
  { code: 'WELCOME20', discountType: 'percentage', discountValue: 20 },
  { code: 'SAVE10', discountType: 'percentage', discountValue: 10 },
  { code: 'FREESHIP', discountType: 'fixed', discountValue: 5.99, minAmount: 30 },
  { code: 'FESTIVE50', discountType: 'fixed', discountValue: 50.00, minAmount: 150 }
];
