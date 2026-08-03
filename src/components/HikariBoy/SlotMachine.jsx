import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './SlotMachine.css';

const STRIP_LEN = 22;
// Winner sits second-to-last; one extra "peek" tile trails it so the
// window can show a sliver of the next tile past it, like a real wheel.
const WINNER_INDEX = STRIP_LEN - 2;
const SPIN_DURATION = 4.6; // seconds — lands right around the 5s mark
const SPIN_DELAY = 0.2;

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
  const strip = useMemo(() => buildStrip(games, winner), [games, winner]);
  const windowRef = useRef(null);
  const [tileWidth, setTileWidth] = useState(0);
  const [started, setStarted] = useState(false);
  const [landed, setLanded] = useState(false);

  // Landscape wheel: the window fills the screen, so the tile width is
  // measured from the real rendered box (1/3 of it — peek/center/peek)
  // instead of a guessed fixed px value.
  useLayoutEffect(() => {
    if (windowRef.current) {
      setTileWidth(windowRef.current.clientWidth / 3);
    }
  }, []);

  useEffect(() => {
    if (!tileWidth) return;
    const raf = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(raf);
  }, [tileWidth]);

  useEffect(() => {
    if (!landed) return;
    const launchTimer = setTimeout(() => onLand(winner), 600);
    return () => clearTimeout(launchTimer);
  }, [landed, winner, onLand]);

  const targetX = tileWidth ? -(WINNER_INDEX - 1) * tileWidth : 0;

  return (
    <div className="pica-slots">
      <div className="pica-slots-cabinet">
        <div className="pica-slots-header">
          {BRAND_LETTERS.map((l, i) => (
            <span key={i} style={{ color: l.color }}>{l.ch === ' ' ? ' ' : l.ch}</span>
          ))}
        </div>

        <div className="pica-slots-window" ref={windowRef}>
          {tileWidth > 0 && (
            <div
              className={`pica-slots-strip ${landed ? 'landed' : ''}`}
              style={{
                transitionDuration: `${SPIN_DURATION}s`,
                transitionDelay: `${SPIN_DELAY}s`,
                transform: started ? `translateX(${targetX}px)` : 'translateX(0px)',
              }}
              onTransitionEnd={(e) => {
                if (e.propertyName !== 'transform') return;
                setLanded(true);
              }}
            >
              {strip.map((g, i) => (
                <div className="pica-slots-tile" key={i} style={{ width: `${tileWidth}px` }}>
                  <img src={g.cover} alt={g.name} />
                  <div className="pica-slots-tile-label">{g.name}</div>
                </div>
              ))}
            </div>
          )}
          <div className={`pica-slots-highlight ${landed ? 'jackpot' : ''}`} />
        </div>

        <div className="pica-slots-status">{landed ? winner.name.toUpperCase() + '!' : 'SPINNING...'}</div>
      </div>
    </div>
  );
}
