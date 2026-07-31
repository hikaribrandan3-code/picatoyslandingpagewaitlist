import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';

const CONTACT_EMAIL = 'Hikaristudioai@gmail.com';

interface Props {
  playSound: () => void;
}

/**
 * Zero-infra feedback box: no new backend, no webhook. Submitting builds a
 * mailto: link (same contact address Header/Footer already use) and opens
 * the visitor's mail client, then optimistically shows the "thanks" state —
 * we can't know if they actually hit send in their mail app, but that's fine
 * for a low-stakes suggestion box.
 */
export const SuggestionBox: React.FC<Props> = ({ playSound }) => {
  const [idea, setIdea] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    playSound();

    const subject = 'Pica Yoyo suggestion';
    const body = `${idea}${email ? `\n\n— from ${email}` : ''}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setSent(true);
  };

  return (
    <section className="bg-[#FFF9F2] py-16 sm:py-20 px-4 sm:px-6 border-b-[3px] border-[#3BA8A8]">
      <div className="clay clay-cream edge-yellow clay-lg max-w-md lg:max-w-2xl mx-auto p-6 sm:p-8 lg:p-10 text-center lg:text-left">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
          {/* Left: Icon + Heading + Description */}
          <div>
            <div className="clay clay-yellow clay-sm clay-tilt-r w-12 h-12 mx-auto lg:mx-0 flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-[#D94F4F]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#3BA8A8] uppercase tracking-tight mb-2">
              Got Ideas To Make Pica Yoyo Better?
            </h2>
            <p className="text-sm text-[#6D6D6D] font-medium leading-relaxed mb-6 lg:mb-0">
              We read every suggestion. Share your thoughts — small tweaks, wild ideas, whatever.
            </p>
          </div>

          {/* Right: Form or Thank You */}
          <div>
            {sent ? (
              <div className="clay-well clay-cream flex flex-col items-center lg:items-start gap-2 py-6 px-4">
                <CheckCircle2 className="w-8 h-8 text-[#3BA8A8]" />
                <p className="font-black text-sm uppercase tracking-tight text-[#2D2D2D]">
                  Thanks for the tip
                </p>
                <p className="text-xs text-[#6D6D6D] font-medium">
                  We'll review suggestions weekly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
                <textarea
                  required
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Add a color, a feature, anything..."
                  rows={3}
                  className="clay-well clay-cream w-full px-4 py-3 text-[#2D2D2D] placeholder:text-[#9E9E9E] font-bold text-sm resize-none focus:outline-none focus:border-[#3BA8A8]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional, if you want a reply)"
                  className="clay-well clay-cream w-full px-4 py-3 text-[#2D2D2D] placeholder:text-[#9E9E9E] font-bold text-sm focus:outline-none focus:border-[#3BA8A8]"
                />
                <button
                  type="submit"
                  className="clay clay-btn clay-coral font-black text-sm py-3.5 px-6 uppercase tracking-tight cursor-pointer mt-1 flex items-center justify-center gap-2 w-full text-white"
                >
                  <span>Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
