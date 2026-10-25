import { test } from 'node:test';
import assert from 'node:assert/strict';
import { io as connect } from 'socket.io-client';
import serverModule from '../server/index.js';

function next(socket, event) {
  return new Promise((resolve, reject) => {
    const handler = value => { clearTimeout(timer); resolve(value); };
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timed out waiting for ${event}`));
    }, 4000);
    socket.once(event, handler);
  });
}

async function fixture(t) {
  const { server, io } = serverModule.createGameServer();
  const clients = [];
  t.after(async () => {
    clients.forEach(client => client.disconnect());
    await new Promise(resolve => io.close(resolve));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const client = async (transports = ['websocket']) => {
    const socket = connect(`http://127.0.0.1:${server.address().port}`, { autoConnect: false, reconnection: false, transports });
    clients.push(socket);
    const ready = next(socket, 'connect');
    socket.on('connect_error', error => t.diagnostic(`Socket connection failed: ${error.message}. Local loopback access is required.`));
    socket.connect();
    await ready;
    return socket;
  };
  const join = async (socket, username, resumeToken, roomId = 'TEST-123') => {
    const ready = next(socket, 'room_session');
    socket.emit('join_room', { username, roomId, resumeToken });
    return ready;
  };
  const a = await client();
  const aSession = await join(a, 'Alice');
  const b = await client();
  const poolReady = next(a, 'game_start_selection');
  const bSession = await join(b, 'Bob');
  const { questions } = await poolReady;
  const truths = questions.slice(0, 10).map(q => ({ ...q, answer: q.options[0] }));
  const playing = async () => {
    const waiting = next(a, 'waiting_for_opponent');
    a.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: truths });
    await waiting;
    const startA = next(a, 'start_quiz');
    const startB = next(b, 'start_quiz');
    b.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: truths });
    return Promise.all([startA, startB]);
  };
  const answers = truths.map(q => ({ questionId: q.id, selectedOption: q.answer }));
  return { server, io, client, join, a, b, aSession, bSession, truths, playing, answers };
}

test('rejected full-room clients and impersonators never subscribe or receive secrets', async t => {
  const f = await fixture(t);
  const outsider = await f.client();
  let rejected = next(outsider, 'error');
  outsider.emit('join_room', { username: 'Eve', roomId: 'TEST-123' });
  assert.match(await rejected, /full/);
  assert.equal(f.io.sockets.adapter.rooms.get('TEST-123').has(outsider.id), false);
  rejected = next(outsider, 'error');
  outsider.emit('join_room', { username: 'Alice', roomId: 'TEST-123' });
  assert.match(await rejected, /name is already in use/);
  const update = next(f.a, 'room_data');
  await f.join(f.b, 'Bob', f.bSession.resumeToken);
  const room = await update;
  assert.equal(JSON.stringify(room).includes('resumeToken'), false);
  assert.equal(JSON.stringify(room).includes('answers'), false);
});

test('malformed events return errors and leave the server usable', async t => {
  const f = await fixture(t);
  for (const [event, errorEvent] of [['join_room', 'error'], ['leave_room', 'action_error'], ['submit_selection', 'action_error'], ['submit_answers', 'action_error']]) {
    for (const payload of [null, undefined, [], 'invalid']) {
      const error = next(f.a, errorEvent);
      f.a.emit(event, payload);
      assert.equal(typeof await error, 'string');
    }
  }
  await f.playing();
});

test('selection rejects duplicates, unknown IDs and invalid options; server owns question text', async t => {
  const f = await fixture(t);
  for (const bad of [
    Array(10).fill(f.truths[0]),
    f.truths.map((q, i) => i ? q : { ...q, id: 'missing' }),
    f.truths.map((q, i) => i ? q : { ...q, id: { toString: null } }),
    f.truths.map((q, i) => i ? q : { ...q, answer: 'invalid' }),
    f.truths.map((q, i) => i ? q : null)
  ]) {
    const error = next(f.a, 'action_error');
    f.a.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: bad });
    await error;
  }
  const waiting = next(f.a, 'waiting_for_opponent');
  f.a.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths.map(q => ({ ...q, text: 'forged', options: ['forged'] })) });
  await waiting;
  const start = next(f.b, 'start_quiz');
  f.b.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths });
  const quiz = await start;
  assert.equal(quiz.questionsToAnswer[0].text, f.truths[0].text);
  assert.equal('answer' in quiz.questionsToAnswer[0], false);
});

test('answers require the playing phase and cannot inflate or overwrite scores', async t => {
  const f = await fixture(t);
  let error = next(f.a, 'action_error');
  f.a.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  assert.match(await error, /not started/);
  await f.playing();
  for (const bad of [Array(100).fill(f.answers[0]), Array(10).fill(f.answers[0]), f.answers.slice(1), f.answers.map((a, i) => i ? a : { ...a, selectedOption: 'invalid' }), f.answers.map((a, i) => i ? a : { ...a, questionId: { toString: null } })]) {
    error = next(f.a, 'action_error');
    f.a.emit('submit_answers', { roomId: 'TEST-123', answers: bad });
    await error;
  }
  let waiting = next(f.a, 'waiting_results');
  f.a.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  await waiting;
  waiting = next(f.a, 'waiting_results');
  f.a.emit('submit_answers', { roomId: 'TEST-123', answers: [] });
  await waiting;
  const finished = next(f.a, 'game_over');
  f.b.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  const result = await finished;
  assert.deepEqual(result.players.map(p => p.score), [10, 10]);
  assert.equal(JSON.stringify(result).includes('resumeToken'), false);
});

test('token resumes a submitted player in the correct waiting phase, including results', async t => {
  const f = await fixture(t);
  const waiting = next(f.a, 'waiting_for_opponent');
  f.a.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths });
  await waiting;
  f.a.disconnect();
  const resumed = await f.client();
  const restored = next(resumed, 'waiting_for_opponent');
  await f.join(resumed, 'Alice', f.aSession.resumeToken);
  await restored;
  const start = next(resumed, 'start_quiz');
  f.b.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths });
  await start;
  const finished = next(resumed, 'waiting_results');
  resumed.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  await finished;
  const stillWaiting = next(resumed, 'waiting_results');
  await f.join(resumed, 'Alice', f.aSession.resumeToken);
  await stillWaiting;
  const over = next(resumed, 'game_over');
  f.b.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  await over;
  const restoredResults = next(resumed, 'game_over');
  await f.join(resumed, 'Alice', f.aSession.resumeToken);
  assert.equal((await restoredResults).players[0].score, 10);
});

test('changing rooms removes old membership and permits a fresh opponent', async t => {
  const f = await fixture(t);
  const reset = next(f.b, 'room_data');
  await f.join(f.a, 'Alice', undefined, 'OTHER-123');
  assert.equal((await reset).gameState, 'waiting');
  assert.equal(f.io.sockets.adapter.rooms.get('TEST-123').has(f.a.id), false);
  const replacement = await f.client();
  const start = next(f.b, 'game_start_selection');
  await f.join(replacement, '__proto__');
  await start;
  const waiting = next(replacement, 'waiting_for_opponent');
  replacement.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths });
  await waiting;
});

test('leaving after results resets scores and permits another complete match', async t => {
  const f = await fixture(t);
  await f.playing();
  const waiting = next(f.a, 'waiting_results');
  f.a.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  await waiting;
  const over = next(f.a, 'game_over');
  f.b.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  await over;
  const reset = next(f.a, 'room_data');
  await new Promise((resolve, reject) => {
    f.b.timeout(1000).emit('leave_room', { roomId: 'TEST-123' }, error => error ? reject(error) : resolve());
  });
  const lobby = await reset;
  assert.equal(lobby.gameState, 'waiting');
  assert.equal(lobby.players[0].score, 0);
  assert.equal(lobby.players[0].finished, false);
  const c = await f.client();
  const selecting = next(f.a, 'game_start_selection');
  await f.join(c, 'Charlie');
  await selecting;
  const ready = next(f.a, 'waiting_for_opponent');
  f.a.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths });
  await ready;
  const start = next(f.a, 'start_quiz');
  c.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths });
  await start;
  const waitingAgain = next(f.a, 'waiting_results');
  f.a.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  await waitingAgain;
  const done = next(f.a, 'game_over');
  c.emit('submit_answers', { roomId: 'TEST-123', answers: f.answers });
  assert.deepEqual((await done).players.map(player => player.score), [10, 10]);
});

test('HTTP polling fallback connects and unrelated sockets cannot submit to another room', async t => {
  const f = await fixture(t);
  const pollingClient = await f.client(['polling']);
  await f.join(pollingClient, 'Polling', undefined, 'POLLING-123');
  assert.equal(pollingClient.io.engine.transport.name, 'polling');
  const denied = next(pollingClient, 'action_error');
  pollingClient.emit('submit_selection', { roomId: 'TEST-123', selectedQuestions: f.truths });
  assert.match(await denied, /rejoin/);
  await f.playing();
});
