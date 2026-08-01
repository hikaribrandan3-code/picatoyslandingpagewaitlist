import React, { useState, useEffect } from 'react';
import { Skull, Gamepad2, ArrowRight } from 'lucide-react';

/**
 * Desktop-only launch card for PICA TOYS: CLOSING TIME — the 3D zombie
 * survival FPS living at public/games/pica-zombies/. The game is a
 * self-contained fullscreen page (pointer lock, WASD, its own audio), so it
 * opens in a new tab rather than embedding in the landing flow.
 *
 * Same viewport gate as PicaCrossing: real media query, renders null on
 * mobile instead of hiding with CSS.
 */
function useDesktopViewport() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return desktop;
}

export const ZombiesTeaser: React.FC = () => {
  const desktop = useDesktopViewport();
  if (!desktop) return null;

  return (
    <section className="bg-[#FFF9F2] pb-16 sm:pb-20 px-4 sm:px-6 -mt-4">
      <a
        href="/games/pica-zombies/index.html"
        target="_blank"
        rel="noopener"
        className="clay clay-lg edge-yellow max-w-3xl mx-auto p-5 sm:p-6 flex items-center gap-5 cursor-pointer group"
        style={{ background: '#1a1626', textDecoration: 'none' }}
      >
        <div className="clay clay-coral clay-sm clay-tilt-l w-14 h-14 flex items-center justify-center shrink-0">
          <Skull className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="clay clay-yellow clay-sm px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#2D2D2D]">New</span>
            <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight text-[#FFF6EA] truncate">
              Pica Toys: Closing Time
            </h3>
          </div>
          <p className="text-sm font-bold text-[#b9aed4] truncate">
            3D zombie survival in the toy store after hours. Board the windows. Buy the walls. Feed The Grinder.
          </p>
        </div>
        <div className="clay clay-btn clay-green font-black text-sm px-5 py-3 uppercase whitespace-nowrap flex items-center gap-2 group-hover:scale-105 transition-transform">
          <Gamepad2 className="w-4 h-4" />
          <span>Play</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </a>
    </section>
  );
};
