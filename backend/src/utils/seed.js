/* eslint-disable no-console */
const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');

async function seed() {
  await connectDB();

  // Admin
  let admin = await User.findOne({ email: env.seedAdmin.email });
  if (!admin) {
    admin = await User.create({
      name: env.seedAdmin.name,
      email: env.seedAdmin.email,
      password: env.seedAdmin.password,
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email} / ${env.seedAdmin.password}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${admin.email}`);
  }

  // Sample users (credentials sourced from .env)
  const users = [];
  for (const u of env.seedUsers) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create(u);
      console.log(`✅ User created: ${user.email} / ${u.password}`);
    }
    users.push(user);
  }

  // Sample projects
  const count = await Project.countDocuments();
  if (count === 0) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    await Project.create([
      {
        title: 'Website Redesign',
        description: 'Revamp the marketing website with a new design system.',
        startDate: new Date(now - 5 * day),
        endDate: new Date(now + 3 * day),
        status: 'In-Progress',
        assignedUsers: [users[0]._id],
        createdBy: admin._id,
      },
      {
        title: 'Mobile App Launch',
        description: 'Ship the v1 of the mobile application to stores.',
        startDate: new Date(now - 10 * day),
        endDate: new Date(now + 20 * day),
        status: 'Pending',
        assignedUsers: [users[0]._id, users[1]._id],
        createdBy: admin._id,
      },
      {
        title: 'Q2 Analytics Report',
        description: 'Compile and present the Q2 analytics report.',
        startDate: new Date(now - 30 * day),
        endDate: new Date(now - 2 * day),
        status: 'Completed',
        assignedUsers: [users[1]._id],
        createdBy: admin._id,
      },
    ]);
    console.log('✅ Sample projects created');
  } else {
    console.log('ℹ️  Projects already exist, skipping');
  }

  await disconnectDB();
  console.log('🌱 Seeding complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
