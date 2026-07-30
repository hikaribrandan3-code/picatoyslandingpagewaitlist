import React from 'react';
import { BLUEPRINT_IMAGE, SPECS } from '../data';
import { Layers, RefreshCw, Hand, ShieldCheck } from 'lucide-react';

interface Props {
  playSound: () => void;
}

export const TechnicalBlueprint: React.FC<Props> = () => {
  return (
    <section id="blueprint" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b border-[#F0E6D9]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge & Title */}
        <span className="clay clay-yellow font-bold text-xs uppercase tracking-widest px-4 py-2 mb-3 inline-block">
          Technical Blueprint
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] mb-8 uppercase tracking-tight">
          Under the Hood
        </h2>

        {/* Blueprint Viewer Card */}
        <div className="clay clay-cream clay-lg p-5 sm:p-8 mb-8 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-[3px] border-[#E3CDB0] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="clay clay-coral w-3.5 h-3.5 [--clay-r:9999px]" />
              <span className="clay clay-yellow w-3.5 h-3.5 [--clay-r:9999px]" />
              <span className="clay clay-green w-3.5 h-3.5 [--clay-r:9999px]" />
              <span className="text-xs font-black uppercase text-[#2D2D2D] ml-2">
                Reverse-engineered from scratch
              </span>
            </div>

            <div className="clay clay-cream clay-sm flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-[#D94F4F]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Computed, not estimated</span>
            </div>
          </div>

          {/* Image Frame */}
          <div className="clay-well clay-cream relative p-3 overflow-hidden mb-6">
            <img
              src={BLUEPRINT_IMAGE}
              alt="Technical drawing of the PicaYoyo showing the lid, main body, grinding core, dimensions, and the twist-to-grind mechanism"
              className="w-full h-auto object-contain rounded-[20px_15px_22px_17px]"
            />
          </div>

          {/* Spec Table */}
          <div className="clay-well clay-cream p-4 text-left">
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
        </div>

        {/* Feature Component Breakdown Grid — accurate to the real build */}
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
          ].map((f) => (
            <div
              key={f.heading}
              className={`clay clay-cream clay-lift ${f.tilt} flex gap-4 p-5`}
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
          ))}
        </div>
      </div>
    </section>
  );
};
