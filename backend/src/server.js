const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');

async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
