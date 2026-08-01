import React, { useState, useEffect } from 'react';
import { Skull, Gamepad2, ArrowRight, Users, Sparkles } from 'lucide-react';

/**
 * Flagship desktop arcade card for PICA TOYS: CLOSING TIME — the 3D zombie
 * survival FPS living at public/games/pica-zombies/. The game is a
 * self-contained fullscreen page (pointer lock, WASD, its own audio), so it
 * opens in a new tab rather than embedding in the landing flow — pointer
 * lock inside an iframe is unreliable across browsers, a new tab isn't.
 *
 * This is the primary arcade entry on desktop now (owns #arcade, the
 * header's Arcade link lands here). PicaCrossing is the secondary "also
 * try" card rendered right below it.
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
    <section id="arcade" className="relative overflow-hidden border-y-[3px] border-[#D94F4F] bg-[#140f1e] px-6 py-14">
      {/* faint clay-dot texture, matches the rest of the site's section treatments */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="clay clay-coral clay-sm clay-tilt-l px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Pica Arcade — Desktop
          </span>
        </div>

        <a
          href="/games/pica-zombies/index.html"
          target="_blank"
          rel="noopener"
          className="clay clay-lg edge-coral clay-lift group relative block overflow-hidden p-2"
          style={{ background: 'linear-gradient(160deg, #241a33, #140f1e)' }}
        >
          {/* cover art, framed inside the clay border like a poster */}
          <div className="relative overflow-hidden rounded-[calc(var(--clay-r-lg)-8px)]">
            <img
              src="/games/pica-zombies/media/cover.png"
              alt="Pica Toys: Closing Time — the storefront at night, zombies at the barricades"
              className="aspect-[16/8] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140f1e] via-[#140f1e]/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#140f1e]/70 via-transparent to-transparent" />

            {/* play button, centered, pops on hover */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="clay clay-btn clay-green clay-pop flex items-center gap-2 px-7 py-4 text-lg font-black uppercase tracking-tight text-white shadow-2xl transition-transform group-hover:scale-110">
                <Gamepad2 className="h-5 w-5" />
                Clock In
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* copy, bottom-left over the fade */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="clay clay-yellow clay-sm px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#2D2D2D]">
                  New
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border-2 border-white/25 bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
                  <Users className="h-3 w-3" /> 3D FPS · Zombie Survival
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_0_#000] sm:text-4xl">
                Pica Toys: Closing Time
              </h3>
              <p className="max-w-xl text-sm font-bold text-white/70 sm:text-base">
                The store locked its doors at midnight. Board the windows, buy your way deeper in,
                and feed <span className="text-[#FFD93D]">The Grinder</span> — round after round, the horde gets worse.
              </p>
            </div>
          </div>
        </a>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/40">
          <Sparkles className="h-3.5 w-3.5" />
          WASD + mouse · opens fullscreen in a new tab
        </div>
      </div>
    </section>
  );
};
