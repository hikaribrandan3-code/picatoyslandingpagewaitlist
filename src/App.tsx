import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductInteractiveViewer } from './components/ProductInteractiveViewer';
import { TechnicalBlueprint } from './components/TechnicalBlueprint';
import { ClawMachineArcade } from './components/ClawMachineArcade';
import { EcomConversionFeatures } from './components/EcomConversionFeatures';
import { WaitlistForm } from './components/WaitlistForm';
import { StickyMobileBar } from './components/StickyMobileBar';
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
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2D2D2D] flex flex-col font-sans selection:bg-[#FF6B6B] selection:text-white">
      <Header
        onOpenWaitlist={handleOpenWaitlist}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <main className="flex-1">
        {/* 1. Hero — the 3D model picks up whichever colour they voted for */}
        <Hero
          onJoinWaitlist={handleOpenWaitlist}
          playSound={playSoundEffect}
          selectedColorId={selectedColorId}
        />

        {/* 2. What's Inside — real engineering proof, not a fake trick simulator */}
        <ProductInteractiveViewer playSound={playSoundEffect} />

        {/* 3. Under the Hood — real specs + color vote */}
        <TechnicalBlueprint
          playSound={playSoundEffect}
          selectedColorId={selectedColorId}
          setSelectedColorId={setSelectedColorId}
        />

        {/* 4. For-fun retro claw machine arcade — virtual coins/prizes, no real inventory */}
        <ClawMachineArcade playSound={playSoundEffect} />

        {/* 5. First-batch countdown + builder note + FAQ */}
        <EcomConversionFeatures playSound={playSoundEffect} onJoinWaitlist={handleOpenWaitlist} />

        {/* 6. Waitlist form */}
        <WaitlistForm
          playSound={playSoundEffect}
          selectedColor={selectedColorId}
          onSuccessTicket={(ticket) => setVipTicket(ticket)}
        />
      </main>

      <Footer playSound={playSoundEffect} />

      <VipTicketModal ticket={vipTicket} onClose={() => setVipTicket(null)} playSound={playSoundEffect} />

      <StickyMobileBar onOpenWaitlist={handleOpenWaitlist} playSound={playSoundEffect} />
    </div>
  );
}
