import React, { useState } from 'react';
import { BLUEPRINT_IMAGE, EXPLODED_IMAGE, ENGINEERING_PROOF, SPECS } from '../data';
import { Layers, RefreshCw, Hand, CheckCircle2, ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';

interface Props {
  playSound: () => void;
}

const IMAGES = [
  {
    src: EXPLODED_IMAGE,
    alt: 'The four printed Pica Yoyo parts laid out with the steel bearing and shoulder screw between them',
    label: 'The Real Parts',
  },
  {
    src: BLUEPRINT_IMAGE,
    alt: 'Technical drawing of the Pica Yoyo showing the lid, main body, grinding core, dimensions, and the twist-to-grind mechanism',
    label: 'How It Works',
  },
];

/**
 * This used to be two sections — "What's Inside" and "Under the Hood" —
 * that each showed one product image, one trust badge, and one proof grid.
 * Same claim ("built from scratch, CAD-verified"), same shape, twice. Merged
 * into one section with a single trust badge and a two-image toggle instead:
 * the real parts first (what convinces someone this is a real object), then
 * an arrow reveals the blueprint (what convinces them it's engineered, not
 * guessed at) — the reveal itself is the hook, not just two images stacked.
 */
export const TechnicalBlueprint: React.FC<Props> = ({ playSound }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const image = IMAGES[imgIndex];

  const nextImage = () => {
    playSound();
    setImgIndex((i) => (i + 1) % IMAGES.length);
  };
  const prevImage = () => {
    playSound();
    setImgIndex((i) => (i - 1 + IMAGES.length) % IMAGES.length);
  };

  return (
    <section id="features" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b-[3px] border-[#FFD93D]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge & Title */}
        <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] mb-2 uppercase tracking-tight">
          Pica Yoyo Specs Designed: In Fusion 360
        </h2>

        <p className="text-[#6D6D6D] text-sm sm:text-base font-medium max-w-lg mx-auto mb-8">
          7 parts. 4 printed, 3 hardware, 1 string. Comes assembled.
        </p>

        <div className="clay clay-cream edge-yellow clay-lg p-5 sm:p-8 mb-8 relative text-left">
          {/* Mobile: real photo only, static, no toggle — the blueprint
              schematic appears further down (after the spec table, right
              before the feature grid) instead of behind a carousel here.
              Desktop keeps the full carousel below, unchanged. */}
          <div className="lg:hidden clay-well clay-cream relative overflow-hidden mb-6 p-2">
            <img
              src={IMAGES[0].src}
              alt={IMAGES[0].alt}
              className="w-full h-auto max-h-[420px] object-cover rounded-[20px_15px_22px_17px]"
            />
          </div>

          {/* Desktop: Image Carousel — real photo first, arrow reveals the blueprint */}
          <div className="hidden lg:block">
            <div className="clay-well clay-cream relative overflow-hidden mb-3 p-2">
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                className="w-full h-auto max-h-[420px] object-cover rounded-[20px_15px_22px_17px]"
              />

              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="clay clay-cream clay-btn clay-sm absolute left-3 top-1/2 -translate-y-1/2 p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="clay clay-cream clay-btn clay-sm absolute right-3 top-1/2 -translate-y-1/2 p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Caption + dots, centered under the frame */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#6D6D6D]">
                {image.label}
              </span>
              <div className="flex items-center gap-1.5">
                {IMAGES.map((img, i) => (
                  <button
                    key={img.src}
                    onClick={() => { playSound(); setImgIndex(i); }}
                    aria-label={`Show ${img.label}`}
                    className={`h-2 rounded-full transition-all ${
                      i === imgIndex ? 'w-5 bg-[#FF6B6B]' : 'w-2 bg-[#E3CDB0]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-2">
            <p className="text-[#6D6D6D] text-base sm:text-lg font-medium leading-relaxed">
              Engineered by an avid yoyoer. Designed in Fusion 360. Every spec on this page comes directly from CAD.
            </p>
          </div>

          {/* Spec Table */}
          <div className="clay-well clay-cream p-4 mt-6">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] block mb-3">
              The Numbers
            </label>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
              {SPECS.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6D6D6D]">{s.label}</dt>
                  <dd className="text-xs font-black text-[#2D2D2D]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mobile: blueprint schematic lands here — after the numbers,
              right before the feature grid starts with 3D-Printed PETG. */}
          <div className="lg:hidden mt-6">
            <div className="clay-well clay-cream relative overflow-hidden p-2">
              <img
                src={IMAGES[1].src}
                alt={IMAGES[1].alt}
                className="w-full h-auto object-contain rounded-[20px_15px_22px_17px]"
              />
            </div>
            <p className="text-center text-[11px] font-black uppercase tracking-widest text-[#6D6D6D] mt-2">
              {IMAGES[1].label}
            </p>
          </div>

          {/* Engineering Proof — desktop only. On a phone this is the third
              "trust us" block in a row (the narrative paragraph and the spec
              table already carry that weight); on desktop there's room to
              lay it out as a real horizontal banner instead of stacking. */}
          <div className="hidden lg:flex clay-well clay-cream mt-4 p-5 items-center gap-6">
            <div className="flex items-center gap-2 w-64 shrink-0">
              <FlaskConical className="w-5 h-5 text-[#D94F4F] shrink-0" />
              <span className="font-black text-sm uppercase text-[#2D2D2D]">
                Verified in CAD, before a single part is printed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {ENGINEERING_PROOF.map((item, i) => (
                <div
                  key={item.title}
                  className={`clay clay-cream clay-sm clay-lift ${i % 2 ? 'clay-tilt-r' : 'clay-tilt-l'} p-4 flex gap-3 items-start`}
                >
                  <CheckCircle2 className="w-5 h-5 text-[#3E9648] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-xs text-[#2D2D2D] block mb-1">
                      {item.title}
                    </span>
                    <p className="text-xs text-[#6D6D6D] font-medium leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Component Breakdown Grid — accurate to the real build.
            "Twist-to-Grind Core" carries the self-locking-thread fact alone
            now; it used to be duplicated in the Engineering Proof grid above. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {[
            {
              chip: 'clay-coral',
              tilt: 'clay-tilt-l',
              icon: <Layers className="w-6 h-6" />,
              heading: '3D-Printed PETG',
              headingColor: '#D94F4F',
              body: 'FDM printed, 0.2mm layers, 30–40% infill. PETG over PLA for impact resistance on a thrown toy.',
            },
            {
              chip: 'clay-yellow',
              tilt: 'clay-tilt-r',
              icon: <RefreshCw className="w-6 h-6" />,
              heading: 'Twist-to-Grind Core',
              headingColor: '#2D2D2D',
              body: "Both caps unscrew in 0.75 turns. The thread is self-locking, so play can't shake a cap open mid-throw.",
            },
            {
              chip: 'clay-green',
              tilt: 'clay-tilt-r',
              icon: <Hand className="w-6 h-6" />,
              heading: 'Responsive Yoyo',
              headingColor: '#3E9648',
              body: 'String snaps back to hand on a tug — the classic beginner feel. Bearing spec is in the numbers above.',
            },
          ].map((f, i) => {
            const edges = ['edge-blue', 'edge-coral', 'edge-green'];
            const edgeClass = edges[i % edges.length];
            return (
            <div
              key={f.heading}
              className={`clay clay-cream ${edgeClass} clay-lift ${f.tilt} flex gap-4 p-5`}
            >
              <div className={`clay ${f.chip} clay-sm shrink-0 w-12 h-12 flex items-center justify-center`}>
                {f.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-lg mb-1" style={{ color: f.headingColor }}>
                  {f.heading}
                </h4>
                <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">{f.body}</p>
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};
