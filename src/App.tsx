import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TechnicalBlueprint } from './components/TechnicalBlueprint';
import { FlappyPicas } from './components/FlappyPicas';
import { ZombiesTeaser } from './components/ZombiesTeaser';
import { PicaButterfly } from './components/PicaButterfly';
import { EcomConversionFeatures } from './components/EcomConversionFeatures';
import { WaitlistForm } from './components/WaitlistForm';
import { VipTicketModal } from './components/VipTicketModal';
import { Footer } from './components/Footer';
import { PicaMealToysArcade } from './components/PicaMealToysArcade';
import { COLOR_OPTIONS } from './data';
import { VipTicket } from './types';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedColorId, setSelectedColorId] = useState(COLOR_OPTIONS[0].id);
  const [vipTicket, setVipTicket] = useState<VipTicket | null>(null);
  const [isFilesPage, setIsFilesPage] = useState(
    window.location.pathname === '/files' || window.location.pathname === '/butterfly'
  );
  const [isArcadeSandbox] = useState(window.location.pathname === '/picamealtoys');

  // Listen for popstate (back/forward) to update routing state
  useEffect(() => {
    const handlePopState = () => {
      setIsFilesPage(
        window.location.pathname === '/files' || window.location.pathname === '/butterfly'
      );
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // /picamealtoys is a hidden sandbox: no Header/Footer/site chrome, no way
  // back to the main site, only reachable by direct URL (QR code) — never
  // linked from nav.
  if (isArcadeSandbox) {
    return <PicaMealToysArcade />;
  }

  // Play synthetic retro click/yoyo spin SFX safely using Web Audio API
  const playSoundEffect = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (err) {
      // Ignore audio context autoplay restrictions
    }
  };

  const handleOpenWaitlist = () => {
    const el = document.getElementById('waitlist');
    if (el) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2D2D2D] flex flex-col font-sans selection:bg-[#FF6B6B] selection:text-white">
      <Header onOpenWaitlist={handleOpenWaitlist} />

      {isFilesPage ? (
        <main className="flex-1">
          <PicaButterfly playSound={playSoundEffect} onJoinWaitlist={handleOpenWaitlist} />
        </main>
      ) : (
        <main className="flex-1">
          {/* 1. Hero — the 3D model picks up whichever colour they voted for */}
          <Hero
            onJoinWaitlist={handleOpenWaitlist}
            playSound={playSoundEffect}
            selectedColorId={selectedColorId}
            setSelectedColorId={setSelectedColorId}
          />

          {/* 2. What's Inside — merged with the old "Under the Hood" section:
              same trust claim, same product-photo layout, told twice. Now one
              section, real photo -> arrow -> blueprint, one proof badge. */}
          <TechnicalBlueprint playSound={playSoundEffect} />

          {/* 3. Pica Arcade. One game per viewport: Closing Time (3D zombie FPS,
              keyboard + mouse) on desktop, Flappy Picas (one-thumb) on mobile.
              Each owns the `#arcade` anchor the header's Arcade link points to. */}
          <ZombiesTeaser />
          <FlappyPicas />

          {/* 4. First-batch countdown + builder note + FAQ */}
          <EcomConversionFeatures playSound={playSoundEffect} onJoinWaitlist={handleOpenWaitlist} />

          {/* 5. Waitlist form — color vote lives here now, right above the submit button */}
          <WaitlistForm
            playSound={playSoundEffect}
            selectedColor={selectedColorId}
            setSelectedColor={setSelectedColorId}
            onSuccessTicket={(ticket) => setVipTicket(ticket)}
          />
        </main>
      )}

      <Footer playSound={playSoundEffect} />

      <VipTicketModal ticket={vipTicket} onClose={() => setVipTicket(null)} playSound={playSoundEffect} />
    </div>
  );
}
