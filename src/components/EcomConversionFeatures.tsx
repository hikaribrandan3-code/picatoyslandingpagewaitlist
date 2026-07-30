import React, { useState, useEffect } from 'react';
import { FAQ_ITEMS } from '../data';
import { ChevronDown, ChevronUp, Clock, Wrench } from 'lucide-react';

interface Props {
  playSound: () => void;
  onJoinWaitlist: () => void;
}

// Real target, not a fake decrementing scarcity timer: computed once from
// "now" so a page refresh doesn't reset it back to a fabricated 2 days.
const LAUNCH_TARGET = Date.now() + 30 * 24 * 60 * 60 * 1000;

function getCountdown() {
  const diff = Math.max(0, LAUNCH_TARGET - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export const EcomConversionFeatures: React.FC<Props> = ({ playSound, onJoinWaitlist }) => {
  const [timeLeft, setTimeLeft] = useState(getCountdown);
  const [openFaq, setOpenFaq] = useState<string>('faq-1');

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#FFF9F2]">
      {/* 1. First-batch target window (real countdown, not fake scarcity) */}
      <section className="bg-[#2D2D2D] text-white py-14 px-4 sm:px-6 border-b border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF6B6B] text-white font-black text-xs uppercase px-4 py-1.5 rounded-full mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Target: First Batch</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black uppercase text-[#FFD93D] mb-2 tracking-tight">
            We're Printing the First Real Run
          </h3>
          <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-md mx-auto">
            A test coupon prints first to confirm the thread holds up in PETG, then the first full batch follows. This is our target window — waitlist members hear first if it shifts.
          </p>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto mb-2">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FFD93D] block leading-none tabular-nums">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">Days</span>
            </div>
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FFD93D] block leading-none tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">Hours</span>
            </div>
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FFD93D] block leading-none tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">Mins</span>
            </div>
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FF6B6B] block leading-none tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. From the builder */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-2xl mx-auto border-b border-[#F0E6D9]">
        <div className="text-center mb-8">
          <span className="bg-[#FFD93D] text-[#2D2D2D] font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
            From the Builder
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] uppercase tracking-tight">
            Why I Made This
          </h2>
        </div>

        <div className="bg-white border border-[#F0E6D9] rounded-3xl p-6 sm:p-8 shadow-md flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <p className="text-sm sm:text-base text-[#6D6D6D] font-medium leading-relaxed text-left">
            "I designed and built PicaYoyo myself, from a broken reference drawing up — something I'd actually want to
            use. Every spec on this page is verified in the CAD model; nothing is copied from another product.
            The first physical print is next."
          </p>
        </div>
      </section>

      {/* 3. FAQ Accordion */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="clay clay-yellow font-bold text-xs uppercase tracking-widest px-4 py-2 inline-block mb-3">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] uppercase tracking-tight">
            Frequently Asked
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-[#F0E6D9] rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => {
                    playSound();
                    setOpenFaq(isOpen ? '' : faq.id);
                  }}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-black text-base sm:text-lg text-[#2D2D2D] hover:bg-[#FFF9F2] cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FFF9F2] border border-[#F0E6D9] flex items-center justify-center shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-[#FF6B6B]" /> : <ChevronDown className="w-5 h-5 text-[#2D2D2D]" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 border-t border-[#F0E6D9] text-xs sm:text-sm text-[#6D6D6D] font-medium leading-relaxed bg-[#FFF9F2]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
