import { FAQItem, ColorOption } from './types';

// Real product photos, served from /public — not hotlinked AI Studio asset URLs.
export const HERO_PRODUCT_IMAGE = '/picayoyo-hero.jpg';
export const BLUEPRINT_IMAGE = '/picayoyo-blueprint.jpg';
export const EXPLODED_IMAGE = '/picayoyo-exploded.jpg';

// Specs pulled directly from the parametric CAD model (params.py / README.md).
// Nothing here is measured off a physical sample — the first physical print
// hasn't happened yet. That's stated plainly on the page, not hidden.
export const SPECS = [
  { label: 'Diameter', value: '62.0 mm' },
  { label: 'Width', value: '44.0 mm' },
  { label: 'Bearing', value: '608 · 8/22/7mm, steel' },
  { label: 'Axle', value: '8mm ground shoulder, M6' },
  { label: 'Cap thread', value: '2-start, 4.0mm pitch' },
  { label: 'Turns to open', value: '0.75' },
  { label: 'Storage volume', value: '13.6 cm3' },
  { label: 'Material', value: 'PETG, 3D printed' },
  { label: 'Response', value: 'Responsive' },
];

// Real, computed verification results (section.py) — not benchmark claims.
// The self-locking-thread fact used to live here too as "Caps cant vibrate
// loose" - dropped because the Twist-to-Grind Core feature card below states
// the identical fact. Two cards for one fact reads as padding, not proof.
export const ENGINEERING_PROOF = [
  {
    title: 'Teeth actually mesh',
    detail: 'Grinder teeth overlap axially by 3.6mm — verified, not just collision-checked.',
  },
  {
    title: 'Chamber is sealed',
    detail: 'Floor under the grinder measures as a solid ring — nothing leaks into the string gap.',
  },
];

// Color preference — nothing is in production yet. This just captures what
// people actually want printed first.
export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'clear', name: 'Clear', swatch: '#cfe9e6' },
  { id: 'blue', name: 'Blue', swatch: '#3D6FC4' },
  { id: 'pink', name: 'Pink', swatch: '#E85C9C' },
  { id: 'green', name: 'Green', swatch: '#79B94E' },
  { id: 'glow', name: 'Glow in the Dark', swatch: '#c9f9c0' },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What makes PicaYoyo "the yoyo with a twist"?',
    answer: 'Both ends of the body unscrew. One half is a sealed chamber built around interleaved grinding teeth; the other is separate sealed storage. A 608 bearing rides an open string gap between them, so the yoyo itself works exactly like a normal throw.',
    category: 'Grinder Mechanism',
  },
  {
    id: 'faq-3',
    question: 'What is it made of?',
    answer: 'PETG, 3D printed in-house. We chose PETG over PLA because it holds up better to impact on a thrown toy. Nothing here is CNC-machined or metal except the bearing, axle screw, and nut.',
    category: 'Specs',
  },
  {
    id: 'faq-4',
    question: 'Has this actually been printed yet?',
    answer: 'Not yet — every spec on this page comes from the parametric CAD model, which has been fully verified in software (thread engagement, tooth mesh, seal, balance). A small test coupon prints first to confirm the thread survives real FDM tolerances, then the first full run follows.',
    category: 'General',
  },
  {
    id: 'faq-5',
    question: 'When does the first batch ship?',
    answer: 'We are targeting the first run within 30 days of the waitlist opening. Waitlist members hear about pricing and availability first - nothing is being sold on this page yet.',
    category: 'Shipping',
  },
  {
    id: 'faq-6',
    question: 'What does the Pica Yo-Yo actually grind?',
    answer: 'Herbs and spices. You know, like dried oregano, thyme, or crushed red pepper. Why, what else would you put in a 3D-printed pocket yo-yo?',
    category: 'General',
  },
];
