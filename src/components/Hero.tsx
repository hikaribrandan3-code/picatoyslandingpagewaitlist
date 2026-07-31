import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Volume2, VolumeX, Play, Pause, Instagram, Music, PencilRuler, Ruler } from 'lucide-react';
import { COLOR_OPTIONS, SPECS } from '../data';

/** Five-point starburst — "NEW!" reads more toy-aisle than a plain pill. */
function Starburst({ children, className = '', size = 68 }: { children: React.ReactNode; className?: string; size?: number }) {
  return (
    <div className={`flex items-center justify-center pointer-events-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.22))' }}>
        <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="#FF3B3B" />
      </svg>
      <span className="relative text-white font-black text-[13px] uppercase italic tracking-tight" style={{ transform: 'rotate(-8deg)' }}>
        {children}
      </span>
    </div>
  );
}

/** TikTok-style video player with clay frame. A big center button owns the
    one-time "unlock sound" gesture browsers require for unmuted audio; the
    small bottom-right controls only handle play/pause and mute afterward
    so they never have to double as the sound-unlock action. */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const unlockSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
    }
    setIsMuted(false);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="clay clay-cream edge-yellow clay-lg p-3 relative w-full" style={{ maxWidth: '100%' }}>
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
        <video ref={videoRef} src="/hero-video.mp4" autoPlay muted={isMuted} loop playsInline className="w-full h-full object-cover" />

        {/* Big center button — the sole "unlock sound" gesture. Disappears
            once tapped so it never fights the corner controls. */}
        {isMuted && (
          <button
            onClick={unlockSound}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/15 hover:bg-black/25 transition-colors z-10"
            aria-label="Play with sound"
          >
            <span className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
              <Volume2 className="w-7 h-7 text-[#2D2D2D]" />
            </span>
            <span className="bg-white/90 text-[#2D2D2D] text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-full">
              Tap for Sound
            </span>
          </button>
        )}

        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button onClick={togglePlay} className="bg-white/80 hover:bg-white rounded-full p-2 transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black" />}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="bg-white/80 hover:bg-white rounded-full p-2 transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX className="w-4 h-4 text-black" /> : <Volume2 className="w-4 h-4 text-black" />}
          </button>
        </div>
      </div>
    </div>
  );
}

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

/** Desktop-only real-photo gallery, shown side-by-side with the CAD viewer
    inside the same clay frame (not a separate floating block below it) so
    it reads as the CAD's equal partner, not an afterthought. The mobile
    hero already carries these shots as its whole product visual
    (MobileCarousel, above); desktop swaps the same photo entirely for the
    interactive CAD viewer, so this was the one place on desktop nobody
    ever saw them — real printed parts in every color, not just the CAD
    render. Own thumbnail-driven state, independent of the CAD color
    swatches (the two lists don't map 1:1: no yellow/glow CAD swatch has a
    matching photo yet), so picking a thumbnail here never disagrees with
    what the 3D model is doing. */
function DesktopColorGallery() {
  const [idx, setIdx] = useState(0);
  const slide = MOBILE_SLIDES[idx];

  return (
    <div className="hidden lg:flex flex-col items-center w-full">
      <span className="text-[11px] font-black uppercase tracking-widest text-[#6D6D6D] mb-3">
        Real Photos · Every Color
      </span>

      <div className="w-full bg-white rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 290 }}>
        <img key={slide.src} src={slide.src} alt={slide.alt} className="w-full max-h-[290px] object-contain" loading="lazy" />
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        {MOBILE_SLIDES.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setIdx(i)}
            aria-label={s.alt}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
              i === idx ? 'border-[#2D2D2D] scale-105' : 'border-[#E3CDB0] opacity-75 hover:opacity-100'
            }`}
          >
            <img src={s.src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

interface HeroProps {
  onJoinWaitlist: () => void;
  playSound: () => void;
  selectedColorId?: string;
  setSelectedColorId?: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onJoinWaitlist, playSound, selectedColorId = 'clear', setSelectedColorId }) => {
  const desktop = useDesktop();

  return (
    <section className="bg-[#FFF9F2] px-4 sm:px-6 py-12 sm:py-20 lg:py-14 flex flex-col items-center text-center overflow-hidden relative border-b-[3px] border-[#248383]">
      {/* Rolled-clay offcuts in the background. Uneven radii + blur so they
          read as scraps left on the bench, not as geometric blobs. */}
      <div className="absolute top-10 left-[-60px] w-64 h-64 bg-[#FFD93D] rounded-[70%_30%_58%_42%/45%_62%_38%_55%] rotate-12 opacity-30 -z-10 blur-xl pointer-events-none" />
      <div className="absolute bottom-10 right-[-60px] w-72 h-72 bg-[#4D96FF] rounded-[38%_62%_45%_55%/60%_42%_58%_40%] -rotate-6 opacity-20 -z-10 blur-2xl pointer-events-none" />
      <div className="absolute top-1/3 right-[8%] w-24 h-24 bg-[#6BCB77] rounded-[62%_38%_50%_50%/48%_58%_42%_52%] rotate-[18deg] opacity-20 -z-10 blur-lg pointer-events-none hidden lg:block" />

      {/* Single desktop-only hero title, sitting above both the video and the
          3D CAD columns instead of each column carrying its own duplicate
          headline. Mobile keeps its own title inline with the video below —
          untouched. */}
      <div className="hidden lg:block w-full max-w-4xl mx-auto text-center mb-10">
        <h1
          className="text-4xl xl:text-5xl text-[#2D2D2D] uppercase tracking-tight leading-tight"
          style={{ fontFamily: 'Bevan, serif', fontWeight: 400 }}
        >
          Pica Yoyo — The Original 2-in-1 3D-Printed Grinder Yoyo
        </h1>
        <p className="text-lg xl:text-xl font-bold text-[#6D6D6D] normal-case mt-3">
          Built for the 90s kids who now have adult money
        </p>
      </div>

      {/* Layout: plain flex-column stack on mobile (unchanged), two-column
          grid on desktop (.hero-grid, src/index.css) so the CTA sits
          beside the media instead of requiring a scroll past it. DOM
          order stays mobile-first (descr, media, cta); the grid areas
          reposition on lg without touching that order. */}
      <div className="w-full flex flex-col items-center hero-grid lg:w-full lg:max-w-6xl lg:mx-auto">
        {/* Product Descriptor & Tagline. Mobile-only now — this whole
            column (video + its own headline/wordmark) is the TikTok-style
            lead-in for phones. Desktop drops it entirely: the shared hero
            title above already covers the copy, and the CAD viewer below
            is the one centerpiece instead of competing with a cramped
            video beside it. */}
        <div className="hero-descr lg:hidden relative text-center mb-6">
          {/* Video sits outside the fade-in wrapper below — an autoplaying
              video competing with Framer's mount animation on the same
              element stalled the fade permanently at opacity:0, so it's
              kept as a plain (un-animated) sibling instead. */}
          <div className="w-full flex flex-col items-center mb-6">
            <h3 className="text-3xl sm:text-4xl text-[#2D2D2D] uppercase tracking-tight text-center mb-4" style={{ fontFamily: 'Bungee, sans-serif', fontWeight: 400, lineHeight: '1.1' }}>
              The Internet's Next Favorite YOYO!
            </h3>
            <div className="w-full max-w-sm">
              <HeroVideo />
            </div>
          </div>

          <h2
            className="text-2xl sm:text-4xl text-[#2D2D2D] uppercase tracking-tight mb-3 mt-6"
            style={{ fontFamily: 'Bevan, serif', fontWeight: 400 }}
          >
            Pica Yoyo | 3D-Printed Yoyo Grinder
          </h2>
        </div>

        {/* Visual Product Hero — full-width centerpiece on desktop now that
            it's not sharing the row with the video. Tilts/settles into
            place the first time it scrolls into view (once) instead of
            just appearing — mobile gets the same entrance since it's
            already the top-of-page content there. */}
        <motion.div
          initial={{ opacity: 0, rotate: -4, y: 26 }}
          whileInView={{ opacity: 1, rotate: 0, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hero-media relative w-full max-w-sm sm:max-w-md lg:max-w-4xl mb-8 lg:mb-0 group overflow-visible"
        >
          {/* Mobile: keep the "NEW!" starburst in its corner (8% bigger),
              trust pill moves to the opposite corner instead of stacking
              underneath it. Desktop: no starburst — a bigger, bolder clay
              badge carries the trust claim on its own. */}
          <Starburst className="lg:hidden absolute -top-6 -right-5 z-20" size={73}>NEW!</Starburst>
          <div className="lg:hidden absolute -bottom-2 -left-3 bg-[#FFD93D] rounded-3xl px-3 py-2 transform rotate-12 pointer-events-none z-10" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <span className="text-[9px] font-black text-[#2D2D2D] text-center leading-tight block">100%</span>
            <span className="text-[9px] font-black text-[#2D2D2D] text-center leading-tight block">ORIGINAL</span>
          </div>

          <div className="hidden lg:flex clay clay-yellow clay-tilt-r clay-lg absolute -top-6 -right-6 z-20 flex-col items-center justify-center px-6 py-3.5 pointer-events-none">
            <span className="text-xl font-black text-[#2D2D2D] uppercase leading-none tracking-tight">100%</span>
            <span className="text-xl font-black text-[#2D2D2D] uppercase leading-none tracking-tight">Original</span>
          </div>

          {/* Drafting-tool clay accents — desktop only, opposite corners for
              balance. Nods to "designed in Fusion 360" (blueprint/
              engineering, not literal school supplies) the same way the
              Insta/TikTok icons further down are clay bubbles with an
              opposite tilt. Purely decorative. */}
          <div className="hidden lg:flex clay clay-yellow clay-tilt-l clay-sm absolute -top-5 -left-5 z-20 p-3 items-center justify-center pointer-events-none">
            <PencilRuler className="w-6 h-6 text-[#2D2D2D]" />
          </div>
          <div className="hidden lg:flex clay clay-coral clay-tilt-r clay-sm absolute -bottom-5 -right-5 z-20 p-3 items-center justify-center pointer-events-none">
            <Ruler className="w-6 h-6 text-white" />
          </div>

          {/* Yellow slab behind the frame — the second layer of clay. */}
          <div className="clay clay-yellow clay-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] -z-10 [--clay-tilt:3deg] transition-transform group-hover:[--clay-tilt:6.5deg]" />

          {/* Product Box Container. Desktop splits into two columns inside
              this one frame — CAD viewer left, real-photo gallery right —
              so the photos read as part of the same showcase instead of a
              separate block bolted on below it. */}
          <div className="clay clay-cream edge-yellow clay-lg relative p-4 sm:p-5">
            {/* Desktop gets the live CAD model; mobile keeps the product
                shot so a phone never pays for three.js. */}
            {desktop ? (
              <>
                <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
                  <div>
                    <Suspense
                      fallback={
                        <div className="clay-well clay-cream flex min-h-[420px] items-center justify-center bg-white">
                          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E3CDB0] border-t-[#FF6B6B]" />
                        </div>
                      }
                    >
                      <YoyoViewer3D colorId={selectedColorId} />
                    </Suspense>

                    {/* Color swatch strip — live preview control for the
                        model above, not just a decoration; picking a dot
                        recolors the CAD material in real time. */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                      {COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            playSound();
                            setSelectedColorId?.(opt.id);
                          }}
                          aria-label={`View in ${opt.name}`}
                          title={opt.name}
                          className="w-7 h-7 rounded-full transition-transform hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor: opt.swatch,
                            boxShadow: selectedColorId === opt.id
                              ? '0 0 0 2px #FFF9F2, 0 0 0 4px #2D2D2D, 0 2px 6px rgba(0,0,0,0.2)'
                              : '0 0 0 2px #FFF9F2, 0 0 0 3px #E3CDB0, 0 2px 6px rgba(0,0,0,0.15)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Real photos — desktop-only, same width column as the
                      CAD viewer beside it. */}
                  <DesktopColorGallery />
                </div>

                {/* Blueprint spec strip — real numbers pulled straight from
                    the parametric CAD model (data.ts / SPECS), not filler
                    text, so the CAD frame itself carries the proof. Spans
                    the full width, under both columns. */}
                <div className="mt-4 pt-4 border-t border-dashed border-[#E3CDB0] flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                  {[SPECS[0], SPECS[2], SPECS[7], SPECS[3]].map((spec) => (
                    <span key={spec.label} className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6D6D6D]">
                      {spec.label}: <span className="text-[#2D2D2D]">{spec.value}</span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <MobileCarousel />
            )}
          </div>
        </motion.div>

        {/* Social proof — right after the product image, before the first CTA */}
        <div className="lg:hidden flex flex-col items-center gap-2.5 mb-6">
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/getpicatoys"
              target="_blank"
              rel="noopener noreferrer"
              className="clay clay-yellow clay-tilt-l clay-sm p-2.5 flex items-center justify-center hover:shadow-lg transition-all"
              aria-label="Follow on Instagram"
            >
              <Instagram className="w-6 h-6 text-[#2D2D2D]" />
            </a>
            <a
              href="https://tiktok.com/@getpicatoys"
              target="_blank"
              rel="noopener noreferrer"
              className="clay clay-coral clay-tilt-r clay-sm p-2.5 flex items-center justify-center hover:shadow-lg transition-all"
              aria-label="Follow on TikTok"
            >
              <Music className="w-6 h-6 text-white" />
            </a>
          </div>
          <p className="text-xs font-bold text-[#6D6D6D]">As seen on Insta & TikTok!</p>
        </div>

        {/* Main CTA */}
        <div className="hero-cta flex flex-col items-center justify-center w-full max-w-md lg:max-w-sm lg:mx-auto mb-10 lg:mb-0">
          <span className="hidden lg:block text-[11px] font-bold text-[#6D6D6D] uppercase tracking-wider mb-3">
            As Seen On TikTok & Instagram
          </span>
          <button
            onClick={() => {
              playSound();
              onJoinWaitlist();
            }}
            className="clay clay-btn clay-green px-10 py-5 font-black text-lg w-full uppercase tracking-tight cursor-pointer flex items-center justify-center gap-2 group text-white"
          >
            <Sparkles className="w-6 h-6 text-[#FFD93D] group-hover:rotate-12 transition-transform" />
            <span className="lg:hidden">JOIN THE WAITLIST</span>
            <span className="hidden lg:inline">CLAIM YOUR SPOT</span>
          </button>
        </div>

      </div>
    </section>
  );
};
