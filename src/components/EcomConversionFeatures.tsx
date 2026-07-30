import React, { useState, useEffect } from 'react';
import { CUSTOMER_REVIEWS, FAQ_ITEMS } from '../data';
import { Star, CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock, Shield, Award, ThumbsUp, MessageSquare } from 'lucide-react';

interface Props {
  playSound: () => void;
  onJoinWaitlist: () => void;
}

export const EcomConversionFeatures: React.FC<Props> = ({ playSound, onJoinWaitlist }) => {
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 38,
    seconds: 12,
  });

  const [openFaq, setOpenFaq] = useState<string>('faq-1');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#FFF9F2]">
      {/* 1. Countdown Scarcity Section */}
      <section className="bg-[#2D2D2D] text-white py-14 px-4 sm:px-6 border-b border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF6B6B] text-white font-black text-xs uppercase px-4 py-1.5 rounded-full mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Vault Drop #003 Closing Soon</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black uppercase text-[#FFD93D] mb-2 tracking-tight">
            Limited Batch Allocation
          </h3>
          <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-md mx-auto">
            When Drop #003 sells out, the vault closes until the next precision manufacturing run.
          </p>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto mb-8">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FFD93D] block leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">
                Days
              </span>
            </div>
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FFD93D] block leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">
                Hours
              </span>
            </div>
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FFD93D] block leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">
                Mins
              </span>
            </div>
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
              <span className="text-2xl sm:text-4xl font-black text-[#FF6B6B] block leading-none animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-1 block">
                Secs
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto bg-[#1A1A1A] border border-white/10 rounded-full h-4 p-0.5 overflow-hidden mb-3">
            <div className="bg-gradient-to-r from-[#4D96FF] via-[#FFD93D] to-[#FF6B6B] h-full rounded-full w-[82%] transition-all" />
          </div>
          <p className="text-xs font-extrabold text-[#6BCB77] uppercase">
            82% of Vault Drop Reserved (18 of 100 Left)
          </p>
        </div>
      </section>

      {/* 2. Comparison Table Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto border-b border-[#F0E6D9]">
        <div className="text-center mb-10">
          <span className="bg-[#FFEEAD] text-[#D4A017] font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#F0E6D9] inline-block mb-3">
            Why PicaYoyo Wins
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] uppercase tracking-tight">
            How We Stack Up
          </h2>
        </div>

        {/* Comparison Table */}
        <div className="bg-white border border-[#F0E6D9] rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F2] border-b border-[#F0E6D9] text-xs sm:text-sm uppercase font-black">
                  <th className="p-4 sm:p-5 text-[#2D2D2D]">Feature / Spec</th>
                  <th className="p-4 sm:p-5 bg-[#FF6B6B] text-white border-x border-[#E05252] text-center">
                    PicaYoyo ($49)
                  </th>
                  <th className="p-4 sm:p-5 text-[#6D6D6D] text-center">Standard Retail Yoyos ($15)</th>
                  <th className="p-4 sm:p-5 text-[#6D6D6D] text-center">Expensive Metal Yoyos ($120+)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6D9] text-xs sm:text-sm font-bold">
                <tr>
                  <td className="p-4 text-[#2D2D2D]">Grinding Core Mechanism</td>
                  <td className="p-4 bg-[#FFEEAD]/30 text-[#FF6B6B] border-x border-[#F0E6D9] text-center font-black">
                    <CheckCircle2 className="w-5 h-5 mx-auto text-[#FF6B6B] mb-0.5" />
                    <span>Dual-Part Twist Core</span>
                  </td>
                  <td className="p-4 text-center text-gray-400">
                    <XCircle className="w-5 h-5 mx-auto" />
                    <span>None</span>
                  </td>
                  <td className="p-4 text-center text-gray-400">
                    <XCircle className="w-5 h-5 mx-auto" />
                    <span>None</span>
                  </td>
                </tr>

                <tr>
                  <td className="p-4 text-[#2D2D2D]">Average Sleep Spin Time</td>
                  <td className="p-4 bg-[#FFEEAD]/30 text-[#2D2D2D] border-x border-[#F0E6D9] text-center font-black">
                    4m 30s+ (20% Longer)
                  </td>
                  <td className="p-4 text-center text-gray-500">1m 15s</td>
                  <td className="p-4 text-center text-gray-500">4m 00s</td>
                </tr>

                <tr>
                  <td className="p-4 text-[#2D2D2D]">Unresponsive Ceramic Bearing</td>
                  <td className="p-4 bg-[#FFEEAD]/30 text-[#FF6B6B] border-x border-[#F0E6D9] text-center font-black">
                    <CheckCircle2 className="w-5 h-5 mx-auto text-[#FF6B6B] mb-0.5" />
                    <span>Included 10-Ball</span>
                  </td>
                  <td className="p-4 text-center text-gray-400">
                    <XCircle className="w-5 h-5 mx-auto" />
                    <span>Basic Steel</span>
                  </td>
                  <td className="p-4 text-center text-gray-500">
                    <CheckCircle2 className="w-5 h-5 mx-auto text-gray-500" />
                    <span>Standard Steel</span>
                  </td>
                </tr>

                <tr>
                  <td className="p-4 text-[#2D2D2D]">Aesthetics & Feel</td>
                  <td className="p-4 bg-[#FFEEAD]/30 text-[#2D2D2D] border-x border-[#F0E6D9] text-center font-black">
                    Nostalgic Modular Design
                  </td>
                  <td className="p-4 text-center text-gray-400">Generic Plastic</td>
                  <td className="p-4 text-center text-gray-400">Plain Anodized</td>
                </tr>

                <tr>
                  <td className="p-4 text-[#2D2D2D]">Mystery Box Extras</td>
                  <td className="p-4 bg-[#FFEEAD]/30 text-[#FF6B6B] border-x border-[#F0E6D9] text-center font-black">
                    <CheckCircle2 className="w-5 h-5 mx-auto text-[#FF6B6B] mb-0.5" />
                    <span>5+ Collector Perks</span>
                  </td>
                  <td className="p-4 text-center text-gray-400">None</td>
                  <td className="p-4 text-center text-gray-400">Single String Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Verified Customer Reviews */}
      <section id="reviews" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto border-b border-[#F0E6D9]">
        <div className="text-center mb-10">
          <span className="bg-[#FFD93D] text-[#2D2D2D] font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
            Real Tricker Feedback
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2D2D2D] uppercase tracking-tight">
            From The Inner Circle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#F0E6D9] rounded-3xl p-6 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-[#FFD93D]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black bg-[#FF6B6B] text-white px-2.5 py-0.5 rounded-full">
                    {rev.trickLevel}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-[#2D2D2D] mb-2">"{rev.title}"</h4>
                <p className="text-xs text-[#6D6D6D] font-medium leading-relaxed mb-4">
                  {rev.content}
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#F0E6D9] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="w-8 h-8 rounded-full border border-[#F0E6D9] object-cover"
                  />
                  <div>
                    <span className="text-xs font-black text-[#2D2D2D] block leading-none">
                      {rev.author}
                    </span>
                    <span className="text-[10px] font-bold text-[#6BCB77] flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#6D6D6D]">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FAQ Accordion */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="bg-[#FFEEAD] text-[#D4A017] font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#F0E6D9] inline-block mb-3">
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
