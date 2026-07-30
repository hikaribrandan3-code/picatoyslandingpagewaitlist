import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onOpenWaitlist: () => void;
  playSound: () => void;
}

export const StickyMobileBar: React.FC<Props> = ({ onOpenWaitlist, playSound }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F0E6D9] p-3 shadow-lg flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-[#FF6B6B] uppercase tracking-wider">Waitlist Open</span>
        <span className="text-sm font-black text-[#2D2D2D]">PicaYoyo — not for sale yet</span>
      </div>

      <button
        onClick={() => {
          playSound();
          onOpenWaitlist();
        }}
        className="bg-[#FF6B6B] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-[0_3px_0_#E05252] hover:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer uppercase shrink-0"
      >
        <Sparkles className="w-4 h-4 text-[#FFD93D]" />
        <span>Join Waitlist</span>
      </button>
    </div>
  );
};
