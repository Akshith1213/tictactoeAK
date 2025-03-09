const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-frontend-url.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  socket.on('createRoom', () => {
    const roomId = Math.random().toString(36).substring(7);
    rooms.set(roomId, { 
      players: [socket.id], 
      board: Array(9).fill(null),
      currentPlayer: 'X'  // X starts first
    });
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, player: 'X' });
  });

  socket.on('joinRoom', (roomId) => {
    if (rooms.has(roomId) && rooms.get(roomId).players.length < 2) {
      const room = rooms.get(roomId);
      room.players.push(socket.id);
      socket.join(roomId);
      socket.emit('roomJoined', { roomId, player: 'O' });
      io.to(roomId).emit('gameStart', { 
        board: room.board,
        currentPlayer: 'X'  // X always starts
      });
    }
  });

  socket.on('resetGame', ({ roomId }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      // Reset the room state
      room.board = Array(9).fill(null);
      room.currentPlayer = 'X';
      
      // Notify all players about the reset
      io.to(roomId).emit('gameReset', {
        board: room.board,
        currentPlayer: 'X'
      });
    }
  });

  // Add this function at the top level
  function checkWinner(board) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
  
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
  
  // Update the makeMove handler
  socket.on('makeMove', ({ roomId, index, player }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (!room.board[index] && player === room.currentPlayer) {
        room.board[index] = player;
        const nextTurn = player === 'X' ? 'O' : 'X';
        room.currentPlayer = nextTurn;
        
        const winner = checkWinner(room.board);
        
        io.to(roomId).emit('updateGame', {
          board: room.board,
          nextTurn: nextTurn,
          winner: winner
        });
      }
    }
  });

  socket.on('disconnect', () => {
    rooms.forEach((value, key) => {
      if (value.players.includes(socket.id)) {
        io.to(key).emit('playerLeft');
        rooms.delete(key);
      }
    });
  });
});

server.listen(3002, () => {
  console.log('Server running on port 3002');
});
