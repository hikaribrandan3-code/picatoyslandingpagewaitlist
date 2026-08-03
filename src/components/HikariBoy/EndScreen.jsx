import React from 'react';
import './EndScreen.css';

export default function EndScreen({ onPlayAgain }) {
  return (
    <div className="end-screen">
      <div className="end-screen-title">Thanks for playing!</div>
      <div className="end-screen-sub">Scan your next Pica toy for another game.</div>
      <button className="end-screen-play-again" onClick={onPlayAgain}>
        PLAY AGAIN
      </button>
    </div>
  );
}
