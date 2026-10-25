const { randomBytes, randomInt } = require('crypto');
const questions = require('./questions');

const normalizeRoomId = value => typeof value === 'string' ? value.trim().toUpperCase() : '';
const isPayload = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isQuestionId = value => (typeof value === 'number' && Number.isInteger(value)) ||
  (typeof value === 'string' && /^\d{1,6}$/.test(value));

function pickQuestions() {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 60);
}

function attachGame(io) {
  const rooms = new Map();
  const timers = new Set();
  const cancelTimer = timer => { clearTimeout(timer); timers.delete(timer); };
  const publicPlayers = (room, includeAnswers = false) => room.players.map(player => ({
    id: player.id, username: player.username, connected: player.connected,
    score: includeAnswers ? player.score : 0,
    finished: Boolean(player.finished),
    ...(includeAnswers ? { answers: player.answers || [] } : {})
  }));
  const broadcastRoom = (roomId, room) => io.to(roomId).emit('room_data', {
    players: publicPlayers(room), gameState: room.gameState
  });
  const results = room => ({ players: publicPlayers(room, true), selections: room.playerSelections });
  const quiz = (room, player) => {
    const opponent = room.players.find(other => other !== player);
    return {
      opponentName: opponent.username,
      questionsToAnswer: room.playerSelections[opponent.username].map(({ id, text, options }) => ({ id, text, options }))
    };
  };
  const schedule = (callback, delay) => {
    const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timer.unref();
    timers.add(timer);
    return timer;
  };
  const expireRoom = (roomId, room) => {
    if (rooms.get(roomId) !== room) return;
    cancelTimer(room.resultsTimer);
    room.players.forEach(player => cancelTimer(player.disconnectTimer));
    io.to(roomId).emit('error', 'This room has expired. Please create a new room.');
    io.in(roomId).socketsLeave(roomId);
    rooms.delete(roomId);
  };
  const removePlayer = (roomId, room, player) => {
    cancelTimer(room.resultsTimer);
    room.resultsTimer = null;
    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      timers.delete(player.disconnectTimer);
    }
    room.players = room.players.filter(other => other !== player);
    room.lastActivity = Date.now();
    if (!room.players.length) { rooms.delete(roomId); return; }
    room.gameState = 'waiting';
    room.playerSelections = Object.create(null);
    room.players.forEach(other => { other.score = 0; other.finished = false; other.answers = []; });
    broadcastRoom(roomId, room);
  };
  const syncPlayer = (socket, room, player) => {
    if (room.gameState === 'selecting') {
      if (room.playerSelections[player.username]) socket.emit('waiting_for_opponent');
      else socket.emit('game_start_selection', { questions: room.questionsPool });
    } else if (room.gameState === 'playing') {
      if (player.finished) socket.emit('waiting_results');
      else socket.emit('start_quiz', quiz(room, player));
    } else if (room.gameState === 'results') socket.emit('game_over', results(room));
  };

  const reaper = setInterval(() => {
    for (const [roomId, room] of rooms) {
      if (Date.now() - room.lastActivity > 45 * 60 * 1000) expireRoom(roomId, room);
    }
  }, 60 * 1000);
  reaper.unref();

  io.on('connection', socket => {
    const fail = message => socket.emit('action_error', message);
    const membership = payload => {
      if (!isPayload(payload)) { fail('Invalid request.'); return null; }
      const roomId = normalizeRoomId(payload.roomId);
      const room = rooms.get(roomId);
      const player = room?.players.find(other => other.id === socket.id);
      if (!player || socket.data.roomId !== roomId) { fail('Please rejoin this room.'); return null; }
      return { roomId, room, player };
    };

    socket.on('join_room', payload => {
      if (!isPayload(payload)) { socket.emit('error', 'Invalid room request.'); return; }
      const roomId = normalizeRoomId(payload.roomId);
      const username = typeof payload.username === 'string' ? payload.username.trim() : '';
      if (!/^[A-Z0-9-]{1,32}$/.test(roomId) || !username || username.length > 30) {
        socket.emit('error', 'Use a room code of 1–32 letters, numbers or hyphens and a name of 1–30 characters.');
        return;
      }
      let room = rooms.get(roomId);
      if (!room) {
        if (rooms.size >= 1000) { socket.emit('error', 'Server is busy. Please try again later.'); return; }
        room = { players: [], gameState: 'waiting', questionsPool: pickQuestions(), playerSelections: Object.create(null), lastActivity: Date.now() };
      }
      let player = room.players.find(other => other.username === username);
      if (player && (typeof payload.resumeToken !== 'string' || payload.resumeToken !== player.resumeToken)) {
        socket.emit('error', 'That name is already in use. Choose another name.'); return;
      }
      if (!player && (room.players.length >= 2 || room.gameState !== 'waiting')) {
        socket.emit('error', 'Room is full'); return;
      }

      // Rejected clients never enter broadcasts; each socket owns one player slot.
      const previousRoomId = socket.data.roomId;
      if (previousRoomId && (previousRoomId !== roomId || !player || player.id !== socket.id)) {
        const previousRoom = rooms.get(previousRoomId);
        const previousPlayer = previousRoom?.players.find(other => other.id === socket.id);
        socket.leave(previousRoomId);
        if (previousPlayer) removePlayer(previousRoomId, previousRoom, previousPlayer);
      }
      if (player) {
        const oldSocket = io.sockets.sockets.get(player.id);
        if (oldSocket && oldSocket !== socket) {
          oldSocket.leave(roomId);
          oldSocket.data.roomId = undefined;
          oldSocket.emit('error', 'Your player session was resumed in another connection.');
        }
        if (player.disconnectTimer) {
          clearTimeout(player.disconnectTimer);
          timers.delete(player.disconnectTimer);
          player.disconnectTimer = null;
        }
        player.id = socket.id;
        player.connected = true;
      } else {
        player = { id: socket.id, username, score: 0, connected: true, resumeToken: randomBytes(32).toString('hex') };
        room.players.push(player);
      }
      rooms.set(roomId, room);
      room.lastActivity = Date.now();
      socket.data.roomId = roomId;
      socket.join(roomId);
      socket.emit('room_session', { roomId, username, resumeToken: player.resumeToken });
      const starting = room.players.length === 2 && room.gameState === 'waiting';
      if (starting) room.gameState = 'selecting';
      broadcastRoom(roomId, room);
      if (starting) io.to(roomId).emit('game_start_selection', { questions: room.questionsPool });
      else syncPlayer(socket, room, player);
    });

    socket.on('leave_room', (payload, acknowledge) => {
      const member = membership(payload);
      if (!member) return;
      const { roomId, room, player } = member;
      socket.leave(roomId);
      socket.data.roomId = undefined;
      removePlayer(roomId, room, player);
      if (typeof acknowledge === 'function') acknowledge();
    });

    socket.on('submit_selection', payload => {
      const member = membership(payload);
      if (!member) return;
      const { room, player } = member;
      if (room.gameState !== 'selecting') { fail('Question selection is closed.'); return; }
      if (room.playerSelections[player.username]) { socket.emit('waiting_for_opponent'); return; }
      const selected = payload.selectedQuestions;
      if (!Array.isArray(selected) || selected.length !== 10) { fail('Select exactly 10 questions.'); return; }
      const seen = new Set();
      const canonical = [];
      for (const entry of selected) {
        const question = isPayload(entry) && isQuestionId(entry.id) && room.questionsPool.find(q => String(q.id) === String(entry.id));
        if (!question || seen.has(question.id) || !question.options.includes(entry.answer)) {
          fail('Choose 10 different questions from this room and a valid answer for each.'); return;
        }
        seen.add(question.id);
        canonical.push({ ...question, answer: entry.answer });
      }
      room.playerSelections[player.username] = canonical;
      room.lastActivity = Date.now();
      if (room.players.length === 2 && room.players.every(other => room.playerSelections[other.username])) {
        room.gameState = 'playing';
        room.players.forEach(other => io.to(other.id).emit('start_quiz', quiz(room, other)));
      } else socket.emit('waiting_for_opponent');
    });

    socket.on('submit_answers', payload => {
      const member = membership(payload);
      if (!member) return;
      const { roomId, room, player } = member;
      if (room.gameState === 'results') { socket.emit('game_over', results(room)); return; }
      if (room.gameState !== 'playing') { fail('The quiz has not started.'); return; }
      if (player.finished) { socket.emit('waiting_results'); return; }
      const opponent = room.players.find(other => other !== player);
      const truths = room.playerSelections[opponent.username];
      if (!Array.isArray(payload.answers) || payload.answers.length !== truths.length) {
        fail('Answer each of the 10 questions exactly once.'); return;
      }
      const seen = new Set();
      const answers = [];
      let score = 0;
      for (const entry of payload.answers) {
        const truth = isPayload(entry) && isQuestionId(entry.questionId) && truths.find(q => String(q.id) === String(entry.questionId));
        if (!truth || seen.has(truth.id) || !truth.options.includes(entry.selectedOption)) {
          fail('Each answer must match a different quiz question and a valid option.'); return;
        }
        seen.add(truth.id);
        answers.push({ questionId: truth.id, selectedOption: entry.selectedOption });
        if (truth.answer === entry.selectedOption) score++;
      }
      player.answers = answers;
      player.score = score;
      player.finished = true;
      room.lastActivity = Date.now();
      if (room.players.every(other => other.finished)) {
        room.gameState = 'results';
        io.to(roomId).emit('game_over', results(room));
        room.resultsTimer = schedule(() => {
          if (room.gameState === 'results') expireRoom(roomId, room);
        }, 10 * 60 * 1000);
      } else socket.emit('waiting_results');
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      const room = rooms.get(roomId);
      const player = room?.players.find(other => other.id === socket.id);
      if (!player) return;
      player.connected = false;
      room.lastActivity = Date.now();
      broadcastRoom(roomId, room);
      player.disconnectTimer = schedule(() => {
        if (rooms.get(roomId) === room && !player.connected) removePlayer(roomId, room, player);
      }, 2 * 60 * 1000);
    });
  });

  return { dispose() { clearInterval(reaper); timers.forEach(clearTimeout); timers.clear(); } };
}

module.exports = { attachGame };
