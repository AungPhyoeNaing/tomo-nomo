const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const questions = require('./questions');
const path = require('path');

const app = express();
app.use(cors());

// Serve the Vite build from the repository root.
const clientBuildPath = path.join(__dirname, '../dist');
app.use(express.static(clientBuildPath));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// State management (in-memory)
const rooms = {};

const normalizeRoomId = (roomId) => String(roomId || '').toUpperCase().trim();
const sanitizeUsername = (name) => String(name || '').trim().slice(0, 30);

// Periodic reaper: Purge inactive/abandoned rooms older than 45 minutes
setInterval(() => {
  const now = Date.now();
  const maxIdleMs = 45 * 60 * 1000;
  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (!room.lastActivity || now - room.lastActivity > maxIdleMs) {
      console.log(`[Reaper] Purging idle room: ${roomId}`);
      delete rooms[roomId];
    }
  }
}, 10 * 60 * 1000);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle explicit leave (e.g. "Wrong Room")
  socket.on('leave_room', ({ roomId }) => {
    const cleanRoomId = normalizeRoomId(roomId);
    const room = rooms[cleanRoomId];
    if (room) {
      room.lastActivity = Date.now();
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        socket.leave(cleanRoomId);

        // An explicit leave abandons the current match. Reset the room so
        // the remaining player can start a fresh game with a new opponent.
        room.gameState = 'waiting';
        room.playerSelections = {};
        room.players.forEach(player => {
          player.score = 0;
          delete player.finished;
          delete player.answers;
        });

        if (room.players.length === 0) {
          delete rooms[cleanRoomId];
          return;
        }
        
        io.to(cleanRoomId).emit('room_data', {
          players: room.players,
          gameState: room.gameState
        });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find which room this socket is in
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        room.lastActivity = Date.now();
        // If game hasn't started (waiting), remove the player
        if (room.gameState === 'waiting') {
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            delete rooms[roomId];
          } else {
            // Notify remaining player (if any)
            io.to(roomId).emit('room_data', {
              players: room.players,
              gameState: room.gameState
            });
          }
        }
        break;
      }
    }
  });

  // Join a room
  socket.on('join_room', ({ username, roomId }) => {
    const cleanRoomId = normalizeRoomId(roomId);
    const cleanUsername = sanitizeUsername(username);

    if (!cleanRoomId || !cleanUsername) {
      socket.emit('error', 'Invalid room ID or username');
      return;
    }

    socket.join(cleanRoomId);
    
    if (!rooms[cleanRoomId]) {
      rooms[cleanRoomId] = {
        players: [],
        gameState: 'waiting', // waiting, selecting, playing, results
        questionsPool: [],
        playerSelections: {},
        lastActivity: Date.now()
      };
      
      // Select 60 random questions for this session
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      rooms[cleanRoomId].questionsPool = shuffled.slice(0, 60);
    }

    const room = rooms[cleanRoomId];
    room.lastActivity = Date.now();

    // Check if player already exists
    const existingPlayerIndex = room.players.findIndex(p => p.username === cleanUsername);
    
    // Room Full Check (if new player)
    if (existingPlayerIndex === -1 && room.players.length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    if (existingPlayerIndex !== -1) {
       // Update socket id for reconnecting player
       room.players[existingPlayerIndex].id = socket.id;
       
       // SYNC STATE FOR RECONNECTING PLAYER
       // 1. If selecting, send pool
       if (room.gameState === 'selecting') {
           socket.emit('game_start_selection', { questions: room.questionsPool });
       }
       // 2. If playing, send quiz data
       if (room.gameState === 'playing') {
           const opponent = room.players.find(p => p.username !== cleanUsername);
           if (opponent && room.playerSelections[opponent.username]) {
               socket.emit('start_quiz', {
                   opponentName: opponent.username,
                   questionsToAnswer: room.playerSelections[opponent.username].map(q => ({
                       id: q.id,
                       text: q.text,
                       options: q.options
                   }))
               });
           }
       }
       // 3. If results, send game over
       if (room.gameState === 'results') {
           socket.emit('game_over', { 
               players: room.players,
               selections: room.playerSelections
           });
       }

    } else {
       room.players.push({ id: socket.id, username: cleanUsername, score: 0 });
    }

    // Notify room of player update
    io.to(cleanRoomId).emit('room_data', {
      players: room.players,
      gameState: room.gameState
    });

    // If 2 players, start selection phase
    if (room.players.length === 2 && room.gameState === 'waiting') {
      room.gameState = 'selecting';
      io.to(cleanRoomId).emit('game_start_selection', {
        questions: room.questionsPool
      });
    }
  });

  // Handle question selection
  // User sends: { selectedQuestions: [{id, answer, text, options}] }
  socket.on('submit_selection', ({ roomId, selectedQuestions }) => {
    const cleanRoomId = normalizeRoomId(roomId);
    const room = rooms[cleanRoomId];
    if (!room) return;

    if (!Array.isArray(selectedQuestions) || selectedQuestions.length !== 10) {
      socket.emit('error', 'Must select exactly 10 questions.');
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    room.lastActivity = Date.now();
    room.playerSelections[player.username] = selectedQuestions;

    const player1 = room.players[0];
    const player2 = room.players[1];

    // Check if both players exist and have submitted their selections
    if (
      player1 && 
      player2 && 
      room.playerSelections[player1.username] && 
      room.playerSelections[player2.username]
    ) {
      room.gameState = 'playing';
      
      // Send cross questions: 
      // Player 1 receives Player 2's selected questions (without the answers)
      io.to(player1.id).emit('start_quiz', {
        opponentName: player2.username,
        questionsToAnswer: room.playerSelections[player2.username].map(q => ({
          id: q.id,
          text: q.text,
          options: q.options
        }))
      });

      // Send Player 2 receives Player 1's selected questions (without the answers)
      io.to(player2.id).emit('start_quiz', {
        opponentName: player1.username,
        questionsToAnswer: room.playerSelections[player1.username].map(q => ({
          id: q.id,
          text: q.text,
          options: q.options
        }))
      });
    } else {
        // Notify that we are waiting for the other player
        socket.emit('waiting_for_opponent');
    }
  });

  // Handle Answer Submission
  // User sends: { answers: [{ questionId, selectedOption }] }
  socket.on('submit_answers', ({ roomId, answers }) => {
    const cleanRoomId = normalizeRoomId(roomId);
    const room = rooms[cleanRoomId];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    const opponent = room.players.find(p => p.id !== socket.id);
    
    if (!player || !opponent) return;

    room.lastActivity = Date.now();

    // Calculate Score
    // The questions this player answered were selected by the opponent.
    // So we check against opponent's 'truth' (keyed by username)
    const opponentTruths = room.playerSelections[opponent.username] || [];
    let score = 0;

    if (Array.isArray(answers)) {
      answers.forEach(ans => {
        if (!ans) return;
        const truth = opponentTruths.find(q => q && (String(q.id) === String(ans.questionId) || q.id === ans.questionId));
        if (truth && truth.answer === ans.selectedOption) {
          score++;
        }
      });
    }

    player.score = score;
    player.finished = true;
    player.answers = Array.isArray(answers) ? answers : [];

    // Check if both finished
    const allFinished = room.players.every(p => p.finished);
    
    if (allFinished) {
        room.gameState = 'results';
        io.to(cleanRoomId).emit('game_over', {
            players: room.players,
            selections: room.playerSelections
        });
        
        // Cleanup room after 10 minutes to allow viewing results
        setTimeout(() => {
            if (rooms[cleanRoomId] && rooms[cleanRoomId].gameState === 'results') {
                delete rooms[cleanRoomId];
            }
        }, 10 * 60 * 1000); 
    } else {
        socket.emit('waiting_results');
    }
  });
});

// Handle React Routing, return all requests to React app
app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use.`);
    console.error(`   - If you are on aaPanel, the "Node Project" manager likely started this automatically.`);
    console.error(`   - To fix: Stop the project in aaPanel UI, or check what is using this port: "netstat -tunlp | grep ${PORT}"\n`);
    process.exit(1);
  } else {
    throw e;
  }
});
