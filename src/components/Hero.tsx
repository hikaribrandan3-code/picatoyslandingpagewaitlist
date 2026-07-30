import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Flame, RotateCw, Play, Star, ChevronRight, Zap } from 'lucide-react';
import { HERO_PRODUCT_IMAGE } from '../data';

interface HeroProps {
  onJoinWaitlist: () => void;
  onQuickPreorder: () => void;
  playSound: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onJoinWaitlist, onQuickPreorder, playSound }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState<'slow' | 'fast'>('fast');

  const handleSpinToggle = () => {
    playSound();
    setIsSpinning((prev) => !prev);
  };

  return (
    <section className="bg-[#FFF9F2] px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center overflow-hidden relative border-b border-[#F0E6D9]">
      {/* Abstract Background Accents */}
      <div className="absolute top-10 left-[-50px] w-64 h-64 bg-[#FFD93D] rounded-[40px] rotate-12 opacity-30 -z-10 blur-xl pointer-events-none" />
      <div className="absolute bottom-10 right-[-50px] w-72 h-72 bg-[#4D96FF] rounded-full opacity-20 -z-10 blur-2xl pointer-events-none" />

      {/* Top Scarcity Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFEEAD] rounded-full text-xs font-bold text-[#D4A017] uppercase tracking-widest mb-6 w-fit border border-[#F0E6D9]"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017] animate-pulse" />
        <span>Vault Drop #003 Live</span>
        <span className="bg-[#FF6B6B] text-white px-2 py-0.5 rounded-full font-black text-[10px] uppercase ml-1">
          18 Units Left
        </span>
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
        Engineered for adults, creators & collectors. A CNC 6061 aviation-aluminum responsive yoyo that splits into a dual-chamber herb grinder core.
      </p>

      {/* Visual Abstract Product Frame */}
      <div className="relative w-full max-w-sm sm:max-w-md mb-10 group">
        {/* Abstract Toy Decorative Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] bg-[#FFD93D] rounded-[40px] rotate-3 shadow-xl -z-10 transition-transform group-hover:rotate-6" />

        {/* Product Box Container */}
        <div className="relative bg-white border border-[#F0E6D9] rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden">
          {/* Top Badge Overlay */}
          <div className="absolute top-5 left-5 z-10 bg-[#FFD93D] text-[#2D2D2D] text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#FF6B6B] fill-current" />
            <span>Dual-Core Grinder</span>
          </div>

          {/* Spin Interactive Control Button */}
          <button
            onClick={handleSpinToggle}
            className="absolute top-5 right-5 z-10 bg-[#FF6B6B] hover:bg-[#E05252] text-white text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Stop Spin' : 'Test Spin'}</span>
          </button>

          {/* Main Showcase Image */}
          <div className="rounded-2xl border border-[#F0E6D9] overflow-hidden bg-[#FFF9F2] p-3 flex items-center justify-center min-h-[320px]">
            <motion.img
              src={HERO_PRODUCT_IMAGE}
              alt="PicaYoyo Main Product"
              className={`w-full h-auto object-cover rounded-xl transition-all duration-300 ${
                isSpinning ? (spinSpeed === 'fast' ? 'animate-spin-fast scale-105' : 'animate-spin-slow') : ''
              }`}
              animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
              transition={isSpinning ? { repeat: Infinity, duration: spinSpeed === 'fast' ? 0.8 : 3, ease: 'linear' } : { duration: 0.3 }}
            />
          </div>

          {/* Image Interactive Bar */}
          <div className="mt-3.5 pt-3 border-t border-[#F0E6D9] flex items-center justify-between text-xs font-bold text-[#6D6D6D]">
            <div className="flex items-center gap-1.5 text-[#4D96FF]">
              <ShieldCheck className="w-4 h-4" />
              <span>Aviation Grade Aluminum</span>
            </div>
            {isSpinning && (
              <span className="text-[#FF6B6B] font-black animate-pulse flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                Spinning at 8,200 RPM!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md mb-10">
        <button
          onClick={() => {
            playSound();
            onJoinWaitlist();
          }}
          className="bg-[#FF6B6B] text-white px-10 py-5 rounded-2xl font-black text-lg shadow-[0_8px_0_#E05252] hover:translate-y-1 hover:shadow-[0_4px_0_#E05252] transition-all w-full uppercase tracking-tight cursor-pointer flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-6 h-6 text-[#FFD93D] group-hover:rotate-12 transition-transform" />
          <span>JOIN THE INNER CIRCLE</span>
        </button>

        <button
          onClick={() => {
            playSound();
            onQuickPreorder();
          }}
          className="bg-[#2D2D2D] text-white px-8 py-5 rounded-2xl font-black text-base shadow-[0_8px_0_#1A1A1A] hover:translate-y-1 hover:shadow-[0_4px_0_#1A1A1A] transition-all w-full sm:w-auto uppercase tracking-tight cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <span>Reserve ($49)</span>
          <ChevronRight className="w-5 h-5 text-[#FFD93D]" />
        </button>
      </div>

      {/* Social Proof Star Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-[#F0E6D9] rounded-2xl px-6 py-3.5 shadow-sm">
        <div className="flex items-center gap-1 text-[#FFD93D]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-current text-[#FFD93D]" />
          ))}
        </div>
        <div className="text-xs sm:text-sm font-bold text-[#2D2D2D] text-center sm:text-left">
          <span className="font-black text-[#FF6B6B]">4.9 / 5.0 Rating</span> from 1,200+ verified trickers & collectors.
        </div>
      </div>
    </section>
  );
};
