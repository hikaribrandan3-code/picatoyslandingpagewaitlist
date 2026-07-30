import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Instagram } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

/** Lucide has no TikTok mark, so this is a hand-drawn equivalent kept in
 * the same stroke/style family as the imported lucide icons around it. */
const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 5.82c-.9-.8-1.46-1.94-1.56-3.2h-3.09v13.44a2.6 2.6 0 1 1-1.84-2.49v-3.14a5.87 5.87 0 0 0-.76-.05 5.83 5.83 0 1 0 5.83 5.83V9.4a7.35 7.35 0 0 0 4.3 1.38V7.68a4.28 4.28 0 0 1-2.88-1.86z" />
  </svg>
);

const MOBILE_SLIDES = [
  { src: '/yoyo-hero-box.jpg',  alt: 'Pica Yoyo product box — a yoyo grinder' },
  { src: '/yoyo-clear.jpg',     alt: 'Clear Pica Yoyo with Pica Toys logo' },
  { src: '/yoyo-yellow.jpg',    alt: 'Yellow Pica Yoyo' },
  { src: '/yoyo-stacked.jpg',   alt: 'All Pica Yoyo colors stacked' },
  { src: '/yoyo-green.jpg',     alt: 'Green Pica Yoyo' },
];

/* The 3D viewer pulls in three.js, so it is code-split AND gated on a
   real desktop viewport check. A CSS-only `hidden lg:block` would still
   mount the component on a phone and download the chunk with it. */
const YoyoViewer3D = lazy(() => import('./YoyoViewer3D'));

/** True only on pointer-precise desktop widths. */
function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return desktop;
}

/** Manual swipe/arrow carousel shown on mobile in place of the single hero shot. */
function MobileCarousel() {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setIdx((i) => (i - 1 + MOBILE_SLIDES.length) % MOBILE_SLIDES.length);
  const next = () => setIdx((i) => (i + 1) % MOBILE_SLIDES.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  const slide = MOBILE_SLIDES[idx];

  return (
    <div
      className="flex flex-col items-center gap-3 overflow-hidden rounded-xl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Image area — pure white so product photos blend in */}
      <div className="relative w-full bg-white rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className="w-full max-h-[300px] object-contain"
          loading="eager"
        />

        {/* Left arrow */}
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 -translate-y-1/2 clay clay-cream clay-btn clay-sm p-1.5 opacity-90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Right arrow */}
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 -translate-y-1/2 clay clay-cream clay-btn clay-sm p-1.5 opacity-90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-1.5">
        {MOBILE_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === idx ? 'w-5 bg-[#FF6B6B]' : 'w-2 bg-[#E3CDB0]'}`}
          />
        ))}
      </div>
    </div>
  );
}

interface HeroProps {
  onJoinWaitlist: () => void;
  playSound: () => void;
  selectedColorId?: string;
}

export const Hero: React.FC<HeroProps> = ({ onJoinWaitlist, playSound, selectedColorId = 'clear' }) => {
  const desktop = useDesktop();
  const timeLeft = useCountdown();

  return (
    <section className="bg-[#FFF9F2] px-4 sm:px-6 py-12 sm:py-20 lg:py-10 flex flex-col items-center text-center overflow-hidden relative border-b-[3px] border-[#248383]">
      {/* Rolled-clay offcuts in the background. Uneven radii + blur so they
          read as scraps left on the bench, not as geometric blobs. */}
      <div className="absolute top-10 left-[-60px] w-64 h-64 bg-[#FFD93D] rounded-[70%_30%_58%_42%/45%_62%_38%_55%] rotate-12 opacity-30 -z-10 blur-xl pointer-events-none" />
      <div className="absolute bottom-10 right-[-60px] w-72 h-72 bg-[#4D96FF] rounded-[38%_62%_45%_55%/60%_42%_58%_40%] -rotate-6 opacity-20 -z-10 blur-2xl pointer-events-none" />
      <div className="absolute top-1/3 right-[8%] w-24 h-24 bg-[#6BCB77] rounded-[62%_38%_50%_50%/48%_58%_42%_52%] rotate-[18deg] opacity-20 -z-10 blur-lg pointer-events-none hidden lg:block" />

      {/* Layout: plain flex-column stack on mobile (unchanged), two-column
          grid on desktop (.hero-grid, src/index.css) so the CTA sits
          beside the media instead of requiring a scroll past it. DOM
          order stays mobile-first (descr, media, cta, status); the grid
          areas reposition on lg without touching that order. */}
      <div className="w-full flex flex-col items-center hero-grid lg:w-full lg:max-w-6xl lg:mx-auto">
        {/* Product Descriptor & Tagline. Mobile keeps the original single-line
            title untouched. Desktop (lg:) gets a bigger standalone "Pica Yoyo"
            wordmark, a diagonal drop-sticker badge, and a real countdown pill
            (useCountdown — same LAUNCH_TARGET as the countdown section further
            down the page, so the two never disagree). */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hero-descr relative text-center mb-6 lg:mb-0 lg:text-left"
        >
          <span className="hidden lg:inline-block clay clay-coral clay-sm absolute -top-7 right-6 rotate-12 px-4 py-2 text-center text-[11px] font-black uppercase leading-tight tracking-wide">
            Limited<br />First Drop
          </span>

          <h2 className="lg:hidden text-2xl sm:text-4xl font-black text-[#2D2D2D] uppercase tracking-tight mb-3">
            Pica Yoyo | 3D-Printed Yoyo Grinder
          </h2>

          <h2 className="hidden lg:block text-6xl font-black text-[#2D2D2D] uppercase tracking-tight leading-none mb-2">
            Pica Yoyo
          </h2>
          <p className="hidden lg:block text-xl font-bold text-[#2D2D2D] normal-case mb-4">
            3D-Printed Yoyo Grinder
          </p>

          {/* Digital/LED-style readout: monospace tabular digits with a glow,
              on the dark clay-ink fill, instead of a plain text pill. */}
          <div className="hidden lg:inline-flex clay clay-ink clay-sm items-center gap-3 px-5 py-2.5 mb-2">
            <span
              className="font-mono text-3xl font-black leading-none tabular-nums text-[#FF3B3B]"
              style={{ textShadow: '0 0 10px rgba(255,59,59,0.65)' }}
            >
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[11px] font-black uppercase leading-tight tracking-widest text-white/80">
              Days to<br />First Drop
            </span>
          </div>
        </motion.div>

        {/* Visual Product Hero */}
        <div className="hero-media relative w-full max-w-sm sm:max-w-md lg:max-w-none mb-8 lg:mb-0 group">
          {/* Yellow slab behind the frame — the second layer of clay. */}
          <div className="clay clay-yellow clay-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] -z-10 [--clay-tilt:3deg] transition-transform group-hover:[--clay-tilt:6.5deg]" />

          {/* Product Box Container */}
          <div className="clay clay-cream edge-yellow clay-lg relative p-4 sm:p-5">
            {/* Desktop gets the live CAD model; mobile keeps the product
                shot so a phone never pays for three.js. */}
            {desktop ? (
              <Suspense
                fallback={
                  <div className="clay-well clay-cream flex min-h-[420px] items-center justify-center bg-white">
                    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E3CDB0] border-t-[#FF6B6B]" />
                  </div>
                }
              >
                <YoyoViewer3D colorId={selectedColorId} />
              </Suspense>
            ) : (
              <MobileCarousel />
            )}
          </div>
        </div>

        {/* Main CTA */}
        <div className="hero-cta flex items-center justify-center lg:justify-start w-full max-w-md lg:max-w-none mb-10 lg:mb-6">
          <button
            onClick={() => {
              playSound();
              onJoinWaitlist();
            }}
            className="clay clay-btn clay-coral px-10 py-5 font-black text-lg w-full uppercase tracking-tight cursor-pointer flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-6 h-6 text-[#FFD93D] group-hover:rotate-12 transition-transform" />
            <span className="lg:hidden">JOIN THE WAITLIST</span>
            <span className="hidden lg:inline">CLAIM YOUR SPOT</span>
          </button>
        </div>

        {/* Honest status bar (was a fake rating). The "CAD-verified, built
            from scratch" claim already gets proven twice further down the
            page (Engineering Proof panel, builder quote) — this slot's job
            is the hook, not a third repeat of the same trust line.
            Mobile keeps the plain "First run" line. Desktop swaps it for a
            "seen on TikTok/IG" badge — the countdown pill above already
            carries the date, so repeating it here read as dead space next
            to the sticker/countdown/CTA stack. */}
        <div className="hero-status lg:hidden clay clay-cream flex flex-col sm:flex-row items-center gap-2 px-6 py-4">
          <div className="text-xs sm:text-sm font-bold text-[#2D2D2D] text-center sm:text-left">
            <span className="font-black text-[#FF6B6B]">First run: Q4 2026.</span>
          </div>
        </div>

        <div className="hero-status hidden lg:inline-flex clay clay-cream items-center gap-2.5 px-5 py-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">
            Viral Product!
          </span>
          <span className="text-[11px] font-bold text-[#6D6D6D]">as seen on</span>
          <span className="flex items-center gap-1.5">
            <TikTokIcon className="w-4 h-4 text-[#2D2D2D]" />
            <Instagram className="w-4 h-4 text-[#D94F4F]" />
          </span>
        </div>
      </div>
    </section>
  );
};
