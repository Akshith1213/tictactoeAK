import React from 'react';
import '../styles/GameMode.css';

const GameMode = ({ onSelectMode }) => {
  return (
    <div className="game-mode">
      <h1>Choose Game Mode</h1>
      <button 
        className="mode-button local" 
        onClick={() => onSelectMode('local')}
      >
        Local Game
      </button>
      <button 
        className="mode-button online" 
        onClick={() => onSelectMode('online')}
      >
        Online Game
      </button>
    </div>
  );
};

export default GameMode;