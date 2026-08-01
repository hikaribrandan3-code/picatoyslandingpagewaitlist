import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TechnicalBlueprint } from './components/TechnicalBlueprint';
import { FlappyPicas } from './components/FlappyPicas';
import { PicaCrossing } from './components/PicaCrossing';
import { ZombiesTeaser } from './components/ZombiesTeaser';
import { EcomConversionFeatures } from './components/EcomConversionFeatures';
import { SuggestionBox } from './components/SuggestionBox';
import { WaitlistForm } from './components/WaitlistForm';
import { VipTicketModal } from './components/VipTicketModal';
import { Footer } from './components/Footer';
import { COLOR_OPTIONS } from './data';
import { VipTicket } from './types';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedColorId, setSelectedColorId] = useState(COLOR_OPTIONS[0].id);
  const [vipTicket, setVipTicket] = useState<VipTicket | null>(null);

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

        {/* 3. Pica Arcade. Flagship game is split by viewport, each gating
            itself on a real media query and returning null rather than being
            hidden by CSS, so only one flagship ever mounts or runs a loop:
            Closing Time (3D zombie FPS, keyboard + mouse) leads on desktop,
            Flappy Picas (one-thumb) leads on mobile. Whichever one mounts
            owns the `#arcade` anchor the header's Arcade link points at.
            Pica Crossing renders on every viewport underneath as the
            secondary "also try" game — it's fully touch-capable too, so
            mobile isn't stuck with just one. */}
        <ZombiesTeaser />
        <FlappyPicas />
        <PicaCrossing />

        {/* 4. First-batch countdown + builder note + FAQ */}
        <EcomConversionFeatures playSound={playSoundEffect} onJoinWaitlist={handleOpenWaitlist} />

        {/* 4.5 Suggestion box — soft touch after FAQ, before the hard
            waitlist CTA. No backend: submitting opens a mailto: to the
            same contact address Header/Footer use. */}
        <SuggestionBox playSound={playSoundEffect} />

        {/* 5. Waitlist form — color vote lives here now, right above the submit button */}
        <WaitlistForm
          playSound={playSoundEffect}
          selectedColor={selectedColorId}
          setSelectedColor={setSelectedColorId}
          onSuccessTicket={(ticket) => setVipTicket(ticket)}
        />
      </main>

      <Footer playSound={playSoundEffect} />

      <VipTicketModal ticket={vipTicket} onClose={() => setVipTicket(null)} playSound={playSoundEffect} />
    </div>
  );
}
