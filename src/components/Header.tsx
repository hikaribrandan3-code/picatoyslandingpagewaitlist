import React, { useState } from 'react';
import { ShoppingBag, Volume2, VolumeX, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onOpenWaitlist: () => void;
  onOpenCart: () => void;
  cartCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWaitlist,
  onOpenCart,
  cartCount,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  const announcements = [
    '🔥 DROP #003: ONLY 18 UNITS REMAINING IN THE VAULT',
    '⚡ FREE EXPRESS WORLDWIDE SHIPPING ON ORDERS $49+',
    '⭐ 4.9/5 RATED BY OVER 1,200+ TRICKERS & COLLECTORS',
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFF9F2] border-b border-[#F0E6D9] hard-shadow-sm">
      {/* Top Banner Ticker */}
      <div className="bg-[#FF6B6B] text-white text-xs font-bold py-1.5 px-4 text-center border-b border-[#E05252] flex items-center justify-between overflow-hidden">
        <div className="flex items-center justify-center gap-2 w-full mx-auto">
          <Flame className="w-4 h-4 text-[#FFD93D] animate-pulse shrink-0" />
          <span className="tracking-wide uppercase transition-all duration-300">
            {announcements[tickerIndex]}
          </span>
          <button
            onClick={() => setTickerIndex((prev) => (prev + 1) % announcements.length)}
            className="text-[10px] bg-[#2D2D2D] text-[#FFD93D] px-2.5 py-0.5 rounded-full border border-white/40 hover:bg-black cursor-pointer hidden sm:inline-block ml-2"
          >
            Next Announcement ›
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 bg-[#FF6B6B] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-[0_4px_0_#E05252] group-hover:rotate-6 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-[#2D2D2D] uppercase tracking-tight leading-none">
              PICA TOYS
            </span>
            <span className="text-[9px] font-bold text-[#FF6B6B] tracking-widest uppercase mt-0.5">
              The Yoyo With A Twist
            </span>
          </div>
        </a>

        {/* Center Quick Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-xs uppercase tracking-widest text-[#2D2D2D]">
          <a
            href="#features"
            className="hover:text-[#FF6B6B] transition-colors py-1"
          >
            Features
          </a>
          <a
            href="#blueprint"
            className="hover:text-[#FF6B6B] transition-colors py-1"
          >
            Blueprint
          </a>
          <a
            href="#unboxing"
            className="hover:text-[#FF6B6B] transition-colors py-1"
          >
            Mystery Box
          </a>
          <a
            href="#reviews"
            className="hover:text-[#FF6B6B] transition-colors py-1"
          >
            Reviews
          </a>
          <a
            href="#faq"
            className="hover:text-[#FF6B6B] transition-colors py-1"
          >
            FAQ
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Yoyo SFX' : 'Enable Yoyo SFX'}
            className="p-2 bg-white text-[#2D2D2D] rounded-xl border border-[#F0E6D9] hard-shadow-sm hover:bg-[#FFEEAD] transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#FF6B6B]" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#6D6D6D]" />
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative bg-[#2D2D2D] text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-tighter hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center gap-2"
            title="View Pre-order Bag"
          >
            <ShoppingBag className="w-4 h-4 text-[#FFD93D]" />
            <span>Cart ({cartCount})</span>
            {cartCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse" />
            )}
          </button>

          {/* Join Waitlist Primary Plastic Button */}
          <button
            onClick={onOpenWaitlist}
            className="plastic-button bg-[#FF6B6B] text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-2xl border-2 border-[#E05252] uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD93D]" />
            <span>Join Waitlist</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
