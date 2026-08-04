import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './SlotMachine.css';
import { audioCtx } from './MunchboyBoot';

const REEL_COUNT = 3;
const STRIP_LEN = 22;
// Winner sits second-to-last; one extra "peek" tile trails it so the
// window can show a sliver of the next tile below it, like a real wheel.
const WINNER_INDEX = STRIP_LEN - 2;
const SPIN_DURATION = 4.6; // seconds — lands right around the 5s mark
const SPIN_DELAY = 0.2;
const LAND_PAUSE_MS = 500; // hold on the winning image before launching

// One winner per scan/session — a page reload should NOT reroll the game
// the kid already landed on. "Play Again" explicitly clears this to reroll.
export const ARCADE_WINNER_STORAGE_KEY = 'picaArcadeWinnerId';

function pickWinner(games) {
  const storedId = sessionStorage.getItem(ARCADE_WINNER_STORAGE_KEY);
  const stored = storedId && games.find((g) => g.id === storedId);
  if (stored) return stored;
  const picked = games[Math.floor(Math.random() * games.length)];
  sessionStorage.setItem(ARCADE_WINNER_STORAGE_KEY, picked.id);
  return picked;
}

function buildStrip(games, winner) {
  const strip = [];
  for (let i = 0; i < STRIP_LEN; i++) {
    strip.push(i === WINNER_INDEX ? winner : games[Math.floor(Math.random() * games.length)]);
  }
  return strip;
}

// Short percussive click, like a real wheel's ratchet tick.
function playTick(volume) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (err) {
    // Ignore audio errors (e.g. context not yet resumed)
  }
}

// Bright confirmation chime once the wheel lands.
function playLandChime() {
  try {
    const now = audioCtx.currentTime;
    [660, 880, 1320].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.12, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.3);
    });
  } catch (err) {
    // Ignore audio errors
  }
}

const BRAND_LETTERS = [
  { ch: 'P', color: '#FF4D8D' },
  { ch: 'I', color: '#FFC93C' },
  { ch: 'C', color: '#4DD5FF' },
  { ch: 'A', color: '#7CE87C' },
  { ch: ' ', color: 'transparent' },
  { ch: 'S', color: '#FF9F4D' },
  { ch: 'L', color: '#B98CFF' },
  { ch: 'O', color: '#FF4D8D' },
  { ch: 'T', color: '#4DD5FF' },
  { ch: 'S', color: '#7CE87C' },
];

export default function SlotMachine({ games, onLand }) {
  const winner = useMemo(() => pickWinner(games), [games]);
  const strips = useMemo(
    () => Array.from({ length: REEL_COUNT }, () => buildStrip(games, winner)),
    [games, winner]
  );
  const reelsRef = useRef(null);
  const [tileHeight, setTileHeight] = useState(0);
  const [started, setStarted] = useState(false);
  const [reelLanded, setReelLanded] = useState([false, false, false]);
  const allLanded = reelLanded.every(Boolean);
  const tickTimersRef = useRef([]);
  const chimedRef = useRef(false);

  // Fills the wide landscape cabinet: tile height is measured from the
  // real rendered reel box (1/3 of it — peek/center/peek) instead of a
  // guessed fixed px value.
  useLayoutEffect(() => {
    if (reelsRef.current) {
      setTileHeight(reelsRef.current.clientHeight / 3);
    }
  }, []);

  useEffect(() => {
    if (!tileHeight) return;
    const raf = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(raf);
  }, [tileHeight]);

  // Ticking sound that decelerates toward the landing, like a real wheel.
  useEffect(() => {
    if (!started) return;
    const totalMs = (SPIN_DELAY + SPIN_DURATION) * 1000;
    const tickCount = 30;
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
    const timers = [];
    for (let i = 1; i <= tickCount; i++) {
      const t = totalMs * easeOutCubic(i / tickCount);
      timers.push(setTimeout(() => playTick(0.06), t));
    }
    tickTimersRef.current = timers;
    return () => timers.forEach(clearTimeout);
  }, [started]);

  useEffect(() => {
    if (!allLanded) return;
    if (!chimedRef.current) {
      chimedRef.current = true;
      playLandChime();
    }
    const launchTimer = setTimeout(() => onLand(winner), LAND_PAUSE_MS);
    return () => clearTimeout(launchTimer);
  }, [allLanded, winner, onLand]);

  const targetY = tileHeight ? -(WINNER_INDEX - 1) * tileHeight : 0;

  return (
    <div className={`pica-slots ${allLanded ? 'jackpot-shake' : ''}`}>
      <div className={`pica-slots-cabinet ${started && !allLanded ? 'spinning' : ''} ${allLanded ? 'jackpot' : ''}`}>
        <div className="pica-slots-header">
          {BRAND_LETTERS.map((l, i) => (
            <span key={i} style={{ color: l.color }}>{l.ch === ' ' ? ' ' : l.ch}</span>
          ))}
        </div>

        <div className="pica-slots-reels" ref={reelsRef}>
          {strips.map((strip, reelIdx) => (
            <div className="pica-slots-reel-window" key={reelIdx}>
              {tileHeight > 0 && (
                <div
                  className={`pica-slots-strip ${reelLanded[reelIdx] ? 'landed' : ''}`}
                  style={{
                    transitionDuration: `${SPIN_DURATION}s`,
                    transitionDelay: `${SPIN_DELAY + reelIdx * 0.2}s`,
                    transform: started ? `translateY(${targetY}px)` : 'translateY(0px)',
                  }}
                  onTransitionEnd={(e) => {
                    if (e.propertyName !== 'transform') return;
                    setReelLanded((prev) => {
                      const next = [...prev];
                      next[reelIdx] = true;
                      return next;
                    });
                  }}
                >
                  {strip.map((g, i) => (
                    <div
                      className={`pica-slots-tile ${reelLanded[reelIdx] && i === WINNER_INDEX ? 'winner-tile' : ''}`}
                      key={i}
                      style={{ height: `${tileHeight}px` }}
                    >
                      <img src={g.cover} alt={g.name} />
                      <div className="pica-slots-tile-label">{g.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className={`pica-slots-highlight ${allLanded ? 'jackpot' : ''}`} />
        </div>

        <div className="pica-slots-status">{allLanded ? winner.name.toUpperCase() + '!' : 'SPINNING...'}</div>

        {allLanded && (
          <div className="pica-slots-jackpot-banner">
            <span>JACKPOT!</span>
          </div>
        )}
      </div>
    </div>
  );
}
