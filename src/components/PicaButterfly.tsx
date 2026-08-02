import React, { useState } from 'react';
import { BUTTERFLY_IMAGES, BUTTERFLY_SPECS } from '../data';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  playSound: () => void;
  onJoinWaitlist: () => void;
}

/**
 * Second design, shown separately from the Grinder Yoyo above. Carousel of
 * real product photos with carousel controls (prev/next, dots), specs table,
 * and waitlist CTA button.
 */
export const PicaButterfly: React.FC<Props> = ({ playSound, onJoinWaitlist }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const image = BUTTERFLY_IMAGES[imgIndex];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playSound();
    setImgIndex((i) => (i + 1) % BUTTERFLY_IMAGES.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playSound();
    setImgIndex((i) => (i - 1 + BUTTERFLY_IMAGES.length) % BUTTERFLY_IMAGES.length);
  };

  const jumpToImage = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    playSound();
    setImgIndex(idx);
  };

  return (
    <section id="butterfly" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b-[3px] border-[#3BA8A8]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] mb-2 uppercase tracking-tight">
          Pica Butterfly
        </h2>
        <p className="text-[#6D6D6D] text-sm sm:text-base font-medium max-w-lg mx-auto mb-8">
          Our second design — a classic responsive throw, free &amp; open source.
        </p>

        <div className="clay clay-cream edge-teal clay-lg p-5 sm:p-8 mb-8 text-left">
          {/* Photo carousel */}
          <div className="clay-well clay-cream relative overflow-hidden mb-6 p-2">
            <img
              key={image}
              src={image}
              alt={`Pica Butterfly design view ${imgIndex + 1}`}
              className="w-full h-auto max-h-[420px] object-cover rounded-[20px_15px_22px_17px]"
            />

            {/* Carousel controls: prev/next buttons */}
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="clay clay-cream clay-btn clay-sm absolute left-3 top-1/2 -translate-y-1/2 p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="clay clay-btn clay-sm absolute right-3 top-1/2 -translate-y-1/2 p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel dots — click to jump to image */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {BUTTERFLY_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => jumpToImage(e, i)}
                aria-label={`Show image ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === imgIndex ? 'w-5 bg-[#3BA8A8]' : 'w-2 bg-[#E3CDB0]'
                }`}
              />
            ))}
          </div>

          {/* Description */}
          <div className="px-2">
            <p className="text-[#6D6D6D] text-sm sm:text-base font-medium leading-relaxed mb-6">
              Two-piece butterfly profile, silicone response recess, standard 608 bearing —
              print files ship free once we're live.
            </p>
          </div>

          {/* Spec Table */}
          <div className="clay-well clay-cream p-4">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] block mb-3">
              The Numbers
            </label>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
              {BUTTERFLY_SPECS.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6D6D6D]">{s.label}</dt>
                  <dd className="text-xs font-black text-[#2D2D2D]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <button
            onClick={() => { playSound(); onJoinWaitlist(); }}
            className="clay clay-btn clay-teal font-black text-xs sm:text-sm px-6 py-3 uppercase flex items-center gap-2 mx-auto mt-6"
          >
            <Bell className="w-4 h-4 text-[#FFD93D]" />
            <span>Get Notified When Files Drop</span>
          </button>
        </div>
      </div>
    </section>
  );
};
