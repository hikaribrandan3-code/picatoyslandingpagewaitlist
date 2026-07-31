import React from 'react';
import { Sparkles, Gamepad2, Mail } from 'lucide-react';

interface HeaderProps {
  onOpenWaitlist: () => void;
}

const CONTACT_EMAIL = 'Hikaristudioai@gmail.com';

/** Shared shape for the centre nav pills, so all three stay the same size. */
const NAV_PILL =
  'clay clay-btn clay-sm font-black text-xs uppercase tracking-tight ' +
  'min-w-[116px] px-4 py-2 inline-flex items-center justify-center gap-1.5 cursor-pointer';

export const Header: React.FC<HeaderProps> = ({ onOpenWaitlist }) => {
  const scrollToArcade = () => {
    const el = document.getElementById('arcade');
    if (el) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFF9F2] border-b-[3px] border-[#4D96FF] shadow-[0_5px_18px_rgba(77,150,255,0.2)]">
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
            <span className="text-[8px] sm:text-[9px] font-bold text-[#FF6B6B] tracking-widest uppercase mt-0.5 transform-none">
              Toys With A Twist
            </span>
          </div>
        </a>

        {/* Center Quick Navigation Links (Desktop).
            No Arcade link here on purpose: Flappy Picas is a portrait,
            one-thumb game that only mounts on mobile widths, so on desktop
            this would be an anchor to a section that does not exist. No
            separate Blueprint link either — that section merged into
            Features, so #blueprint no longer exists as its own anchor. */}
        {/* All three pills share a min-width so the row reads as a set rather
            than as three differently-sized buttons. Arcade is lg-only: below
            that the standalone coral Arcade button on the right covers it, and
            showing both would be a duplicate link to the same anchor. */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#features" className={NAV_PILL + ' clay-yellow clay-tilt-l'}>
            Features
          </a>
          <a href="#faq" className={NAV_PILL + ' clay-teal clay-tilt-r'}>
            FAQ
          </a>
          <button onClick={scrollToArcade} className={NAV_PILL + ' clay-coral clay-tilt-l hidden lg:inline-flex'}>
            <Gamepad2 className="w-4 h-4 text-[#FFD93D]" />
            Arcade
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop: contact button, sits beside the waitlist CTA. Breakpoint
              matches FlappyPicas' own mobile gate (max-width: 1023px) so this
              swaps in exactly where the game stops existing. */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            title="Contact Us"
            className="hidden lg:flex clay clay-cream clay-btn clay-sm px-4 py-2.5 items-center gap-1.5 font-black text-xs uppercase cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#6D6D6D]" />
            <span>Contact</span>
          </a>

          {/* Mobile/tablet (<1024px): routes straight to the Pica Arcade game.
              Desktop (>=1024px): routes to the waitlist form — the game
              doesn't mount there. */}
          <button
            onClick={scrollToArcade}
            className="lg:hidden clay clay-btn clay-coral font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-[#FFD93D]" />
            <span>Arcade</span>
          </button>

          <button
            onClick={onOpenWaitlist}
            className="hidden lg:flex clay clay-btn clay-coral font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 uppercase items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD93D]" />
            <span>Join Waitlist</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
