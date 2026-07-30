import { FAQItem, MysteryBoxItem, ReviewItem, YoyoEdition } from './types';

export const HERO_PRODUCT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBsABm1UNVGXAiu7auaqskzgDltf58kwyi0DfrRI4mYAtiTl8IHaiMIltpRyo1k-Zn6Poxpmdajjbx4XtrRmshhie1vUJ6r3Knp2mlObLP1uQGM_rLbU4gCIGqyYqNXVLwA8DmruuTg6T_hE3kvVGxxXpV_kjw2Zb09BQo0JgaKacXxKBjPUfXG3LVGTvJm_87CTwO2-pqukBGIo-nyvYLPG3VcTXx1FiqzPBSFUtPb4A_2w7sH8WWhMukr2DXURZ5PEg';

export const LIFESTYLE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmBhWJRsEQLCFbOzTD5W3zbJ91_hWv-C_goBvZ2sGeb-_8ZwrZJErIeiJesYVprpXNg4kfyu7rkFVGNuCUoloZCQAnGIqTIbfK3inpomqFrdbBvKjjB467ZPhOeBPaQPeqIv6-1CF0bqFMxlZINZRtbnhGdIC9IZX6PBYQipvoQdJANj6mWqM72RCmEda6sbgoYR9gQSXGbThXyCFzVmMi-qADoRXc3l9LN_3HGrGZIpBA80-70Sxqza3bp7gGl277PA';

export const BLUEPRINT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3xBpTDgZF22ZEWMrenkfgGtwSmB7rXI1lGGQO_u33li_IMlWrpMd_LarTalfN26m2L1PQzHEo9L-27_r3KY2MZZxVmjYmm01wJvXQq4uQlhhjmXbAEWSivGLr7p8UrFSi0XyPuNlDpQnAv0lRdwKLD9yin3_Rc3VETOfE9_P-XMwgsS5ggpKOqjbdYyayzbnVxR4V1bexg8xsqCLT-W3CEk3CENE6Aev2jrASFxBQ06IS7scvqhyUT-36S42Hgjywiw';

export const YOYO_EDITIONS: YoyoEdition[] = [
  {
    id: 'pica-yoyo-sky-blue',
    name: 'PicaYoyo Drop #003 — Sky Blue Edition',
    coreColor: '#4577b9',
    accentColor: '#7bb85c',
    price: 49,
    originalPrice: 65,
    inStock: true,
    stockLeft: 18,
    image: HERO_PRODUCT_IMAGE,
    description:
      'The original collector’s yoyo grinder featuring a precision-machined Sky Blue core and vibrant Green Accents.',
    specs: {
      weight: '64.5 grams',
      diameter: '56.0 mm',
      width: '43.2 mm',
      bearing: 'Unresponsive C-Size 10-Ball Ceramic Concave',
      material: '6061 Aerospace Aluminum + Polycarbonate Core',
      spinTime: '4m 30s average sleep time',
    },
  },
  {
    id: 'pica-yoyo-volt-green',
    name: 'PicaYoyo Drop #003 — Volt Green Edition',
    coreColor: '#7bb85c',
    accentColor: '#f9d74a',
    price: 49,
    originalPrice: 65,
    inStock: true,
    stockLeft: 12,
    image: LIFESTYLE_IMAGE,
    description:
      'High contrast neon green chassis engineered for high-visibility DNA string tricks and fast finger spins.',
    specs: {
      weight: '64.8 grams',
      diameter: '56.0 mm',
      width: '43.2 mm',
      bearing: 'Unresponsive C-Size 10-Ball Ceramic Concave',
      material: '6061 Aerospace Aluminum + Fluoroscent Acrylic',
      spinTime: '4m 45s average sleep time',
    },
  },
  {
    id: 'pica-yoyo-solar-yellow',
    name: 'PicaYoyo Drop #003 — Solar Gold Edition',
    coreColor: '#f9d74a',
    accentColor: '#e54d30',
    price: 54,
    originalPrice: 70,
    inStock: true,
    stockLeft: 5,
    image: HERO_PRODUCT_IMAGE,
    description:
      'Ultra-limited anodized gold finish with red laser-etched Pica logo graphics for serious toy collectors.',
    specs: {
      weight: '65.1 grams',
      diameter: '56.0 mm',
      width: '43.2 mm',
      bearing: 'Gold Plated 10-Ball Concave Bearing',
      material: 'Anodized Aircraft Aluminum & Polished Steel Weight Rings',
      spinTime: '5m 10s average sleep time',
    },
  },
];

export const MYSTERY_BOX_REWARDS: MysteryBoxItem[] = [
  {
    id: 'item-1',
    name: '10x Pro 100% Polyester Neon String Pack',
    rarity: 'Common',
    description: 'Custom-tensioned high performance strings in electric yellow and cyan.',
    iconName: 'Zap',
    color: '#f9d74a',
  },
  {
    id: 'item-2',
    name: 'Holographic PicaYoyo Vault Sticker Set',
    rarity: 'Common',
    description: 'Weatherproof vinyl stickers featuring nostalgic 2000s toy aesthetics.',
    iconName: 'Sparkles',
    color: '#3ba8a8',
  },
  {
    id: 'item-3',
    name: 'Custom Velvet Drawstring Carrying Pouch',
    rarity: 'Rare',
    description: 'Embroidered protective pouch to keep your CNC chassis scratch-free.',
    iconName: 'PackageCheck',
    color: '#4577b9',
  },
  {
    id: 'item-4',
    name: 'Spare Ceramic Concave Bearing & Lube Tube',
    rarity: 'Rare',
    description: 'High-speed zero-friction bearing for whisper-quiet spins.',
    iconName: 'ShieldCheck',
    color: '#7bb85c',
  },
  {
    id: 'item-5',
    name: 'Gold Founder Edition Grinder Core',
    rarity: 'Legendary',
    description: '1 of 100 limited edition swap-out grinding core mechanism!',
    iconName: 'Crown',
    color: '#e54d30',
  },
];

export const CUSTOMER_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Derek "SpinMaster" M.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'The twist mechanism is unbelievable!',
    content:
      'I was skeptical about a yoyo grinder combo, but the machining tolerances are insanely tight. Zero vibe on a long sleep, and the DNA string trick holds for twice as long. Drop #002 sold out in minutes glad I joined the waitlist.',
    date: '2 days ago',
    verifiedBuyer: true,
    trickLevel: 'Pro Tricker',
    helpfulCount: 42,
  },
  {
    id: 'rev-2',
    author: 'Elena R.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Nostalgic perfection for adult collectors',
    content:
      'Unboxing this took me straight back to buying my first pro yoyo in 1999. The heavy-duty plastic packaging, hard shadow artwork, and tactile feel are 10/10.',
    date: '1 week ago',
    verifiedBuyer: true,
    trickLevel: 'Collector',
    helpfulCount: 29,
  },
  {
    id: 'rev-3',
    author: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Precision CNC with no wobble',
    content:
      'Hits 4+ minutes of sleep easily. The weighted outer ring creates massive inertia. Best $49 I spent this year on desktop skill toys.',
    date: '2 weeks ago',
    verifiedBuyer: true,
    trickLevel: 'Intermediate',
    helpfulCount: 18,
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What makes PicaYoyo "The Yoyo with a Twist"?',
    answer:
      'PicaYoyo houses a patent-pending dual-part twist-to-grind core inside an unresponsive 6061 aluminum & polycarbonate chassis. You get high-precision trick performance along with a functional manual twist mechanism built directly into the center core.',
    category: 'Grinder Mechanism',
  },
  {
    id: 'faq-2',
    question: 'Is PicaYoyo responsive or unresponsive out of the box?',
    answer:
      'PicaYoyo comes pre-installed with an Unresponsive C-size 10-ball ceramic bearing for modern string tricks (requires a "bind" to return to hand). We also include a responsive slim bearing in the mystery box pack for beginners!',
    category: 'Specs',
  },
  {
    id: 'faq-3',
    question: 'How do Vault Drops work?',
    answer:
      'We release PicaYoyo in small numbered production batches ("Vault Drops"). Each drop features exclusive colorways and numbered collector packaging. Inner Circle waitlist members get priority 24-hour early access before public release.',
    category: 'General',
  },
  {
    id: 'faq-4',
    question: 'What is included in the mystery box packaging?',
    answer:
      'Every PicaYoyo box includes the PicaYoyo chassis, 10x high-grade polyester strings, holographic sticker sheet, velvet travel pouch, maintenance lube, and a surprise mystery item!',
    category: 'Shipping',
  },
];
