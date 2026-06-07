const { Server } = require('socket.io');
const env = require('./env');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
