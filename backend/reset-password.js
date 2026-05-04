/**
 * One-time password reset script.
 * Run: node reset-password.js
 * 
 * Fill in EMAIL and NEW_PASSWORD below, then run it.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ─── FILL THESE IN ────────────────────────────────────────────────
const EMAIL        = 'your-email@example.com';   // ← email you forgot password for
const NEW_PASSWORD = 'NewPassword123';            // ← set any new password you want
// ──────────────────────────────────────────────────────────────────

async function resetPassword() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    const db   = mongoose.connection.db;
    const users = db.collection('users');

    // Check if user exists
    const user = await users.findOne({ email: EMAIL.toLowerCase() });
    if (!user) {
      console.log(`❌ No user found with email: ${EMAIL}`);
      console.log('\n📋 All registered emails:');
      const all = await users.find({}, { projection: { email: 1, name: 1 } }).toArray();
      all.forEach(u => console.log(`   • ${u.name} — ${u.email}`));
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Hash the new password
    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

    // Update in database
    await users.updateOne(
      { email: EMAIL.toLowerCase() },
      { $set: { password: hashed } }
    );

    console.log(`\n✅ Password reset successfully!`);
    console.log(`   Email    : ${EMAIL}`);
    console.log(`   New Pass : ${NEW_PASSWORD}`);
    console.log(`\n🔐 You can now log in with these credentials.`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetPassword();
