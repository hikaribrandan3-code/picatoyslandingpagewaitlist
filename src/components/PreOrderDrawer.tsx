import React, { useState } from 'react';
import { YOYO_EDITIONS } from '../data';
import { YoyoEdition, CartItem } from '../types';
import { X, ShoppingBag, Plus, Minus, Check, ShieldCheck, Sparkles, Truck, Tag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playSound: () => void;
}

export const PreOrderDrawer: React.FC<Props> = ({ isOpen, onClose, playSound }) => {
  const [selectedEdition, setSelectedEdition] = useState<YoyoEdition>(YOYO_EDITIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [addProStrings, setAddProStrings] = useState(true);
  const [addMysteryPack, setAddMysteryPack] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isOrdered, setIsOrdered] = useState(false);

  if (!isOpen) return null;

  const basePrice = selectedEdition.price * quantity;
  const addonStringsPrice = addProStrings ? 5 : 0;
  const addonMysteryPrice = addMysteryPack ? 10 : 0;
  const subtotal = basePrice + addonStringsPrice + addonMysteryPrice;
  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'INNERCIRCLE' || promoCode.trim().toUpperCase() === 'PICA10') {
      playSound();
      setAppliedDiscount(5);
    } else if (promoCode.trim()) {
      alert('Invalid code. Try using code "INNERCIRCLE" for $5 off!');
    }
  };

  const handleCheckout = () => {
    playSound();
    setIsOrdered(true);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#3ba8a8', '#f9d74a', '#e54d30'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-white border-l border-[#F0E6D9] h-full flex flex-col justify-between overflow-y-auto p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E6D9]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FFD93D] rounded-xl text-[#2D2D2D] shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#2D2D2D] uppercase">Vault Reservation</h3>
              <span className="text-xs font-bold text-[#FF6B6B]">Drop #003 Direct Lock</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#FFF9F2] hover:bg-[#FFEEAD] rounded-xl border border-[#F0E6D9] cursor-pointer"
          >
            <X className="w-5 h-5 text-[#2D2D2D]" />
          </button>
        </div>

        {/* Content Body */}
        {isOrdered ? (
          <div className="my-auto text-center p-4">
            <div className="w-20 h-20 bg-[#6BCB77] text-white rounded-3xl border border-[#F0E6D9] shadow-lg mx-auto flex items-center justify-center mb-4">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-[#2D2D2D] uppercase mb-2">
              Reservation Locked!
            </h3>
            <p className="text-sm text-[#6D6D6D] font-medium mb-6">
              Your PicaYoyo Drop #003 reservation has been saved in the vault system. A confirmation email has been dispatched.
            </p>

            <div className="bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-4 text-left mb-6">
              <span className="text-xs font-black text-[#FF6B6B] uppercase block mb-1">
                Order Summary
              </span>
              <div className="text-xs font-extrabold text-[#2D2D2D]">
                {selectedEdition.name} x{quantity}
              </div>
              <div className="text-xs text-[#6D6D6D] font-bold mt-1">
                Total Reserved: ${finalTotal.toFixed(2)} USD
              </div>
            </div>

            <button
              onClick={() => {
                setIsOrdered(false);
                onClose();
              }}
              className="bg-[#FF6B6B] text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-[0_4px_0_#E05252] hover:translate-y-0.5 transition-all w-full uppercase cursor-pointer"
            >
              Back To Landing Page
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Free Shipping Meter */}
            <div className="bg-[#FFEEAD]/40 border border-[#F0E6D9] rounded-2xl p-3.5 flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#FF6B6B] shrink-0" />
              <div className="text-xs">
                <span className="font-black text-[#2D2D2D] block">
                  🎉 FREE Express Worldwide Shipping Unlocked!
                </span>
                <span className="text-[#FF6B6B] font-bold">Includes collector box protection</span>
              </div>
            </div>

            {/* Edition Selection */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] mb-2 block">
                Choose Colorway Edition:
              </label>
              <div className="space-y-2">
                {YOYO_EDITIONS.map((ed) => (
                  <div
                    key={ed.id}
                    onClick={() => {
                      playSound();
                      setSelectedEdition(ed);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedEdition.id === ed.id
                        ? 'bg-[#FFEEAD]/50 border-[#FF6B6B] shadow-sm'
                        : 'bg-white border-[#F0E6D9] hover:bg-[#FFF9F2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full border border-[#F0E6D9] shrink-0"
                        style={{ backgroundColor: ed.coreColor }}
                      />
                      <div>
                        <span className="text-xs font-black text-[#2D2D2D] block">
                          {ed.name.split('—')[1] || ed.name}
                        </span>
                        <span className="text-[10px] text-[#6D6D6D] font-bold">
                          {ed.stockLeft} left in vault
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#2D2D2D]">${ed.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between bg-[#FFF9F2] border border-[#F0E6D9] rounded-2xl p-3">
              <span className="text-xs font-black uppercase text-[#2D2D2D]">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 bg-white border border-[#F0E6D9] rounded-lg flex items-center justify-center font-bold text-[#2D2D2D]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-black text-[#2D2D2D]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 bg-white border border-[#F0E6D9] rounded-lg flex items-center justify-center font-bold text-[#2D2D2D]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Addons */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] mb-2 block">
                Recommended Vault Add-Ons:
              </label>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-white border border-[#F0E6D9] rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addProStrings}
                      onChange={(e) => setAddProStrings(e.target.checked)}
                      className="w-4 h-4 accent-[#FF6B6B]"
                    />
                    <span className="text-xs font-bold text-[#2D2D2D]">
                      10x Pro Neon Strings Pack
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#FF6B6B]">+$5</span>
                </label>

                <label className="flex items-center justify-between p-3 bg-white border border-[#F0E6D9] rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addMysteryPack}
                      onChange={(e) => setAddMysteryPack(e.target.checked)}
                      className="w-4 h-4 accent-[#FF6B6B]"
                    />
                    <span className="text-xs font-bold text-[#2D2D2D]">
                      Mystery Collector Holo Pack
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#FF6B6B]">+$10</span>
                </label>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
                <input
                  type="text"
                  placeholder="Promo Code (INNERCIRCLE)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 border border-[#F0E6D9] rounded-xl text-xs font-bold uppercase focus:outline-none bg-[#FFF9F2]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#2D2D2D] text-white font-black text-xs px-4 rounded-xl hover:bg-black cursor-pointer"
              >
                Apply
              </button>
            </form>

            {appliedDiscount > 0 && (
              <div className="text-xs font-black text-[#6BCB77] bg-[#6BCB77]/10 p-2 rounded-xl border border-[#6BCB77]">
                ✓ Promo applied! -$5.00 discount.
              </div>
            )}
          </div>
        )}

        {/* Footer Pricing & Checkout Button */}
        {!isOrdered && (
          <div className="pt-4 border-t border-[#F0E6D9] space-y-3">
            <div className="flex justify-between text-sm font-bold text-[#6D6D6D]">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#6BCB77]">
                <span>Discount</span>
                <span>-${appliedDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-black text-[#2D2D2D] pt-2 border-t border-[#F0E6D9]">
              <span>Total Due</span>
              <span>${finalTotal.toFixed(2)} USD</span>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-[#FFD93D] text-[#2D2D2D] font-black text-lg py-4 px-6 rounded-2xl shadow-[0_6px_0_#D4A017] hover:translate-y-1 hover:shadow-[0_3px_0_#D4A017] transition-all w-full uppercase tracking-tight cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lock Pre-Order Drop</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-[10px] text-center text-[#6D6D6D] font-bold">
              🔒 256-Bit SSL Encrypted Checkout • 30-Day Money Back Guarantee
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
