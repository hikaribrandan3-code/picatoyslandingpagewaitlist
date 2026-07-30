import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ShieldCheck, Ticket, Copy, Check, Download, Mail, ArrowRight } from 'lucide-react';
import { VipTicket } from '../types';

interface Props {
  playSound: () => void;
  onSuccessTicket: (ticket: VipTicket) => void;
}

export const WaitlistForm: React.FC<Props> = ({ playSound, onSuccessTicket }) => {
  const [email, setEmail] = useState('');
  const [collectorTier, setCollectorTier] = useState<'Collector' | 'Pro Tricker' | 'Gift Seeker'>('Collector');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    playSound();
    setIsSubmitting(true);

    setTimeout(() => {
      const ticketNum = `#PT-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTicket: VipTicket = {
        email,
        ticketNumber: ticketNum,
        tier: collectorTier,
        timestamp: new Date().toLocaleDateString(),
      };

      setIsSubmitting(false);

      // Trigger high-volume confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f9d74a', '#3ba8a8', '#e54d30', '#7bb85c'],
      });

      onSuccessTicket(newTicket);
      setEmail('');
    }, 800);
  };

  return (
    <section id="waitlist" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b border-[#F0E6D9]">
      <div className="max-w-md mx-auto bg-white border border-[#F0E6D9] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Top Header Badge */}
        <div className="w-12 h-12 bg-[#FFD93D] text-[#2D2D2D] rounded-2xl border border-[#F0E6D9] shadow-sm mx-auto flex items-center justify-center mb-4">
          <Ticket className="w-6 h-6 text-[#FF6B6B]" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-[#FF6B6B] uppercase tracking-tight mb-2">
          Get Your PicaYoyo
        </h2>
        <p className="text-sm text-[#6D6D6D] font-medium mb-6 leading-relaxed">
          Be the first to know when the vault opens. Limited quantities available per drop.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {/* VIP Tier Selector */}
          <div>
            <label className="font-extrabold text-xs uppercase tracking-wider text-[#2D2D2D] mb-2 block">
              Select Your Tricker Profile:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Collector', 'Pro Tricker', 'Gift Seeker'] as const).map((tier) => (
                <button
                  type="button"
                  key={tier}
                  onClick={() => {
                    playSound();
                    setCollectorTier(tier);
                  }}
                  className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border transition-all cursor-pointer text-center uppercase ${
                    collectorTier === tier
                      ? 'bg-[#FF6B6B] text-white border-[#E05252] shadow-sm'
                      : 'bg-[#FFF9F2] text-[#2D2D2D] border-[#F0E6D9] hover:bg-[#FFEEAD]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="font-extrabold text-xs uppercase tracking-wider text-[#2D2D2D] mb-2 block">
              Your Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@picatoys.com"
                className="w-full pl-11 pr-4 py-3.5 border border-[#F0E6D9] rounded-2xl bg-[#FFF9F2] text-[#2D2D2D] placeholder:text-[#9E9E9E] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#FFD93D] text-[#2D2D2D] font-black text-lg py-4 px-6 rounded-2xl shadow-[0_6px_0_#D4A017] hover:translate-y-1 hover:shadow-[0_3px_0_#D4A017] transition-all uppercase tracking-tight cursor-pointer mt-2 flex items-center justify-center gap-2 w-full"
          >
            <span>{isSubmitting ? 'Generating Ticket...' : 'GET ACCESS'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-4 text-xs font-bold text-[#6D6D6D] flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-[#6BCB77]" />
          <span>No spam. Just toy drops and secrets.</span>
        </p>
      </div>
    </section>
  );
};
