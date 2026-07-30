import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Coins,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Gift,
  PackageCheck
} from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Legendary' | 'Secret';
  color: string;
  badgeBg: string;
  xPercent: number; // 15 to 85%
  points: number;
  type: 'yoyo' | 'bear' | 'rocket' | 'dino' | 'capsule' | 'cat' | 'star' | 'alien';
}

const INITIAL_PRIZES: Prize[] = [
  { id: 'p1', name: 'Pica Yoyo Prototype', rarity: 'Legendary', color: '#FF6B6B', badgeBg: '#E05252', xPercent: 20, points: 1000, type: 'yoyo' },
  { id: 'p2', name: 'Golden Bear Plush', rarity: 'Rare', color: '#FFD93D', badgeBg: '#D4A017', xPercent: 32, points: 500, type: 'bear' },
  { id: 'p3', name: 'Retro Space Rocket', rarity: 'Common', color: '#4D96FF', badgeBg: '#2B62D9', xPercent: 44, points: 250, type: 'rocket' },
  { id: 'p4', name: 'Mini Pixel Dino', rarity: 'Common', color: '#6BCB77', badgeBg: '#3E9648', xPercent: 56, points: 250, type: 'dino' },
  { id: 'p5', name: 'Mystery Holo Capsule', rarity: 'Secret', color: '#9B51E0', badgeBg: '#7024B2', xPercent: 68, points: 1200, type: 'capsule' },
  { id: 'p6', name: 'Pixel Kitty Plush', rarity: 'Common', color: '#FF9F43', badgeBg: '#D66C0B', xPercent: 80, points: 250, type: 'cat' },
  { id: 'p7', name: 'Glowing Star Badge', rarity: 'Common', color: '#F39C12', badgeBg: '#B77006', xPercent: 28, points: 100, type: 'star' },
  { id: 'p8', name: 'Space Invader Toy', rarity: 'Rare', color: '#00CEC9', badgeBg: '#009793', xPercent: 72, points: 500, type: 'alien' }
];

interface Props {
  playSound?: () => void;
}

export const ClawMachineArcade: React.FC<Props> = ({ playSound }) => {
  const [coins, setCoins] = useState(5);
  const [score, setScore] = useState(1250);
  const [soundOn, setSoundOn] = useState(true);

  const [clawX, setClawX] = useState(50); // % across glass window (15% to 85%)
  const [clawY, setClawY] = useState(0); // % down (0% top, 70% bottom)
  const [clawOpen, setClawOpen] = useState(true);

  const [status, setStatus] = useState<
    'IDLE' | 'LOWERING' | 'GRABBING' | 'RAISING' | 'RETURNING' | 'DROPPING' | 'WIN_MODAL'
  >('IDLE');

  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [heldPrize, setHeldPrize] = useState<Prize | null>(null);
  const [collectedPrizes, setCollectedPrizes] = useState<Prize[]>([]);
  const [latestWonPrize, setLatestWonPrize] = useState<Prize | null>(null);
  const [message, setMessage] = useState<string>('INSERT COIN & PRESS GRAB!');

  // Play retro synthesised SFX using Web Audio API
  const playRetroSFX = (type: 'coin' | 'move' | 'drop' | 'grab' | 'win' | 'miss') => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987, ctx.currentTime);
        osc.frequency.setValueAtTime(1318, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'move') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'grab') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.setValueAtTime(360, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
        });
      } else if (type === 'miss') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context restricted or not allowed
    }
  };

  const handleInsertCoin = () => {
    setCoins((c) => c + 2);
    playRetroSFX('coin');
    if (playSound) playSound();
    setMessage('COINS ADDED! AIM & PRESS GRAB');
  };

  const handleMoveLeft = () => {
    if (status !== 'IDLE') return;
    setClawX((x) => Math.max(15, x - 5));
    playRetroSFX('move');
  };

  const handleMoveRight = () => {
    if (status !== 'IDLE') return;
    setClawX((x) => Math.min(85, x + 5));
    playRetroSFX('move');
  };

  // Keyboard navigation listener (Left/Right Arrow keys, Space for Grab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'IDLE') return;
      if (e.key === 'ArrowLeft') {
        handleMoveLeft();
      } else if (e.key === 'ArrowRight') {
        handleMoveRight();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerGrab();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, clawX, coins]);

  const triggerGrab = () => {
    if (status !== 'IDLE') return;
    if (coins <= 0) {
      setMessage('NO COINS LEFT! TAP INSERT COIN');
      playRetroSFX('miss');
      return;
    }

    setCoins((c) => c - 1);
    setStatus('LOWERING');
    setMessage('LOWERING CLAW...');
    playRetroSFX('drop');

    // 1. Lower Claw
    let currentY = 0;
    const lowerInterval = setInterval(() => {
      currentY += 4;
      setClawY(currentY);
      if (currentY >= 68) {
        clearInterval(lowerInterval);

        // 2. Attempt Grab
        setStatus('GRABBING');
        setClawOpen(false);
        playRetroSFX('grab');

        setTimeout(() => {
          // Check spatial collision with prize on floor (within +-8% distance)
          const targetPrize = prizes.find(
            (p) => Math.abs(p.xPercent - clawX) <= 8.5
          );

          if (targetPrize) {
            setHeldPrize(targetPrize);
            setPrizes((prev) => prev.filter((p) => p.id !== targetPrize.id));
            setMessage(`GRABBED ${targetPrize.name.toUpperCase()}!`);

            // 3. Raise Claw with Prize
            setTimeout(() => {
              setStatus('RAISING');
              let raiseY = 68;
              const raiseInterval = setInterval(() => {
                raiseY -= 4;
                setClawY(raiseY);
                if (raiseY <= 0) {
                  clearInterval(raiseInterval);

                  // 4. Return to Chute (X = 12%)
                  setStatus('RETURNING');
                  setMessage('RETURNING TO PRIZE PIT...');

                  let returnX = clawX;
                  const returnInterval = setInterval(() => {
                    if (returnX > 12) {
                      returnX -= 3;
                      setClawX(returnX);
                    } else {
                      clearInterval(returnInterval);

                      // 5. Drop Prize into Chute
                      setStatus('DROPPING');
                      setClawOpen(true);

                      setTimeout(() => {
                        playRetroSFX('win');
                        setScore((s) => s + targetPrize.points);
                        setCollectedPrizes((prev) => [...prev, targetPrize]);
                        setLatestWonPrize(targetPrize);
                        setStatus('WIN_MODAL');
                        setMessage(`YOU WON ${targetPrize.name}!`);

                        // Auto-respawn replacement prize so machine is never empty
                        setTimeout(() => {
                          const newTypes: Prize['type'][] = ['yoyo', 'bear', 'rocket', 'dino', 'capsule', 'cat', 'star', 'alien'];
                          const randomType = newTypes[Math.floor(Math.random() * newTypes.length)];
                          const newPrize: Prize = {
                            id: 'p_' + Date.now(),
                            name: `Bonus ${randomType.toUpperCase()} Toy`,
                            rarity: Math.random() > 0.6 ? 'Rare' : 'Common',
                            color: ['#FF6B6B', '#FFD93D', '#4D96FF', '#6BCB77', '#9B51E0'][Math.floor(Math.random() * 5)],
                            badgeBg: '#191c21',
                            xPercent: Math.floor(Math.random() * 60) + 20,
                            points: 300,
                            type: randomType
                          };
                          setPrizes((prev) => [...prev, newPrize]);
                        }, 1200);
                        setHeldPrize(null);
                      }, 600);
                    }
                  }, 30);
                }
              }, 30);
            }, 300);

          } else {
            // Empty Grab Miss
            setMessage('MISSED ALIGNMENT! TRY AGAIN');
            playRetroSFX('miss');

            setTimeout(() => {
              setStatus('RAISING');
              let raiseY = 68;
              const raiseInterval = setInterval(() => {
                raiseY -= 4;
                setClawY(raiseY);
                if (raiseY <= 0) {
                  clearInterval(raiseInterval);
                  setStatus('IDLE');
                  setClawOpen(true);
                }
              }, 30);
            }, 300);
          }
        }, 400);
      }
    }, 30);
  };

  const renderPrizeGraphic = (type: Prize['type'], color: string) => {
    switch (type) {
      case 'yoyo':
        return (
          <div
            className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center shadow-md animate-bounce"
            style={{ backgroundColor: color }}
          >
            <div className="w-3 h-3 bg-white rounded-full border border-black" />
          </div>
        );
      case 'bear':
        return <div className="text-2xl filter drop-shadow">🧸</div>;
      case 'rocket':
        return <div className="text-2xl filter drop-shadow">🚀</div>;
      case 'dino':
        return <div className="text-2xl filter drop-shadow">🦖</div>;
      case 'capsule':
        return (
          <div className="w-7 h-8 rounded-t-full rounded-b-lg border-2 border-black flex flex-col overflow-hidden shadow-md">
            <div className="h-1/2 bg-purple-500" />
            <div className="h-1/2 bg-pink-400" />
          </div>
        );
      case 'cat':
        return <div className="text-2xl filter drop-shadow">🐱</div>;
      case 'star':
        return <div className="text-2xl filter drop-shadow">⭐</div>;
      case 'alien':
        return <div className="text-2xl filter drop-shadow">👾</div>;
      default:
        return <Gift className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <section
      id="arcade"
      className="bg-[#1A1A1A] py-12 sm:py-20 px-3 sm:px-6 border-y-4 border-[#101010] relative overflow-hidden text-white font-mono"
    >
      {/* Background Retro Grid Lines */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#FF6B6B 1px, transparent 1px), linear-gradient(90deg, #FF6B6B 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 bg-[#FF6B6B] text-white font-black text-xs uppercase px-3.5 py-1 rounded-full mb-2 tracking-widest shadow-md">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Pica Toys Interactive Arcade</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black uppercase text-[#FFD93D] mb-2 tracking-tight">
          Arcade Claw Machine
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm max-w-sm mx-auto mb-6 font-sans">
          Test your skill! Use the joystick or arrow keys to line up the claw over a prize and press GRAB!
        </p>

        {/* ARCADE CABINET CONTAINER — widens on desktop so the cabinet
            reads as a landscape display instead of a phone-booth
            stretched down the page. Every internal position (claw,
            prizes) is percentage-based against this container, so it
            scales without touching the game logic. */}
        <div className="max-w-sm sm:max-w-md lg:max-w-3xl mx-auto bg-[#252528] border-4 border-[#0F0F11] rounded-3xl p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
          
          {/* Top Marquee */}
          <div className="bg-[#121214] border-2 border-[#FFD93D] rounded-xl p-2.5 mb-3 shadow-[0_0_15px_rgba(255,217,61,0.3)] relative overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-ping" />
              <span className="text-base sm:text-lg font-black tracking-widest text-[#FFD93D] uppercase drop-shadow-[0_2px_0_#000]">
                PICA TOYS
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-black">
              <span className="text-[#6BCB77] bg-[#1A1A1A] px-2 py-0.5 rounded border border-white/10 text-[11px]">
                SCORE: {String(score).padStart(6, '0')}
              </span>
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="text-gray-400 hover:text-white cursor-pointer"
                title="Toggle SFX"
              >
                {soundOn ? <Volume2 className="w-4 h-4 text-[#FFD93D]" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* GLASS CHAMBER DISPLAY (Compact height) */}
          <div className="bg-gradient-to-b from-[#0d1b2a] via-[#1b263b] to-[#0d1b2a] border-4 border-[#333] rounded-2xl h-60 sm:h-72 relative overflow-hidden shadow-inner flex flex-col justify-between">
            
            {/* Scanlines Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-40" />

            {/* Top Motor Rail */}
            <div className="h-3.5 bg-[#444] border-b-2 border-black w-full relative z-10 flex items-center px-2">
              <div className="h-1.5 bg-[#FF6B6B] w-full opacity-60" />
            </div>

            {/* PRIZE CHUTE (Left Wall) */}
            <div className="absolute left-2 bottom-0 w-12 h-20 bg-[#111] border-2 border-[#FF6B6B] border-b-0 rounded-t-xl z-10 flex flex-col items-center justify-center p-1">
              <span className="text-[8px] font-black text-[#FF6B6B] uppercase tracking-tighter text-center leading-none mb-1">
                PRIZE PIT
              </span>
              <div className="w-8 h-10 bg-black/80 rounded border border-white/20 flex items-center justify-center">
                <PackageCheck className="w-4 h-4 text-[#FFD93D] animate-pulse" />
              </div>
            </div>

            {/* CLAW MECHANISM */}
            <div
              className="absolute top-3 transition-all duration-75 z-30"
              style={{
                left: `${clawX}%`,
                top: `${clawY * 0.65}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Hanging Rope/Chain */}
              <div
                className="w-1 bg-[#888] border-x border-black mx-auto"
                style={{ height: `${Math.max(10, clawY * 2.0)}px` }}
              />

              {/* Claw Motor Housing */}
              <div className="w-7 h-4 bg-[#FF6B6B] border-2 border-black rounded-sm mx-auto shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#FFD93D] rounded-full animate-ping" />
              </div>

              {/* Claw Arms */}
              <div className="flex justify-center -mt-0.5 gap-1">
                <div
                  className={`w-2 h-5 bg-[#BBB] border-2 border-black rounded-bl-lg transition-transform origin-top-right ${
                    clawOpen ? '-rotate-30' : 'rotate-12'
                  }`}
                />
                <div className="w-1 h-3.5 bg-[#555] border-x border-black" />
                <div
                  className={`w-2 h-5 bg-[#BBB] border-2 border-black rounded-br-lg transition-transform origin-top-left ${
                    clawOpen ? 'rotate-30' : '-rotate-12'
                  }`}
                />
              </div>

              {/* Attached Held Prize */}
              {heldPrize && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 animate-wiggle">
                  {renderPrizeGraphic(heldPrize.type, heldPrize.color)}
                </div>
              )}
            </div>

            {/* PRIZES ON FLOOR */}
            <div className="absolute bottom-2 left-14 right-2 h-16 flex items-end justify-around px-1 z-10">
              {prizes.map((p) => (
                <div
                  key={p.id}
                  className="absolute bottom-1 transition-all flex flex-col items-center group cursor-pointer"
                  style={{ left: `${p.xPercent}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="hover:scale-110 transition-transform">
                    {renderPrizeGraphic(p.type, p.color)}
                  </div>
                  <span className="text-[7px] font-black bg-black/80 text-white px-1 py-0.5 rounded border border-white/20 mt-0.5 opacity-80 whitespace-nowrap">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Status Marquee Banner at Glass Bottom */}
            <div className="bg-[#111] border-t border-white/20 p-1.5 text-center z-20">
              <span className="text-[11px] font-black text-[#FFD93D] tracking-wider uppercase animate-pulse">
                {message}
              </span>
            </div>
          </div>

          {/* LOWER CONTROL PANEL */}
          <div className="bg-[#1A1A1C] border-2 border-[#333] rounded-2xl p-3 mt-3 shadow-lg">
            
            {/* Coins Header Row */}
            <div className="flex items-center justify-between mb-3 bg-black/50 p-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#FFD93D]" />
                <span className="text-[11px] font-black text-white uppercase">
                  COINS: <span className="text-[#FFD93D] font-mono text-xs">{coins}</span>
                </span>
              </div>
              <button
                onClick={handleInsertCoin}
                className="bg-[#FFD93D] text-[#2D2D2D] font-black text-[10px] px-2.5 py-1 rounded-lg shadow-[0_2px_0_#D4A017] hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 uppercase"
              >
                <span>+ Coin</span>
              </button>
            </div>

            {/* JOYSTICK & GRAB BUTTON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              
              {/* DESKTOP CONTROLS: Arrow Buttons (Hidden on mobile, visible on sm+) */}
              <div className="hidden sm:flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                  Move Claw
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMoveLeft}
                    disabled={status !== 'IDLE'}
                    className="p-2.5 bg-[#333] hover:bg-[#444] text-white rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-40"
                    title="Move Left (Left Arrow)"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleMoveRight}
                    disabled={status !== 'IDLE'}
                    className="p-2.5 bg-[#333] hover:bg-[#444] text-white rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-40"
                    title="Move Right (Right Arrow)"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[8px] text-gray-500 mt-1">Use ← → Keys</span>
              </div>

              {/* MOBILE CONTROLS: Realistic Classic Arcade Joystick (Visible on mobile) */}
              <div className="flex sm:hidden flex-col items-center">
                <span className="text-[9px] font-bold text-[#FFD93D] mb-1 uppercase tracking-wider">
                  🕹️ Touch & Slide Joystick
                </span>
                
                <div className="flex items-center justify-center w-full my-1">
                  {/* Realistic Metallic Arcade Joystick Base Plate */}
                  <div
                    className="w-24 h-24 bg-[#151515] rounded-full border-4 border-[#0A0A0B] shadow-[inset_0_4px_8px_rgba(0,0,0,0.9),0_2px_4px_rgba(255,255,255,0.1)] relative flex items-center justify-center touch-none select-none cursor-pointer"
                    onTouchStart={(e) => {
                      if (status !== 'IDLE') return;
                      const touch = e.touches[0];
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      if (touch.clientX < centerX - 8) handleMoveLeft();
                      else if (touch.clientX > centerX + 8) handleMoveRight();
                    }}
                    onTouchMove={(e) => {
                      if (status !== 'IDLE') return;
                      const touch = e.touches[0];
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const deltaX = touch.clientX - centerX;
                      if (deltaX < -10) handleMoveLeft();
                      else if (deltaX > 10) handleMoveRight();
                    }}
                  >
                    {/* Mounting Washer / Collar */}
                    <div className="w-12 h-12 rounded-full bg-[#222] border-2 border-[#333] flex items-center justify-center shadow-inner">
                      {/* Chrome Metal Shaft & Red Ball Top Knob */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 via-red-500 to-red-300 border-2 border-black shadow-[0_4px_10px_rgba(0,0,0,0.9)] flex items-center justify-center transform active:-translate-x-2 active:rotate-[-25deg] transition-transform">
                        <div className="w-2.5 h-2.5 bg-white/70 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Grab Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={triggerGrab}
                  disabled={status !== 'IDLE'}
                  className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#E05252] text-white font-black text-lg uppercase tracking-wider rounded-2xl border-2 border-black shadow-[0_5px_0_#9E2B2B] hover:brightness-110 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD93D]" />
                  <span>GRAB!</span>
                </button>
                <span className="text-[8px] text-gray-500 mt-1">Tap or Press Space</span>
              </div>
            </div>
          </div>
        </div>

        {/* WIN MODAL OVERLAY */}
        {status === 'WIN_MODAL' && latestWonPrize && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-[#1A1A1C] border-4 border-[#FFD93D] rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center relative animate-bounce-short">
              <div className="w-14 h-14 bg-[#FFD93D] text-[#2D2D2D] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-2">
                <Trophy className="w-8 h-8" />
              </div>
              <span className="bg-[#FF6B6B] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block mb-1">
                {latestWonPrize.rarity} Drop Prize!
              </span>
              <h3 className="text-xl font-black text-white uppercase mb-1">
                {latestWonPrize.name}
              </h3>
              <p className="text-[11px] text-gray-300 font-bold mb-3">
                You won {latestWonPrize.name}! (+{latestWonPrize.points} PTS)
              </p>

              <div className="bg-black/50 p-3 rounded-xl border border-white/10 mb-4 flex justify-center">
                {renderPrizeGraphic(latestWonPrize.type, latestWonPrize.color)}
              </div>

              <button
                onClick={() => setStatus('IDLE')}
                className="w-full bg-[#FFD93D] text-[#2D2D2D] font-black py-2.5 rounded-xl shadow-[0_3px_0_#D4A017] hover:translate-y-0.5 transition-all uppercase cursor-pointer text-xs"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
