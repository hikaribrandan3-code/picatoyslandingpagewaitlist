import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MYSTERY_BOX_REWARDS } from '../data';
import { MysteryBoxItem } from '../types';
import { Gift, Sparkles, Zap, PackageCheck, ShieldCheck, Crown, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  playSound: () => void;
}

export const SecondActMysteryBox: React.FC<Props> = ({ playSound }) => {
  const [unboxedItem, setUnboxedItem] = useState<MysteryBoxItem | null>(null);
  const [isUnboxing, setIsUnboxing] = useState(false);

  const handleUnbox = () => {
    playSound();
    setIsUnboxing(true);
    setUnboxedItem(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * MYSTERY_BOX_REWARDS.length);
      const chosen = MYSTERY_BOX_REWARDS[randomIndex];
      setUnboxedItem(chosen);
      setIsUnboxing(false);

      // Launch celebration confetti
      confetti({
        particleCount: chosen.rarity === 'Legendary' ? 120 : 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3ba8a8', '#f9d74a', '#e54d30', '#7bb85c', '#4577b9'],
      });
    }, 1200);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-8 h-8 text-[#f9d74a]" />;
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-[#3ba8a8]" />;
      case 'PackageCheck':
        return <PackageCheck className="w-8 h-8 text-[#4577b9]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 text-[#7bb85c]" />;
      case 'Crown':
        return <Crown className="w-8 h-8 text-[#e54d30]" />;
      default:
        return <Gift className="w-8 h-8 text-[#f9d74a]" />;
    }
  };

  return (
    <section
      id="unboxing"
      className="bg-[#FF6B6B] py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden border-b border-[#E05252]"
    >
      {/* Polka Dot Background Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 2.5px, transparent 2.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <span className="bg-white/20 text-white font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/30 mb-4 inline-block backdrop-blur-sm">
          Nostalgic Unboxing Experience
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 uppercase tracking-tight">
          The Second Act
        </h2>

        {/* Quote & Story Box */}
        <div className="bg-white/10 border border-white/30 p-6 sm:p-8 rounded-3xl backdrop-blur-md mb-8 shadow-lg text-left sm:text-center">
          <p className="text-xl sm:text-2xl text-white font-bold mb-4 italic leading-snug">
            "Not just a toy, but a relic reimagined for the modern collector."
          </p>
          <p className="text-white/95 text-base sm:text-lg font-medium leading-relaxed">
            PicaYoyo is engineered for adults who never lost their sense of wonder. Using aerospace materials and nostalgic modular aesthetics, we've created a mystery box experience that unfolds the more you play.
          </p>
        </div>

        {/* Interactive Mystery Box Simulator */}
        <div className="bg-white border border-[#F0E6D9] rounded-3xl p-6 shadow-2xl text-[#2D2D2D]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-[#FF6B6B]" />
              <span className="font-extrabold text-base uppercase text-[#2D2D2D]">
                Vault Drop Surprise Simulator
              </span>
            </div>
            <span className="bg-[#FFD93D] text-[#2D2D2D] text-xs font-black px-3 py-1 rounded-full uppercase">
              1 Free Mystery Item in Every Drop
            </span>
          </div>

          {/* Unboxing Display Box */}
          <div className="bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-6 min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden mb-6">
            <AnimatePresence mode="wait">
              {isUnboxing ? (
                <motion.div
                  key="unboxing"
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 bg-[#FFD93D] rounded-2xl border-2 border-[#2D2D2D] flex items-center justify-center shadow-md mb-3">
                    <Gift className="w-10 h-10 text-[#2D2D2D] animate-bounce" />
                  </div>
                  <span className="text-sm font-black text-[#FF6B6B] uppercase animate-pulse">
                    Opening Vault Mystery Box...
                  </span>
                </motion.div>
              ) : unboxedItem ? (
                <motion.div
                  key="reward"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex flex-col items-center text-center max-w-md"
                >
                  {/* Rarity Pill */}
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full uppercase mb-3 text-white ${
                      unboxedItem.rarity === 'Legendary'
                        ? 'bg-[#FF6B6B] animate-pulse'
                        : unboxedItem.rarity === 'Rare'
                        ? 'bg-[#4D96FF]'
                        : 'bg-[#6BCB77]'
                    }`}
                  >
                    {unboxedItem.rarity} Drop!
                  </span>

                  <div
                    className="w-16 h-16 rounded-2xl border border-[#F0E6D9] flex items-center justify-center shadow-md mb-3 bg-white"
                  >
                    {renderIcon(unboxedItem.iconName)}
                  </div>

                  <h4 className="text-xl font-extrabold text-[#2D2D2D] mb-1">
                    {unboxedItem.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6D6D6D] font-medium mb-3">
                    {unboxedItem.description}
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#FFEEAD] text-[#D4A017] rounded-2xl border border-[#F0E6D9] flex items-center justify-center shadow-sm mb-3">
                    <Gift className="w-8 h-8 text-[#FF6B6B]" />
                  </div>
                  <h4 className="text-lg font-black text-[#2D2D2D] mb-1">
                    What's inside your Drop #003 package?
                  </h4>
                  <p className="text-xs text-[#6D6D6D] font-medium max-w-xs">
                    Click the button below to simulate unboxing a surprise bonus item included in your order!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Unbox Trigger Button */}
          <button
            onClick={handleUnbox}
            disabled={isUnboxing}
            className="bg-[#FFD93D] text-[#2D2D2D] font-black text-lg px-8 py-4 rounded-2xl shadow-[0_6px_0_#D4A017] hover:translate-y-1 hover:shadow-[0_3px_0_#D4A017] transition-all w-full uppercase tracking-tight cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${isUnboxing ? 'animate-spin' : ''}`} />
            <span>{unboxedItem ? 'Unbox Another Item' : 'Tap To Unbox Mystery Item'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
