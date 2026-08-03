import React, { useEffect, useMemo, useState } from 'react';
import './SlotMachine.css';

const REEL_COUNT = 3;
const STRIP_LEN = 18;
// One entry per reel: [duration, delay] in seconds — staggered so reels
// stop left-to-right, landing all three on the winner (~3s total).
const REEL_TIMING = [
  { duration: 1.8, delay: 0 },
  { duration: 2.3, delay: 0.15 },
  { duration: 2.8, delay: 0.3 },
];

function buildStrip(games, winner) {
  const strip = [];
  for (let i = 0; i < STRIP_LEN - 1; i++) {
    strip.push(games[Math.floor(Math.random() * games.length)]);
  }
  strip.push(winner);
  return strip;
}

export default function SlotMachine({ games, onLand }) {
  const winner = useMemo(() => games[Math.floor(Math.random() * games.length)], [games]);
  const strips = useMemo(
    () => Array.from({ length: REEL_COUNT }, () => buildStrip(games, winner)),
    [games, winner]
  );
  const [started, setStarted] = useState(false);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const lastReel = REEL_TIMING[REEL_TIMING.length - 1];
    const totalMs = (lastReel.duration + lastReel.delay) * 1000;
    const landTimer = setTimeout(() => setLanded(true), totalMs);
    const launchTimer = setTimeout(() => onLand(winner), totalMs + 500);
    return () => {
      clearTimeout(landTimer);
      clearTimeout(launchTimer);
    };
  }, [winner, onLand]);

  return (
    <div className="slot-machine">
      <div className="slot-title">{landed ? winner.name.toUpperCase() + '!' : 'SPINNING...'}</div>
      <div className={`slot-reels ${landed ? 'jackpot' : ''}`}>
        {strips.map((strip, reelIdx) => {
          const { duration, delay } = REEL_TIMING[reelIdx];
          return (
            <div className="slot-reel-window" key={reelIdx}>
              <div
                className="slot-reel-strip"
                style={{
                  transitionDuration: `${duration}s`,
                  transitionDelay: `${delay}s`,
                  transform: started
                    ? `translateY(-${(strip.length - 1) * 96}px)`
                    : 'translateY(0px)',
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
