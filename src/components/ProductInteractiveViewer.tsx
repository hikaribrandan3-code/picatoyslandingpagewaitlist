import React from 'react';
import { CheckCircle2, FlaskConical } from 'lucide-react';
import { ENGINEERING_PROOF, EXPLODED_IMAGE } from '../data';

interface Props {
  playSound: () => void;
}

export const ProductInteractiveViewer: React.FC<Props> = ({ playSound }) => {
  return (
    <section id="features" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b border-[#F0E6D9]">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-10">
          <span className="clay clay-yellow font-bold text-xs uppercase tracking-widest px-4 py-2 inline-block mb-3">
            Seven Parts
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] uppercase tracking-tight">
            What's Inside
          </h2>
          <p className="text-[#6D6D6D] text-sm sm:text-base font-medium max-w-lg mx-auto mt-2">
            Four printed pieces, three pieces of hardware, one string. It comes assembled.
          </p>
        </div>

        {/* Feature Main Card */}
        <div className="bg-white border border-[#F0E6D9] rounded-3xl p-5 sm:p-8 shadow-xl overflow-hidden">
          {/* Card Image */}
          <div className="relative rounded-2xl border border-[#F0E6D9] overflow-hidden mb-6">
            <img
              src={EXPLODED_IMAGE}
              alt="The four printed PicaYoyo parts laid out with the steel bearing and shoulder screw between them"
              className="w-full h-auto max-h-[420px] object-cover"
            />
          </div>

          {/* Description Content */}
          <div className="p-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FF6B6B] mb-3">
              Built From the Bearing Outward
            </h3>
            <p className="text-[#6D6D6D] text-base sm:text-lg font-medium leading-relaxed">
              We started from a reference drawing that turned out to be impossible — its exploded view and section view described two different machines. So we threw it out and derived the whole thing from scratch, parametrically.
            </p>
          </div>

          {/* Engineering Proof Panel — real, computed verification results */}
          <div className="mt-8 bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-[#FF6B6B]" />
              <span className="font-black text-sm uppercase text-[#2D2D2D]">
                Verified in CAD, before a single part is printed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENGINEERING_PROOF.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-[#F0E6D9] rounded-xl p-4 flex gap-3 items-start"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#6BCB77] shrink-0 mt-0.5" />
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
      </div>
    </section>
  );
};
