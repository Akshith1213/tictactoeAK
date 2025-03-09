import React, { useState } from 'react';
import './App.css';
import GameMode from './components/GameMode';
import LocalGame from './components/LocalGame';
import OnlineGame from './components/OnlineGame';
import { FaSun, FaMoon } from 'react-icons/fa';  // Add this import

function App() {
  const [gameMode, setGameMode] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {isDarkMode ? (
            <>
              <FaSun className="theme-icon" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <FaMoon className="theme-icon" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        
        {!gameMode && <GameMode onSelectMode={setGameMode} />}
        {gameMode === 'local' && <LocalGame />}
        {gameMode === 'online' && <OnlineGame />}
      </div>
    </div>
  );
}

export default App;