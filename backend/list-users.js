/**
 * Lists all users in the database (name + email only).
 * Passwords are bcrypt hashed — they cannot be read by anyone.
 * Run: node list-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function listUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGO_URI);

    const users = await mongoose.connection.db
      .collection('users')
      .find({}, { projection: { name: 1, email: 1, createdAt: 1 } })
      .toArray();

    if (users.length === 0) {
      console.log('📭 No users registered yet.');
    } else {
      console.log(`👥 Found ${users.length} user(s):\n`);
      console.log('─'.repeat(50));
      users.forEach((u, i) => {
        console.log(`${i + 1}. Name  : ${u.name}`);
        console.log(`   Email : ${u.email}`);
        console.log(`   Joined: ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log('─'.repeat(50));
      });
    }

    console.log('\n🔒 Passwords are bcrypt hashed and cannot be read.');
    console.log('   Use reset-password.js to reset a password if needed.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
