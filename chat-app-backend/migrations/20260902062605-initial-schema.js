module.exports = {
  async up(db, client) {
    // Explicitly create collections
    await db.createCollection('users');
    await db.createCollection('conversations');
    await db.createCollection('messages');

    // Create unique index on email for users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },

  async down(db, client) {
    // Drop the collections if rolling back
    await db.collection('messages').drop().catch(() => {});
    await db.collection('conversations').drop().catch(() => {});
    await db.collection('users').drop().catch(() => {});
  }
};
