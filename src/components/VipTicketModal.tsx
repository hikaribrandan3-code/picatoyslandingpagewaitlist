import React, { useState } from 'react';
import { VipTicket } from '../types';
import { X, Sparkles, Check, Copy, Ticket, ShieldCheck, Download } from 'lucide-react';

interface Props {
  ticket: VipTicket | null;
  onClose: () => void;
  playSound: () => void;
}

export const VipTicketModal: React.FC<Props> = ({ ticket, onClose, playSound }) => {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const handleCopyPass = () => {
    playSound();
    navigator.clipboard.writeText(
      `PICA TOYS INNER CIRCLE VIP PASS\nTicket #: ${ticket.ticketNumber}\nEmail: ${ticket.email}\nTier: ${ticket.tier}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#F0E6D9] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#FFF9F2] hover:bg-[#FFEEAD] rounded-xl border border-[#F0E6D9] cursor-pointer"
        >
          <X className="w-5 h-5 text-[#2D2D2D]" />
        </button>

        {/* Modal Header */}
        <div className="w-14 h-14 bg-[#FF6B6B] text-white rounded-2xl shadow-md mx-auto flex items-center justify-center mb-3">
          <Sparkles className="w-8 h-8 text-[#FFD93D]" />
        </div>

        <h3 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-tight mb-1">
          Welcome To The Inner Circle!
        </h3>
        <p className="text-xs text-[#6D6D6D] font-medium mb-6">
          Your Drop #003 VIP Access Ticket has been issued. Save this ticket code for early vault entry.
        </p>

        {/* Ticket Graphic Card */}
        <div className="bg-gradient-to-br from-[#FF6B6B] to-[#E05252] border border-[#E05252] rounded-2xl p-5 text-white shadow-lg text-left relative overflow-hidden mb-6">
          {/* Top Badge */}
          <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Ticket className="w-5 h-5 text-[#FFD93D]" />
              <span className="font-black text-sm uppercase tracking-wider">
                PICA TOYS VIP ACCESS
              </span>
            </div>
            <span className="bg-[#FFD93D] text-[#2D2D2D] text-[10px] font-black px-2 py-0.5 rounded-md">
              {ticket.tier}
            </span>
          </div>

          {/* Ticket Details */}
          <div className="space-y-2 mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/80 block">
                VIP Ticket Number
              </span>
              <span className="text-xl font-black text-[#FFD93D] tracking-widest font-mono">
                {ticket.ticketNumber}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-white/80 block">
                Registered Email
              </span>
              <span className="text-xs font-bold truncate block">{ticket.email}</span>
            </div>
          </div>

          {/* Simulated Barcode */}
          <div className="bg-white p-2 rounded-lg flex justify-center items-center h-10 gap-1 opacity-90">
            {[...Array(24)].map((_, i) => (
              <span
                key={i}
                className="bg-[#2D2D2D] h-full"
                style={{ width: `${(i % 3) + 1}px` }}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyPass}
            className="bg-[#FFD93D] text-[#2D2D2D] font-black text-xs py-3 px-4 rounded-xl shadow-[0_4px_0_#D4A017] flex-1 uppercase flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#6BCB77]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Pass Copied!' : 'Copy VIP Pass'}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#FF6B6B] text-white font-black text-xs py-3 px-4 rounded-xl shadow-[0_4px_0_#E05252] flex-1 uppercase cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
