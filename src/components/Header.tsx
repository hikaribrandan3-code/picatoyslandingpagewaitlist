import React, { useState } from 'react';
import { Sparkles, Gamepad2, Mail, FileBox, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenWaitlist: () => void;
}

const CONTACT_EMAIL = 'Hikaristudioai@gmail.com';

/** Shared shape for the centre nav pills, so all three stay the same size. */
const NAV_PILL =
  'clay clay-btn clay-sm font-black text-xs uppercase tracking-tight ' +
  'min-w-[116px] px-4 py-2 inline-flex items-center justify-center gap-1.5 cursor-pointer';

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

export const Header: React.FC<HeaderProps> = ({ onOpenWaitlist }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToArcade = () => scrollToId('arcade');
  const navigateToFiles = () => window.location.pathname = '/files';
  const scrollToFeatures = () => scrollToId('features');

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFF9F2] border-b-[3px] border-[#4D96FF] shadow-[0_5px_18px_rgba(77,150,255,0.2)]">
      {/* Main Nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo — wordmark only, no separate icon. Clicking goes home. */}
        <a href="/" className="flex items-center">
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
            Games (was Arcade) is lg-only: below that the standalone coral
            button on the right covers the same anchor, so showing both would
            be a duplicate link. Files (was FAQ) points at the Pica Butterfly
            section — its own anchor now, not the merged Features block. */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#features" className={NAV_PILL + ' clay-yellow clay-tilt-l'}>
            Features
          </a>
          <button onClick={navigateToFiles} className={NAV_PILL + ' clay-teal clay-tilt-r'}>
            <FileBox className="w-4 h-4" />
            Files
          </button>
          <button onClick={scrollToArcade} className={NAV_PILL + ' clay-coral clay-tilt-l hidden lg:inline-flex'}>
            <Gamepad2 className="w-4 h-4 text-[#FFD93D]" />
            Games
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

          <button
            onClick={onOpenWaitlist}
            className="hidden lg:flex clay clay-btn clay-green font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 uppercase items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD93D]" />
            <span>Join Waitlist</span>
          </button>

          {/* Mobile/tablet (<1024px): hamburger opens a dropdown with every
              nav item in one place, instead of a single standalone Arcade
              button competing for the same header row as Contact/Waitlist. */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="lg:hidden clay clay-btn clay-cream clay-sm p-2.5 flex items-center justify-center cursor-pointer"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden border-t-[3px] border-[#4D96FF] bg-[#FFF9F2] px-4 sm:px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { scrollToFeatures(); closeMenu(); }}
              className="clay clay-btn clay-yellow font-black text-xs uppercase px-4 py-3 flex items-center justify-center"
            >
              Features
            </button>
            <button
              onClick={() => { scrollToArcade(); closeMenu(); }}
              className="clay clay-btn clay-coral font-black text-xs uppercase px-4 py-3 flex items-center justify-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4 text-[#FFD93D]" />
              Games
            </button>
            <button
              onClick={() => { navigateToFiles(); closeMenu(); }}
              className="clay clay-btn clay-teal font-black text-xs uppercase px-4 py-3 flex items-center justify-center gap-1.5"
            >
              <FileBox className="w-4 h-4" />
              Files
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              onClick={closeMenu}
              className="clay clay-btn clay-cream font-black text-xs uppercase px-4 py-3 flex items-center justify-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-[#6D6D6D]" />
              Contact
            </a>
            <button
              onClick={() => { onOpenWaitlist(); closeMenu(); }}
              className="clay clay-btn clay-green font-black text-xs uppercase px-4 py-3 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#FFD93D]" />
              Join Waitlist
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
