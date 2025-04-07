import mongoose from 'mongoose';

// Connection string will be read from environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the mongoose global cache type
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Declare global mongoose cache
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
  cached = global.mongoose;
}

async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached.conn) {
    // Ensure all models are registered even when using cached connection
    require('./models/Province');
    require('./models/City');
    require('./models/University');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    const mongoose = await cached.promise;
    cached.conn = mongoose.connection;
    
    // Pre-load all model schemas to ensure they're registered
    require('./models/Province');
    require('./models/City');
    require('./models/University');
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 