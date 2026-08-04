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
// Long enough to let the coin burst (up to 0.4s delay + 1.6s flight = 2.0s)
// and the JACKPOT banner fully play before the game launches underneath.
const LAND_PAUSE_MS = 2400;

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
    if (i === WINNER_INDEX) {
      strip.push(winner);
      continue;
    }
    // Avoid the same game landing on consecutive tiles — with a small
    // game pool, pure randomness produces visible back-to-back repeats
    // that read as a glitch rather than a real spinning reel.
    let pick;
    let attempts = 0;
    do {
      pick = games[Math.floor(Math.random() * games.length)];
      attempts++;
    } while (pick.id === strip[i - 1]?.id && attempts < 8);
    strip.push(pick);
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

// Single bright "coin" ping — used to build the cascade below.
function playCoinPing(startTime, freq, volume) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + 0.2);
}

// Cascade of rapid, ascending coin pings — layered on top of the land
// chime so the jackpot moment has real texture instead of one clean note.
// Timed to roughly overlap the coin-burst animation (~0.4-1.6s window).
function playCoinCascade() {
  const coinCount = 14;
  // Pentatonic-ish scale so random ordering still sounds musical.
  const notes = [1046, 1175, 1319, 1568, 1760, 2093];
  for (let i = 0; i < coinCount; i++) {
    const delayMs = 150 + i * (1300 / coinCount) + Math.random() * 40;
    setTimeout(() => {
      try {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const volume = 0.05 + Math.random() * 0.03;
        playCoinPing(audioCtx.currentTime, freq, volume);
      } catch (err) {
        // Ignore audio errors
      }
    }, delayMs);
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
  // onLand (the parent's launchGame) is a fresh function reference on every
  // parent re-render — it isn't wrapped in useCallback. Reading it through a
  // ref instead of a dependency keeps the landing timer immune to that: a
  // re-render can't reset an already-running 2.4s countdown.
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

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
  // easeInCubic packs ticks tight at the start (fast whir) and spreads
  // them out near the end (audible slowdown right as it locks in) —
  // the mirror image of the reel's own ease-out motion curve, so audio
  // and visual deceleration land in sync.
  useEffect(() => {
    if (!started) return;
    const totalMs = (SPIN_DELAY + SPIN_DURATION) * 1000;
    const tickCount = 30;
    const easeInCubic = (x) => x * x * x;
    const timers = [];
    for (let i = 1; i <= tickCount; i++) {
      const t = totalMs * easeInCubic(i / tickCount);
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
      playCoinCascade();
    }
    const launchTimer = setTimeout(() => onLandRef.current(winner), LAND_PAUSE_MS);
    return () => clearTimeout(launchTimer);
  }, [allLanded, winner]);

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
                    '--landed-y': `${targetY}px`,
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

        {allLanded && (
          <div className="pica-slots-status">{winner.name.toUpperCase() + '!'}</div>
        )}

        {allLanded && (
          <>
            <div className="pica-slots-jackpot-banner">
              <span>JACKPOT!</span>
            </div>
            {Array.from({ length: 28 }).map((_, i) => {
              const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
              const distance = 100 + Math.random() * 140;
              const tx = Math.cos(angle) * distance;
              const ty = Math.sin(angle) * distance;
              const delay = Math.random() * 0.4;
              const duration = 1.0 + Math.random() * 0.6;
              const coinStyle = {
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                '--delay': `${delay}s`,
                '--duration': `${duration}s`,
              };

              return (
                <div
                  key={`coin-${i}`}
                  className="pica-slots-coin"
                  style={coinStyle}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
