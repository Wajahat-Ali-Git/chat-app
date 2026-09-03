require('dotenv').config();

const config = {
  mongodb: {
    url: process.env.MONGO_URI || "mongodb://localhost:27017",
    
    // In migrate-mongo, databaseName is required, but if it's already part of the URL (like in Atlas), 
    // it can cause issues or warnings if specified differently. We extract it from the URI if possible.
    // However, an easy way is to let the URI handle the DB name by setting it here, or parsing it.
    // For simplicity, many configs just set a default name, but let's parse it from MONGO_URI if possible,
    // or just leave it empty and let Mongoose style URI connect. 
    // migrate-mongo expects databaseName to be provided.
    databaseName: process.env.MONGO_URI ? process.env.MONGO_URI.split('/').pop().split('?')[0] : "chat-app",

    options: {
      // You can add mongoose connection options here if needed
      // useNewUrlParser: true, 
      // useUnifiedTopology: true,
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir 
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
};

module.exports = config;
