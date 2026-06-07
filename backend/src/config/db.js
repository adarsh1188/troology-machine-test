const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB. Skipped automatically in the test environment,
 * where mongodb-memory-server manages the connection lifecycle.
 */
async function connectDB(uri = env.mongoUri) {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  // eslint-disable-next-line no-console
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
