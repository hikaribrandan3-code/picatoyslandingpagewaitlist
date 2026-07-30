import React from 'react';
import { BLUEPRINT_IMAGE, COLOR_OPTIONS, SPECS } from '../data';
import { Layers, RefreshCw, CircleDot, ShieldCheck } from 'lucide-react';

interface Props {
  playSound: () => void;
  selectedColorId: string;
  setSelectedColorId: (id: string) => void;
}

export const TechnicalBlueprint: React.FC<Props> = ({
  playSound,
  selectedColorId,
  setSelectedColorId,
}) => {
  return (
    <section id="blueprint" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b border-[#F0E6D9]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge & Title */}
        <span className="text-[#D4A017] font-bold text-xs uppercase tracking-widest bg-[#FFEEAD] px-4 py-1.5 rounded-full border border-[#F0E6D9] mb-3 inline-block">
          Technical Blueprint
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] mb-8 uppercase tracking-tight">
          Under the Hood
        </h2>

        {/* Blueprint Viewer Card */}
        <div className="border border-[#F0E6D9] rounded-3xl p-5 sm:p-8 bg-white shadow-xl mb-8 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0E6D9] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
              <span className="w-3 h-3 rounded-full bg-[#FFD93D]" />
              <span className="w-3 h-3 rounded-full bg-[#6BCB77]" />
              <span className="text-xs font-black uppercase text-[#2D2D2D] ml-2">
                Reverse-engineered from scratch
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#FFF9F2] px-3 py-1 rounded-full border border-[#F0E6D9] text-[11px] font-bold text-[#FF6B6B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Computed, not estimated</span>
            </div>
          </div>

          {/* Image Frame */}
          <div className="relative rounded-2xl border border-[#F0E6D9] bg-[#FFF9F2] p-3 overflow-hidden mb-6">
            <img
              src={BLUEPRINT_IMAGE}
              alt="Technical drawing of the PicaYoyo showing the lid, main body, grinding core, dimensions, and the twist-to-grind mechanism"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* Spec Table */}
          <div className="bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-4 mb-4 text-left">
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

          {/* Color Preference Vote */}
          <div className="bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-4">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] block mb-2 text-left">
              Vote: which color should we print first?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    playSound();
                    setSelectedColorId(opt.id);
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedColorId === opt.id
                      ? 'bg-[#FF6B6B] text-white border-[#E05252] shadow-[0_4px_0_#E05252] font-black'
                      : 'bg-white text-[#2D2D2D] border-[#F0E6D9] hover:bg-[#FFEEAD] font-bold'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: opt.swatch }}
                  />
                  <span className="text-xs truncate">{opt.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#6D6D6D] font-bold mt-2.5 text-left">
              Your pick carries through to the waitlist form below — that's how we decide what to print first.
            </p>
          </div>
        </div>

        {/* Feature Component Breakdown Grid — accurate to the real build */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#FF6B6B] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#FF6B6B] text-white flex items-center justify-center rounded-2xl shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#FF6B6B] mb-1">3D-Printed PETG</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                FDM printed, 0.2mm layers, 30–40% infill. PETG over PLA for impact resistance on a thrown toy.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#FFD93D] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#FFD93D] text-[#2D2D2D] flex items-center justify-center rounded-2xl shadow-sm">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#2D2D2D] mb-1">Twist-to-Grind Core</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                Both caps unscrew in 0.75 turns. The thread is self-locking, so play can't shake a cap open mid-throw.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#6BCB77] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#6BCB77] text-white flex items-center justify-center rounded-2xl shadow-sm">
              <CircleDot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#6BCB77] mb-1">608 Steel Bearing</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                Standard 608 (8/22/7mm). Responsive build for this first run — an unresponsive version is on the roadmap.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#4D96FF] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#4D96FF] text-white flex items-center justify-center rounded-2xl shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#4D96FF] mb-1">Sealed Two Ways</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                Grinder chamber and storage cavity are each fully sealed from the open string gap between them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
