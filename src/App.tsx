import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductInteractiveViewer } from './components/ProductInteractiveViewer';
import { TechnicalBlueprint } from './components/TechnicalBlueprint';
import { SecondActMysteryBox } from './components/SecondActMysteryBox';
import { EcomConversionFeatures } from './components/EcomConversionFeatures';
import { WaitlistForm } from './components/WaitlistForm';
import { PreOrderDrawer } from './components/PreOrderDrawer';
import { StickyMobileBar } from './components/StickyMobileBar';
import { VipTicketModal } from './components/VipTicketModal';
import { Footer } from './components/Footer';
import { VipTicket } from './types';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(1);
  const [selectedColorCore, setSelectedColorCore] = useState('#4577b9');
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

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2D2D2D] flex flex-col font-sans selection:bg-[#FF6B6B] selection:text-white">
      {/* Header */}
      <Header
        onOpenWaitlist={handleOpenWaitlist}
        onOpenCart={handleOpenCart}
        cartCount={cartCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onJoinWaitlist={handleOpenWaitlist}
          onQuickPreorder={handleOpenCart}
          playSound={playSoundEffect}
        />

        {/* 2. More Than Just A Throw - Interactive Trick & Specs Section */}
        <ProductInteractiveViewer
          playSound={playSoundEffect}
          onSelectEdition={handleOpenCart}
        />

        {/* 3. Under the Hood - Technical CAD Blueprint Section */}
        <TechnicalBlueprint
          playSound={playSoundEffect}
          selectedColorCore={selectedColorCore}
          setSelectedColorCore={setSelectedColorCore}
        />

        {/* 4. The Second Act - Mystery Box Unboxing Simulator */}
        <SecondActMysteryBox playSound={playSoundEffect} />

        {/* 5. Ecom Conversion Boosters (Countdown, Comparison, Reviews, FAQ) */}
        <EcomConversionFeatures
          playSound={playSoundEffect}
          onJoinWaitlist={handleOpenWaitlist}
        />

        {/* 6. Waitlist & VIP Ticket Generation Form */}
        <WaitlistForm
          playSound={playSoundEffect}
          onSuccessTicket={(ticket) => setVipTicket(ticket)}
        />
      </main>

      {/* Footer */}
      <Footer onOpenCart={handleOpenCart} playSound={playSoundEffect} />

      {/* Shopping Bag / Pre-Order Drawer */}
      <PreOrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        playSound={playSoundEffect}
      />

      {/* VIP Ticket Success Modal */}
      <VipTicketModal
        ticket={vipTicket}
        onClose={() => setVipTicket(null)}
        playSound={playSoundEffect}
      />

      {/* Sticky Mobile Conversion Bar */}
      <StickyMobileBar
        onOpenWaitlist={handleOpenWaitlist}
        onOpenCart={handleOpenCart}
        playSound={playSoundEffect}
      />
    </div>
  );
}
