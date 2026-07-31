import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Sparkles, Volume2, VolumeX, Play, Pause, Instagram, Music, PencilRuler, Ruler } from 'lucide-react';

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

interface HeroProps {
  onJoinWaitlist: () => void;
  playSound: () => void;
  selectedColorId?: string;
}

export const Hero: React.FC<HeroProps> = ({ onJoinWaitlist, playSound, selectedColorId = 'clear' }) => {
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
        <h1 className="text-4xl xl:text-5xl font-black text-[#2D2D2D] uppercase tracking-tight leading-tight">
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

          <h2 className="text-2xl sm:text-4xl font-black text-[#2D2D2D] uppercase tracking-tight mb-3 mt-6">
            Pica Yoyo | 3D-Printed Yoyo Grinder
          </h2>
        </div>

        {/* Visual Product Hero — full-width centerpiece on desktop now that
            it's not sharing the row with the video. */}
        <div className="hero-media relative w-full max-w-sm sm:max-w-md lg:max-w-4xl mb-8 lg:mb-0 group overflow-visible">
          {/* Gold tilted sticker badge */}
          <div className="absolute -top-1 -right-2 bg-[#FFD93D] rounded-3xl px-3 py-2 transform rotate-30 pointer-events-none z-20" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <span className="text-[9px] font-black text-[#2D2D2D] text-center leading-tight block">100%</span>
            <span className="text-[9px] font-black text-[#2D2D2D] text-center leading-tight block">ORIGINAL</span>
          </div>

          {/* Drafting-tool clay accents — desktop only. Nods to "designed in
              Fusion 360" (blueprint/engineering, not literal school supplies)
              the same way the Insta/TikTok icons further down are clay
              bubbles with an opposite tilt. Purely decorative. */}
          <div className="hidden lg:flex clay clay-yellow clay-tilt-l clay-sm absolute -top-5 -left-5 z-20 p-3 items-center justify-center pointer-events-none">
            <PencilRuler className="w-6 h-6 text-[#2D2D2D]" />
          </div>
          <div className="hidden lg:flex clay clay-coral clay-tilt-r clay-sm absolute -bottom-5 -left-6 z-20 p-3 items-center justify-center pointer-events-none">
            <Ruler className="w-6 h-6 text-white" />
          </div>

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
