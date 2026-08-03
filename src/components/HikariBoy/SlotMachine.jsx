import React, { useEffect, useMemo, useState } from 'react';
import './SlotMachine.css';

const REEL_COUNT = 3;
const STRIP_LEN = 22;
// One entry per reel: [duration, delay] in seconds — staggered so reels
// stop left-to-right, landing all three on the winner. Kids' attention
// spans want the suspense stretched, not rushed — lands around the 5s mark.
const REEL_TIMING = [
  { duration: 2.8, delay: 0 },
  { duration: 3.6, delay: 0.3 },
  { duration: 4.4, delay: 0.6 },
];

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
  for (let i = 0; i < STRIP_LEN - 1; i++) {
    strip.push(games[Math.floor(Math.random() * games.length)]);
  }
  strip.push(winner);
  return strip;
}

export default function SlotMachine({ games, onLand }) {
  const winner = useMemo(() => pickWinner(games), [games]);
  const strips = useMemo(
    () => Array.from({ length: REEL_COUNT }, () => buildStrip(games, winner)),
    [games, winner]
  );
  const [started, setStarted] = useState(false);
  const [reelLanded, setReelLanded] = useState([false, false, false]);
  const allLanded = reelLanded.every(Boolean);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!allLanded) return;
    const launchTimer = setTimeout(() => onLand(winner), 500);
    return () => clearTimeout(launchTimer);
  }, [allLanded, winner, onLand]);

  return (
    <div className="slot-machine">
      <div className="slot-title">{allLanded ? winner.name.toUpperCase() + '!' : 'SPINNING...'}</div>
      <div className={`slot-reels ${allLanded ? 'jackpot' : ''}`}>
        {strips.map((strip, reelIdx) => {
          const { duration, delay } = REEL_TIMING[reelIdx];
          return (
            <div className="slot-reel-window" key={reelIdx}>
              <div
                className={`slot-reel-strip ${reelLanded[reelIdx] ? 'landed' : ''}`}
                style={{
                  transitionDuration: `${duration}s`,
                  transitionDelay: `${delay}s`,
                  transform: started
                    ? `translateY(-${(strip.length - 1) * 84}px)`
                    : 'translateY(0px)',
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
                  <div className="slot-item" key={i}>
                    <img src={g.cover} alt={g.name} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
