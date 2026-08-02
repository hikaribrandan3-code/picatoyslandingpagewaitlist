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
    <section id="butterfly" className="bg-[#FFF9F2] py-12 sm:py-16 px-4 sm:px-6 border-b-[3px] border-[#3BA8A8]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-[#2D2D2D] mb-1.5 uppercase tracking-tight">
          Free STL File
        </h2>
        <p className="text-[#6D6D6D] text-xs sm:text-sm font-medium max-w-lg mx-auto mb-6">
          <span className="font-black">Pica Butterfly (Responsive / Unresponsive)</span><br />
          a classic responsive throw, free &amp; open source.
        </p>

        <div className="clay clay-cream edge-teal clay-lg p-4 sm:p-6 mb-6 text-left">
          {/* Photo carousel */}
          <div className="clay-well clay-cream relative overflow-hidden mb-4 p-2">
            <img
              key={image}
              src={image}
              alt={`Pica Butterfly design view ${imgIndex + 1}`}
              className="w-full h-auto max-h-[300px] sm:max-h-[420px] object-cover rounded-[20px_15px_22px_17px]"
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
          <div className="flex items-center justify-center gap-1 mb-4">
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
          <div className="px-2 mb-4">
            <p className="text-[#6D6D6D] text-xs sm:text-sm font-medium leading-relaxed">
              Two-piece butterfly profile, silicone response recess, standard 608 bearing — free STL &amp; STEP files, open source, print it yourself.
            </p>
          </div>

          {/* Spec Table */}
          <div className="clay-well clay-cream p-3">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] block mb-2">
              The Numbers
            </label>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
              {BUTTERFLY_SPECS.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6D6D6D]">{s.label}</dt>
                  <dd className="text-[10px] sm:text-xs font-black text-[#2D2D2D]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
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
