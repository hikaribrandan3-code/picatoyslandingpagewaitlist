import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { HERO_PRODUCT_IMAGE } from '../data';

interface HeroProps {
  onJoinWaitlist: () => void;
  playSound: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onJoinWaitlist, playSound }) => {
  return (
    <section className="bg-[#FFF9F2] px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center overflow-hidden relative border-b border-[#F0E6D9]">
      {/* Rolled-clay offcuts in the background. Uneven radii + blur so they
          read as scraps left on the bench, not as geometric blobs. */}
      <div className="absolute top-10 left-[-60px] w-64 h-64 bg-[#FFD93D] rounded-[70%_30%_58%_42%/45%_62%_38%_55%] rotate-12 opacity-30 -z-10 blur-xl pointer-events-none" />
      <div className="absolute bottom-10 right-[-60px] w-72 h-72 bg-[#4D96FF] rounded-[38%_62%_45%_55%/60%_42%_58%_40%] -rotate-6 opacity-20 -z-10 blur-2xl pointer-events-none" />
      <div className="absolute top-1/3 right-[8%] w-24 h-24 bg-[#6BCB77] rounded-[62%_38%_50%_50%/48%_58%_42%_52%] rotate-[18deg] opacity-20 -z-10 blur-lg pointer-events-none hidden lg:block" />

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
        {/* Yellow slab behind the frame — the second layer of clay. */}
        <div className="clay clay-yellow clay-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] -z-10 [--clay-tilt:3deg] transition-transform group-hover:[--clay-tilt:6.5deg]" />

        {/* Product Box Container */}
        <div className="clay clay-cream clay-lg relative p-4 sm:p-5">
          {/* Badge. In flow on mobile, overlaid on the frame from sm: up. */}
          <div className="mb-3 sm:mb-0 sm:absolute sm:top-5 sm:left-5 sm:z-10">
            <div className="clay clay-yellow clay-sm text-[10px] sm:text-xs font-black px-3 sm:px-4 py-2 uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D94F4F] shrink-0" />
              <span>Dual-Chamber Yoyo</span>
            </div>
          </div>

          {/* Main Showcase Image */}
          <div className="clay-well clay-cream p-3 flex items-center justify-center min-h-[320px] overflow-hidden">
            <img
              src={HERO_PRODUCT_IMAGE}
              alt="A translucent teal PicaYoyo standing on a desk"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>

          {/* Image Interactive Bar */}
          <div className="mt-3.5 pt-3 border-t-[3px] border-[#E3CDB0] flex items-center justify-between text-xs font-bold text-[#6D6D6D]">
            <div className="flex items-center gap-1.5 text-[#2B62D9]">
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
