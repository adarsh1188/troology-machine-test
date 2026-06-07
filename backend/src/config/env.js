require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pms',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  maxAttachments: parseInt(process.env.MAX_ATTACHMENTS || '3', 10),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'Super Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@pms.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
  },
  seedUsers: [
    {
      name: process.env.SEED_USER1_NAME || 'Alice Johnson',
      email: process.env.SEED_USER1_EMAIL || 'alice@pms.com',
      password: process.env.SEED_USER1_PASSWORD || 'User@123',
      role: 'user',
    },
    {
      name: process.env.SEED_USER2_NAME || 'Bob Smith',
      email: process.env.SEED_USER2_EMAIL || 'bob@pms.com',
      password: process.env.SEED_USER2_PASSWORD || 'User@123',
      role: 'user',
    },
  ],
};

module.exports = env;
