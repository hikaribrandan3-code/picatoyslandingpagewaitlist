import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Ticket, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { VipTicket } from '../types';
import { COLOR_OPTIONS } from '../data';

// Wire to your Supabase Edge Function
const SUBMIT_ENDPOINT = 'https://ebctuzdmutxjjlbovxtm.supabase.co/functions/v1/waitlist-submit';

interface Props {
  playSound: () => void;
  selectedColor: string;
  setSelectedColor: (id: string) => void;
  onSuccessTicket: (ticket: VipTicket) => void;
}

export const WaitlistForm: React.FC<Props> = ({ playSound, selectedColor, setSelectedColor, onSuccessTicket }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const colorOption = COLOR_OPTIONS.find((c) => c.id === selectedColor) ?? COLOR_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    playSound();
    setError('');
    setIsSubmitting(true);

    if (SUBMIT_ENDPOINT) {
      try {
        const res = await fetch(SUBMIT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, colorPreference: colorOption.id }),
        });
        if (!res.ok) throw new Error('bad status');
      } catch {
        setIsSubmitting(false);
        setError("Couldn't reach the waitlist right now — try again in a minute.");
        return;
      }
    }

    const ticketNum = `#PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket: VipTicket = {
      email,
      ticketNumber: ticketNum,
      colorPreference: colorOption.id,
      timestamp: new Date().toLocaleDateString(),
    };

    setIsSubmitting(false);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f9d74a', '#3ba8a8', '#e54d30', '#7bb85c'],
    });

    onSuccessTicket(newTicket);
    setEmail('');
  };

  return (
    <section id="waitlist" className="bg-[#FFF9F2] py-16 sm:py-24 px-4 sm:px-6 border-b border-[#F0E6D9]">
      {/* Portrait single column on mobile (unchanged). On desktop the whole
          card widens and the form itself becomes the two-column grid: pitch
          + color vote on the left, the actual email/submit action on the
          right — a landscape signup layout instead of a tall narrow card. */}
      <div className="clay clay-cream clay-lg max-w-md lg:max-w-3xl mx-auto p-6 sm:p-8 text-center lg:text-left">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 text-left lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start"
        >
          {/* Left column: pitch + color vote. Text-align is scoped to just
              the icon/heading/subtitle block — the color-vote label stays
              left-aligned at every width, same as it always was. */}
          <div className="flex flex-col">
            <div className="text-center lg:text-left mb-4">
              <div className="clay clay-yellow clay-sm clay-tilt-r w-12 h-12 mx-auto lg:mx-0 flex items-center justify-center mb-4">
                <Ticket className="w-6 h-6 text-[#D94F4F]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#FF6B6B] uppercase tracking-tight mb-2">
                Get Your Pica Yoyo
              </h2>
              <p className="text-sm text-[#6D6D6D] font-medium leading-relaxed">
                Nothing's for sale yet — but the list gets first pick on color and first access when we open orders. One email, that's it.
              </p>
            </div>

            <div className="text-left">
              <label className="font-extrabold text-xs uppercase tracking-wider text-[#2D2D2D] mb-2 block">
                Which color should we print first?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {COLOR_OPTIONS.map((opt, i) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      playSound();
                      setSelectedColor(opt.id);
                    }}
                    className={`clay clay-btn clay-sm ${i % 2 ? 'clay-tilt-r' : 'clay-tilt-l'} py-2 px-1 text-[11px] font-extrabold text-center uppercase flex items-center justify-center gap-1.5 ${
                      colorOption.id === opt.id ? 'clay-coral' : 'clay-cream'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/25 shrink-0"
                      style={{ backgroundColor: opt.swatch }}
                    />
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: the actual action */}
          <div className="flex flex-col gap-4 lg:justify-center lg:h-full">
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
                  placeholder="you@example.com"
                  className="clay-well clay-cream w-full pl-11 pr-4 py-3.5 text-[#2D2D2D] placeholder:text-[#9E9E9E] font-bold text-sm focus:outline-none focus:border-[#D94F4F]"
                />
              </div>
            </div>

            {error && <p className="text-xs font-bold text-[#FF6B6B]">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="clay clay-btn clay-yellow font-black text-lg py-4 px-6 uppercase tracking-tight cursor-pointer mt-2 flex items-center justify-center gap-2 w-full disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Joining...' : 'JOIN THE WAITLIST'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs font-bold text-[#6D6D6D] flex items-center justify-center lg:justify-start gap-1">
              <ShieldCheck className="w-4 h-4 text-[#6BCB77]" />
              <span>No spam. Just the launch email.</span>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};
