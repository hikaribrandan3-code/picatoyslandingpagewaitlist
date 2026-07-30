import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, RotateCw } from 'lucide-react';
import { HERO_PRODUCT_IMAGE } from '../data';

interface HeroProps {
  onJoinWaitlist: () => void;
  playSound: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onJoinWaitlist, playSound }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpinToggle = () => {
    playSound();
    setIsSpinning((prev) => !prev);
  };

  return (
    <section className="bg-[#FFF9F2] px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center overflow-hidden relative border-b border-[#F0E6D9]">
      {/* Abstract Background Accents */}
      <div className="absolute top-10 left-[-50px] w-64 h-64 bg-[#FFD93D] rounded-[40px] rotate-12 opacity-30 -z-10 blur-xl pointer-events-none" />
      <div className="absolute bottom-10 right-[-50px] w-72 h-72 bg-[#4D96FF] rounded-full opacity-20 -z-10 blur-2xl pointer-events-none" />

      {/* Top Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay clay-yellow inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest mb-6 w-fit"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017] animate-pulse" />
        <span>Waitlist open · not yet for sale</span>
      </motion.div>

      {/* Main Heading Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4 max-w-4xl"
      >
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-[0.92] mb-4 tracking-tight uppercase text-[#2D2D2D]">
          Spin. <span className="text-[#FF6B6B]">Twist.</span> Discover.
        </h1>
        <p className="text-2xl sm:text-3xl font-black text-[#4D96FF] mt-3 tracking-tight">
          PICA TOYS — The Yoyo With A Twist.
        </p>
      </motion.div>

      <p className="max-w-xl text-base sm:text-lg text-[#6D6D6D] font-medium leading-relaxed mb-10">
        A full-size, 3D-printed PETG yoyo. Both ends unscrew in three quarters of a turn to reveal two sealed chambers inside — then it goes right back to being a yoyo.
      </p>

      {/* Visual Abstract Product Frame */}
      <div className="relative w-full max-w-sm sm:max-w-md mb-10 group">
        {/* Abstract Toy Decorative Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] bg-[#FFD93D] rounded-[40px] rotate-3 shadow-xl -z-10 transition-transform group-hover:rotate-6" />

        {/* Product Box Container */}
        <div className="relative bg-white border border-[#F0E6D9] rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden">
          {/* Top Badge Overlay */}
          <div className="clay clay-yellow absolute top-5 left-5 z-10 text-xs font-black px-4 py-2 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF6B6B]" />
            <span>Dual-Chamber Yoyo</span>
          </div>

          {/* Spin Interactive Control Button */}
          <button
            onClick={handleSpinToggle}
            className="clay clay-btn clay-coral absolute top-5 right-5 z-10 text-xs font-black px-4 py-2 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Stop Spin' : 'Test Spin'}</span>
          </button>

          {/* Main Showcase Image */}
          <div className="rounded-2xl border border-[#F0E6D9] overflow-hidden bg-[#FFF9F2] p-3 flex items-center justify-center min-h-[320px]">
            <motion.img
              src={HERO_PRODUCT_IMAGE}
              alt="A translucent teal PicaYoyo standing on a desk"
              className="w-full h-auto object-cover rounded-xl"
              animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
              transition={isSpinning ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0.3 }}
            />
          </div>

          {/* Image Interactive Bar */}
          <div className="mt-3.5 pt-3 border-t border-[#F0E6D9] flex items-center justify-between text-xs font-bold text-[#6D6D6D]">
            <div className="flex items-center gap-1.5 text-[#4D96FF]">
              <ShieldCheck className="w-4 h-4" />
              <span>3D-Printed PETG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <div className="flex items-center justify-center w-full max-w-md mb-10">
        <button
          onClick={() => {
            playSound();
            onJoinWaitlist();
          }}
          className="clay clay-btn clay-coral px-10 py-5 font-black text-lg w-full uppercase tracking-tight cursor-pointer flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-6 h-6 text-[#FFD93D] group-hover:rotate-12 transition-transform" />
          <span>JOIN THE WAITLIST</span>
        </button>
      </div>

      {/* Honest status bar (was a fake rating) */}
      <div className="clay clay-cream flex flex-col sm:flex-row items-center gap-2 px-6 py-4">
        <div className="text-xs sm:text-sm font-bold text-[#2D2D2D] text-center sm:text-left">
          Designed from scratch, fully CAD-verified. <span className="font-black text-[#FF6B6B]">First physical print coming next.</span>
        </div>
      </div>
    </section>
  );
};
