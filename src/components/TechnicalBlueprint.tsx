import React, { useState } from 'react';
import { BLUEPRINT_IMAGE } from '../data';
import { Cpu, ShieldCheck, Wrench, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';

interface Props {
  playSound: () => void;
  selectedColorCore: string;
  setSelectedColorCore: (color: string) => void;
}

export const TechnicalBlueprint: React.FC<Props> = ({
  playSound,
  selectedColorCore,
  setSelectedColorCore,
}) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'specs' | 'materials'>('blueprint');

  const coreOptions = [
    { name: 'Sky Blue Core', color: '#4577b9', code: 'sky-blue' },
    { name: 'Green Accents', color: '#7bb85c', code: 'green' },
    { name: 'Solar Gold', color: '#f9d74a', code: 'solar' },
    { name: 'Hot Coral', color: '#e54d30', code: 'coral' },
  ];

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
          {/* CAD Schematic Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0E6D9] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
              <span className="w-3 h-3 rounded-full bg-[#FFD93D]" />
              <span className="w-3 h-3 rounded-full bg-[#6BCB77]" />
              <span className="text-xs font-black uppercase text-[#2D2D2D] ml-2">
                CAD SCHEMATIC REV 3.4 — REVERSE ENGINEERED DESIGN
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#FFF9F2] px-3 py-1 rounded-full border border-[#F0E6D9] text-[11px] font-bold text-[#FF6B6B]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD93D]" />
              <span>Micron Tolerances</span>
            </div>
          </div>

          {/* Image Frame */}
          <div className="relative rounded-2xl border border-[#F0E6D9] bg-[#FFF9F2] p-3 overflow-hidden mb-6">
            <img
              src={BLUEPRINT_IMAGE}
              alt="PicaYoyo Blueprint"
              className="w-full h-auto object-contain rounded-xl"
            />

            {/* Custom Overlay Core Indicator Badge */}
            <div className="absolute bottom-5 right-5 bg-[#2D2D2D] text-white text-xs font-black px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 shadow-lg">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white animate-pulse"
                style={{ backgroundColor: selectedColorCore }}
              />
              <span className="uppercase tracking-wider">Active Core Preview</span>
            </div>
          </div>

          {/* Core Color Selectors */}
          <div className="bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-4">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] block mb-2 text-left">
              Select Chassis & Grinder Core Option:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {coreOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    playSound();
                    setSelectedColorCore(opt.color);
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedColorCore === opt.color
                      ? 'bg-[#FF6B6B] text-white border-[#E05252] shadow-[0_4px_0_#E05252] font-black'
                      : 'bg-white text-[#2D2D2D] border-[#F0E6D9] hover:bg-[#FFEEAD] font-bold'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className="text-xs truncate">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Component Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {/* Card 1 */}
          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#FF6B6B] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#FF6B6B] text-white flex items-center justify-center rounded-2xl shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#FF6B6B] mb-1">Precision CNC</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                Machined to micron tolerances for zero wobble during high-speed rotation up to 10,000 RPM.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#FFD93D] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#FFD93D] text-[#2D2D2D] flex items-center justify-center rounded-2xl shadow-sm">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#2D2D2D] mb-1">Dual-Part Twist Mechanism</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                Manual twist-to-grind core seamlessly integrated into the center hub without affecting spin dynamics.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#6BCB77] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#6BCB77] text-white flex items-center justify-center rounded-2xl shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#6BCB77] mb-1">10-Ball Ceramic Bearing</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                Unresponsive C-size concave ceramic bearing designed for friction-free string maneuvers.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex gap-4 p-5 bg-white border border-[#F0E6D9] rounded-2xl border-t-4 border-t-[#4D96FF] shadow-md hover:translate-y-[-2px] transition-transform">
            <div className="shrink-0 w-12 h-12 bg-[#4D96FF] text-white flex items-center justify-center rounded-2xl shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-[#4D96FF] mb-1">Aviation 6061 Hybrid</h4>
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed">
                Aircraft-grade aluminum outer weight rim with impact-resistant polycarbonate center shell.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
