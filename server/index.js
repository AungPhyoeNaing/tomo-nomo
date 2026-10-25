const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { attachGame } = require('./game');

function createGameServer() {
  const app = express();
  const clientBuildPath = path.join(__dirname, '../dist');
  app.use(express.static(clientBuildPath));
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN?.split(',').map(origin => origin.trim()) || '*',
      methods: ['GET', 'POST']
    },
    maxHttpBufferSize: 32 * 1024
  });
  const game = attachGame(io);
  app.get(/^(.*)$/, (req, res) => res.sendFile(path.join(clientBuildPath, 'index.html')));
  server.on('close', game.dispose);
  return { server, io, game };
}

if (require.main === module) {
  const { server } = createGameServer();
  const port = process.env.PORT || 3080;
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use.` : error);
    process.exitCode = 1;
  });
  server.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = { createGameServer };
