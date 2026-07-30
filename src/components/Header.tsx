import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenWaitlist: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWaitlist, soundEnabled, setSoundEnabled }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFF9F2] border-b-[3px] border-[#E3CDB0] shadow-[0_5px_18px_rgba(200,172,138,0.3)]">
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

        {/* Center Quick Navigation Links (Desktop).
            No Arcade link here on purpose: Flappy Picas is a portrait,
            one-thumb game that only mounts on mobile widths, so on desktop
            this would be an anchor to a section that does not exist. */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-xs uppercase tracking-widest text-[#2D2D2D]">
          <a href="#features" className="hover:text-[#FF6B6B] transition-colors py-1">Features</a>
          <a href="#blueprint" className="hover:text-[#FF6B6B] transition-colors py-1">Blueprint</a>
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
