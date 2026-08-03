import React, { useState } from 'react';
import { BUTTERFLY_IMAGES, BUTTERFLY_SPECS } from '../data';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <section id="butterfly" className="bg-[#FFF9F2] py-10 sm:py-12 px-4 sm:px-6 border-b-[3px] border-[#3BA8A8]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] mb-1 uppercase tracking-tight">
          Print Your Own Butterfly
        </h2>
        <p className="text-[#6D6D6D] text-sm sm:text-base font-medium max-w-2xl mx-auto mb-4">
          <span className="font-black">Pica Butterfly (Responsive / Unresponsive)</span> — Free &amp; open source
        </p>

        <div className="clay clay-cream edge-teal clay-lg p-4 sm:p-6 mb-5 text-left">
          {/* Photo carousel */}
          <div className="clay-well clay-cream relative overflow-hidden mb-3 p-2">
            <img
              key={image}
              src={image}
              alt={`Pica Butterfly design view ${imgIndex + 1}`}
              className="w-full h-auto max-h-[220px] sm:max-h-[320px] object-cover rounded-[20px_15px_22px_17px]"
            />

            {/* Carousel controls: prev/next buttons */}
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="clay clay-cream clay-btn clay-sm absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2"
            >
              <ChevronLeft className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="clay clay-btn clay-sm absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2"
            >
              <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
          </div>

          {/* Carousel dots — click to jump to image */}
          <div className="flex items-center justify-center gap-1 mb-3">
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

          {/* Specs Strip */}
          <div className="clay-well clay-cream px-3 py-2 text-center">
            <p className="text-[11px] sm:text-xs font-black text-[#2D2D2D] leading-snug">
              62mm · 44mm · 608 bearing · Silicone recess · PLA/PETG
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
            <a
              href="/pica_imperial_assembly.stl"
              download
              onClick={playSound}
              className="clay clay-btn clay-teal font-black text-xs px-4 py-2 sm:px-5 sm:py-2.5 uppercase flex items-center gap-1.5"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFD93D]" />
              <span>STL</span>
            </a>
            <a
              href="/pica_imperial_assembly.step"
              download
              onClick={playSound}
              className="clay clay-btn clay-yellow font-black text-xs px-4 py-2 sm:px-5 sm:py-2.5 uppercase flex items-center gap-1.5"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 text-[#2D2D2D]" />
              <span>STEP</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
