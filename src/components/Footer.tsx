import React, { useState } from 'react';
import { Share2, Check, Mail, Instagram, TrendingUp } from 'lucide-react';

interface Props {
  playSound: () => void;
}

const CONTACT_EMAIL = 'Hikaristudioai@gmail.com';

export const Footer: React.FC<Props> = ({ playSound }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    playSound();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-[#FFF9F2] border-t-[3px] border-[#FF6B6B] text-[#2D2D2D] pb-8">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Info — same rainbow letter-by-letter wordmark as the header,
            no separate logo mark. */}
        <div className="space-y-3">
          <span className="text-2xl font-black uppercase tracking-tight leading-none toys-r-us-text">
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
          <p className="text-xs font-black uppercase text-[#2D2D2D] tracking-wide">© 2026 Pica Toys</p>
          <p className="text-xs font-medium text-[#6D6D6D] max-w-xs">
            Designed for trickers, creators, and collectors worldwide. Ages 18+.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
          <a href="#features" className="hover:text-[#FF6B6B] transition-colors py-1">The Lab</a>
          <a href="#faq" className="hover:text-[#FF6B6B] transition-colors py-1">FAQ</a>
          <a
            href="https://instagram.com/getpicatoys"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF6B6B] transition-colors py-1 flex items-center gap-1"
          >
            <Instagram className="w-3.5 h-3.5" />
            Instagram
          </a>
          <a
            href="https://tiktok.com/@getpicatoys"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF6B6B] transition-colors py-1 flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            TikTok
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="col-span-2 flex items-center gap-1.5 hover:text-[#FF6B6B] transition-colors py-1 normal-case tracking-normal font-medium text-[#6D6D6D]"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>{CONTACT_EMAIL}</span>
          </a>
        </div>

        {/* Share */}
        <div className="md:col-span-2 flex flex-col justify-between items-start md:items-end gap-4">
          <button
            onClick={handleShare}
            title="Share Link"
            className="clay clay-cream clay-btn clay-sm px-4 py-2.5 flex items-center gap-2 font-bold text-xs uppercase"
          >
            {copied ? <Check className="w-4 h-4 text-[#3E9648]" /> : <Share2 className="w-4 h-4 text-[#D94F4F]" />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <p className="text-[10px] font-bold text-[#6D6D6D]">
            Pica Yoyo is an independent, self-funded project. Not yet for sale.
          </p>
        </div>
      </div>
    </footer>
  );
};
