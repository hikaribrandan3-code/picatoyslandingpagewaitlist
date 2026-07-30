import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onOpenWaitlist: () => void;
  playSound: () => void;
}

export const StickyMobileBar: React.FC<Props> = ({ onOpenWaitlist, playSound }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF6EA] border-t-[3px] border-[#E3CDB0] p-3 shadow-[0_-5px_20px_rgba(200,172,138,0.35)] flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-[#FF6B6B] uppercase tracking-wider">Waitlist Open</span>
        <span className="text-sm font-black text-[#2D2D2D]">PicaYoyo — not for sale yet</span>
      </div>

      <button
        onClick={() => {
          playSound();
          onOpenWaitlist();
        }}
        className="clay clay-coral clay-btn clay-sm font-black text-xs px-4 py-2.5 flex items-center gap-1 uppercase shrink-0"
      >
        <Sparkles className="w-4 h-4 text-[#FFD93D]" />
        <span>Join Waitlist</span>
      </button>
    </div>
  );
};
