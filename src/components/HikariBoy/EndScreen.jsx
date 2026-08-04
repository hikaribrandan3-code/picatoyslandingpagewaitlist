import React from 'react';
import './EndScreen.css';

export default function EndScreen({ wonGame, onPlayAgain }) {
  return (
    <div className="end-screen">
      <div className="end-screen-cabinet">
        <div className="end-screen-header">
          <span>P</span><span>I</span><span>C</span><span>A</span>{' '}
          <span> </span>
          <span>S</span><span>L</span><span>O</span><span>T</span><span>S</span>
        </div>

        {wonGame && (
          <div className="end-screen-prize">
            <div className="end-screen-prize-frame">
              <img src={wonGame.cover} alt={wonGame.name} />
            </div>
            <div className="end-screen-prize-label">{wonGame.name}</div>
          </div>
        )}

        <div className="end-screen-banner">
          <span>Thanks for playing!</span>
        </div>

        <div className="end-screen-sub">Scan your next Pica toy for another game.</div>

        <button className="end-screen-play-again" onClick={onPlayAgain}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
