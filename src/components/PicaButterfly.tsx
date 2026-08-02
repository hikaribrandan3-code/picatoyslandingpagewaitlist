import React from 'react';
import { BUTTERFLY_IMAGES, BUTTERFLY_SPECS } from '../data';
import { ImagePlus, Bell } from 'lucide-react';

interface Props {
  playSound: () => void;
  onJoinWaitlist: () => void;
}

/**
 * Second design, shown separately from the Grinder Yoyo above. Photo slots
 * render an empty "coming soon" placeholder until a real file lands at the
 * matching BUTTERFLY_IMAGES path in /public — swapping in a photo later
 * needs no code change here, only dropping the file in place.
 */
export const PicaButterfly: React.FC<Props> = ({ playSound, onJoinWaitlist }) => {
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
          {/* Photo gallery — 3 slots reserved for real product photos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {BUTTERFLY_IMAGES.map((src, i) => (
              <div
                key={src}
                className="clay-well clay-cream aspect-square flex flex-col items-center justify-center gap-2 p-4"
              >
                <ImagePlus className="w-6 h-6 text-[#B7A78C]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#B7A78C] text-center">
                  Photo {i + 1} coming soon
                </span>
              </div>
            ))}
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

          <p className="text-[#6D6D6D] text-sm sm:text-base font-medium leading-relaxed mt-6 px-1">
            Two-piece butterfly profile, silicone response recess, standard 608 bearing —
            print files ship free once we're live.
          </p>

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
