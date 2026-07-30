import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Wrench } from 'lucide-react';

interface HeaderProps {
  onOpenWaitlist: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWaitlist, soundEnabled, setSoundEnabled }) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  const announcements = [
    '🔧 DESIGNED FROM SCRATCH — NOT A CLONE OF ANY OTHER PRODUCT',
    '📐 EVERY SPEC ON THIS PAGE IS CAD-VERIFIED, NOT ESTIMATED',
    '🎨 VOTE ON YOUR FAVORITE COLOR IN THE BLUEPRINT SECTION',
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFF9F2] border-b-[3px] border-[#E3CDB0] shadow-[0_5px_18px_rgba(200,172,138,0.3)]">
      {/* Top Banner Ticker */}
      <div className="bg-[#FF6B6B] text-white text-xs font-bold py-1.5 px-4 text-center border-b border-[#E05252] flex items-center justify-between overflow-hidden">
        <div className="flex items-center justify-center gap-2 w-full mx-auto">
          <Wrench className="w-4 h-4 text-[#FFD93D] shrink-0" />
          <span className="tracking-wide uppercase transition-all duration-300">
            {announcements[tickerIndex]}
          </span>
          <button
            onClick={() => setTickerIndex((prev) => (prev + 1) % announcements.length)}
            className="clay clay-ink clay-btn clay-sm text-[10px] font-black px-2.5 py-0.5 hidden sm:inline-block ml-2"
          >
            Next ›
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo — wordmark only, no separate icon */}
        <a href="#" className="flex items-center">
          <div className="flex flex-col">
            {/* Toys-R-Us style rainbow wordmark. Letters colored individually
                via the .rainbow-* classes rather than one gradient on the
                whole string, so each letter reads as its own solid hue. */}
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none toys-r-us-text">
              <span className="rainbow-p">P</span>
              <span className="rainbow-i">I</span>
              <span className="rainbow-c">C</span>
              <span className="rainbow-a">A</span>
              <span> </span>
              <span className="rainbow-t">T</span>
              <span className="rainbow-o">O</span>
              <span className="rainbow-y">Y</span>
              <span className="rainbow-s">S</span>
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-[#FF6B6B] tracking-widest uppercase mt-0.5">
              The Yoyo With A Twist
            </span>
          </div>
        </a>

        {/* Center Quick Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-xs uppercase tracking-widest text-[#2D2D2D]">
          <a href="#features" className="hover:text-[#FF6B6B] transition-colors py-1">Features</a>
          <a href="#blueprint" className="hover:text-[#FF6B6B] transition-colors py-1">Blueprint</a>
          <a href="#arcade" className="hover:text-[#FF6B6B] transition-colors py-1 flex items-center gap-1 font-bold text-[#FF6B6B]">
            <span>Arcade</span>
            <span className="clay clay-yellow clay-sm clay-tilt-r text-[9px] px-1.5 py-0.5 font-black">NEW</span>
          </a>
          <a href="#faq" className="hover:text-[#FF6B6B] transition-colors py-1">FAQ</a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Yoyo SFX' : 'Enable Yoyo SFX'}
            className="clay clay-cream clay-btn clay-sm p-2"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#FF6B6B]" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#6D6D6D]" />
            )}
          </button>

          <button
            onClick={onOpenWaitlist}
            className="clay clay-btn clay-coral font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD93D]" />
            <span>Join Waitlist</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
