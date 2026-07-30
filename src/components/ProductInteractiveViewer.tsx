import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Zap, Award, CheckCircle2, Play, Gauge, Trophy } from 'lucide-react';
import { LIFESTYLE_IMAGE } from '../data';

interface Props {
  playSound: () => void;
  onSelectEdition: () => void;
}

export const ProductInteractiveViewer: React.FC<Props> = ({ playSound, onSelectEdition }) => {
  const [selectedTrick, setSelectedTrick] = useState<'dna' | 'world' | 'grind'>('dna');
  const [isPlayingTrick, setIsPlayingTrick] = useState(false);

  const trickData = {
    dna: {
      name: 'DNA String Trick',
      difficulty: 'Master Level',
      spinReq: '8,000 RPM',
      desc: 'Finger spin on the center concave grinding core while string winds vertically like a double helix.',
      duration: '45 seconds duration',
    },
    world: {
      name: 'Around The World',
      difficulty: 'Intermediate',
      spinReq: '5,500 RPM',
      desc: 'Full 360-degree orbital arc utilizing high-inertia perimeter weight distribution.',
      duration: '60 seconds orbit',
    },
    grind: {
      name: 'Manual Twist Grind',
      difficulty: 'Pro Collector',
      spinReq: 'Zero Vibe Core',
      desc: 'Smooth palm & fingernail grinding on micro-machined anodized aluminum edge.',
      duration: 'Infinite grind',
    },
  };

  const handlePlayTrick = (trickKey: 'dna' | 'world' | 'grind') => {
    playSound();
    setSelectedTrick(trickKey);
    setIsPlayingTrick(true);
    setTimeout(() => setIsPlayingTrick(false), 3000);
  };

  return (
    <section id="features" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b border-[#F0E6D9]">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-10">
          <span className="bg-[#FFEEAD] text-[#D4A017] font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#F0E6D9] inline-block mb-3">
            Performance & Ergonomics
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] uppercase tracking-tight">
            More Than Just A Throw
          </h2>
          <p className="text-[#6D6D6D] text-sm sm:text-base font-medium max-w-lg mx-auto mt-2">
            Combining aerospace weight distribution with nostalgic modular toy engineering.
          </p>
        </div>

        {/* Feature Main Card */}
        <div className="bg-white border border-[#F0E6D9] rounded-3xl p-5 sm:p-8 shadow-xl overflow-hidden">
          {/* Card Image */}
          <div className="relative rounded-2xl border border-[#F0E6D9] overflow-hidden mb-6 group">
            <img
              src={LIFESTYLE_IMAGE}
              alt="PicaYoyo Lifestyle"
              className="w-full h-auto max-h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5 sm:p-6">
              <div className="text-white">
                <span className="bg-[#FFD93D] text-[#2D2D2D] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block shadow-sm">
                  Precision Weighted Core
                </span>
                <h4 className="text-xl sm:text-2xl font-black">Balanced to Micron Tolerances</h4>
              </div>
            </div>
          </div>

          {/* Description Content */}
          <div className="p-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FF6B6B] mb-3">
              Perfectly Balanced
            </h3>
            <p className="text-[#6D6D6D] text-base sm:text-lg font-medium leading-relaxed">
              Whether you're hitting an around-the-world or a complex DNA string trick, PicaYoyo's precision weighted core ensures <strong className="text-[#2D2D2D] font-black">20% longer spin times</strong> than standard retail toys.
            </p>
          </div>

          {/* Trick Simulator Widget */}
          <div className="mt-8 bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-[#FF6B6B]" />
                <span className="font-black text-sm uppercase text-[#2D2D2D]">
                  Trick Physics Test Bench
                </span>
              </div>
              <span className="text-xs font-bold text-[#FF6B6B] bg-[#FF6B6B]/10 px-3 py-1 rounded-full border border-[#FF6B6B]/20">
                Interactive Simulation
              </span>
            </div>

            {/* Trick selector tabs */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {(['dna', 'world', 'grind'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => handlePlayTrick(key)}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center uppercase ${
                    selectedTrick === key
                      ? 'bg-[#FF6B6B] text-white border-[#E05252] shadow-[0_4px_0_#E05252]'
                      : 'bg-white text-[#2D2D2D] border-[#F0E6D9] hover:bg-[#FFEEAD]'
                  }`}
                >
                  {trickData[key].name}
                </button>
              ))}
            </div>

            {/* Selected Trick Info Display */}
            <div className="bg-white border border-[#F0E6D9] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-sm text-[#4D96FF]">
                    {trickData[selectedTrick].name}
                  </span>
                  <span className="text-[10px] font-extrabold bg-[#FFD93D] text-[#2D2D2D] px-2.5 py-0.5 rounded-full">
                    {trickData[selectedTrick].difficulty}
                  </span>
                </div>
                <p className="text-xs text-[#6D6D6D] font-medium">
                  {trickData[selectedTrick].desc}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                <div className="text-right">
                  <span className="text-[10px] block text-[#6D6D6D] uppercase font-bold">Spin Stability</span>
                  <span className="text-xs font-black text-[#6BCB77]">{trickData[selectedTrick].spinReq}</span>
                </div>
                <button
                  onClick={() => handlePlayTrick(selectedTrick)}
                  className="bg-[#2D2D2D] hover:bg-black text-white text-xs font-black px-4 py-2 rounded-xl shadow-[0_4px_0_#1A1A1A] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 fill-current text-[#FFD93D] ${isPlayingTrick ? 'animate-bounce' : ''}`} />
                  <span>{isPlayingTrick ? 'Executing...' : 'Simulate'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rating and Pro Grade Badge Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-5 border-t border-[#F0E6D9] gap-4">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-[#FFD93D] fill-current"
                />
              ))}
              <span className="text-xs font-black text-[#2D2D2D] ml-2">
                5.0 Perfect Balance Score
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-[#FFD93D] text-[#2D2D2D] px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FF6B6B]" />
                PRO GRADE
              </span>

              <button
                onClick={() => {
                  playSound();
                  onSelectEdition();
                }}
                className="bg-[#FF6B6B] text-white font-black text-xs px-5 py-2 rounded-xl shadow-[0_4px_0_#E05252] hover:translate-y-0.5 cursor-pointer"
              >
                Choose Color
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
