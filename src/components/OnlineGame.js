import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../styles/OnlineGame.css';

const socket = io('http://localhost:3002');

const OnlineGame = () => {
  const [room, setRoom] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [winner, setWinner] = useState(null);  // Add winner state

  // Remove this first handleReset declaration
  // const handleReset = () => {
  //   socket.emit('resetGame', { roomId });
  // };

  useEffect(() => {
    socket.on('roomCreated', ({ roomId, player }) => {
      setRoomId(roomId);
      setPlayer(player);
      setIsMyTurn(player === 'X');
    });

    socket.on('roomJoined', ({ roomId, player }) => {
      setRoomId(roomId);
      setPlayer(player);
      setIsMyTurn(false);
    });

    socket.on('gameStart', ({ board }) => {
      setBoard(board);
      setGameStarted(true);
      setIsMyTurn(player === 'X'); // X always starts
    });

    socket.on('updateGame', ({ board, nextTurn, winner }) => {
      setBoard(board);
      setIsMyTurn(player === nextTurn);
      if (winner) {
        setWinner(winner);
        setGameStarted(false);
      }
    });

    socket.on('playerLeft', () => {
      setGameStarted(false);
      setRoomId(null);
      setPlayer(null);
      setBoard(Array(9).fill(null));
      setIsMyTurn(false);
      setWinner(null);  // Reset winner
    });

    socket.on('gameReset', ({ board, currentPlayer }) => {
      setBoard(board);
      setWinner(null);
      setGameStarted(true);
      setIsMyTurn(player === currentPlayer);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('gameStart');
      socket.off('updateGame');
      socket.off('playerLeft');
      socket.off('gameReset');
    };
  }, [player]);

  const handleCreateRoom = () => {
    socket.emit('createRoom');
  };

  const handleJoinRoom = () => {
    socket.emit('joinRoom', room);
  };

  const handleClick = (index) => {
    if (!board[index] && gameStarted && isMyTurn) {
      socket.emit('makeMove', { roomId, index, player });
    }
  };

  const handleReset = () => {
    socket.emit('resetGame', { roomId });
  };

  return (
    <div className="online-game">
      {!roomId ? (
        <div className="room-controls">
          <button className="create-room" onClick={handleCreateRoom}>
            Create Room
          </button>
          <div className="join-room">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={handleJoinRoom}>Join Room</button>
          </div>
        </div>
      ) : (
        <div className="game-area">
          <div className="game-info">
            <p className="room-id">Room ID: {roomId}</p>
            <p className="player-info">You are player: {player}</p>
            {winner ? (
              <p className="game-status">
                {winner === player ? "🎉 You won! 🎉" : "Game Over - Opponent won!"}
              </p>
            ) : (
              gameStarted && <p>{isMyTurn ? "Your turn" : "Opponent's turn"}</p>
            )}
            {!gameStarted && !winner && <p className="waiting">Waiting for another player...</p>}
          </div>
          <div className="board">
            {board.map((square, i) => (
              <button
                key={i}
                className={`square ${square ? 'marked' : ''}`}
                onClick={() => handleClick(i)}
                disabled={!!winner || !isMyTurn || !gameStarted}
              >
                {square}
              </button>
            ))}
          </div>
          {(winner || gameStarted) && (
            <button className="reset-button" onClick={handleReset}>
              Reset Game
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OnlineGame;
