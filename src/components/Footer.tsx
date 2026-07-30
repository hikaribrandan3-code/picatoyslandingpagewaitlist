import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface Props {
  playSound: () => void;
}

export const Footer: React.FC<Props> = ({ playSound }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    playSound();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-[#FFF9F2] border-t border-[#F0E6D9] text-[#2D2D2D] pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#FF6B6B] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-sm">
              P
            </div>
            <span className="text-2xl font-black text-[#2D2D2D] uppercase tracking-tight">PICA TOYS</span>
          </div>
          <p className="text-xs font-black uppercase text-[#2D2D2D] tracking-wide">© 2026 Pica Toys</p>
          <p className="text-xs font-medium text-[#6D6D6D] max-w-xs">
            Designed for trickers, creators, and collectors worldwide. Ages 18+.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
          <a href="#blueprint" className="hover:text-[#FF6B6B] transition-colors py-1">The Lab</a>
          <a href="#faq" className="hover:text-[#FF6B6B] transition-colors py-1">FAQ</a>
        </div>

        {/* Share */}
        <div className="md:col-span-2 flex flex-col justify-between items-start md:items-end gap-4">
          <button
            onClick={handleShare}
            title="Share Link"
            className="px-4 py-2.5 bg-white text-[#2D2D2D] border border-[#F0E6D9] rounded-xl shadow-sm hover:bg-[#FFEEAD] transition-all cursor-pointer flex items-center gap-2 font-bold text-xs uppercase"
          >
            {copied ? <Check className="w-4 h-4 text-[#6BCB77]" /> : <Share2 className="w-4 h-4 text-[#FF6B6B]" />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <p className="text-[10px] font-bold text-[#6D6D6D]">
            PicaYoyo is an independent, self-funded project. Not yet for sale.
          </p>
        </div>
      </div>
    </footer>
  );
};
