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
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
  isConnecting: boolean;
}

// Declare global mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose || { conn: null, promise: null, isConnecting: false };

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null, isConnecting: false };
  cached = global.mongoose;
}

// Connection options with optimized settings
const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  family: 4, // Force IPv4
};

/**
 * Connects to MongoDB database with retry mechanism
 * @param {number} retries - Number of retry attempts, defaults to 3
 * @returns {Promise<mongoose.Connection>} - Mongoose connection
 */
async function connectToDatabase(retries = 3): Promise<mongoose.Connection> {
  // If we have a connection already, use it
  if (cached.conn) {
    // Ensure all models are registered even when using cached connection
    require('./models/Province');
    require('./models/City');
    require('./models/University');
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (cached.isConnecting && cached.promise) {
    try {
      const mongooseInstance = await cached.promise;
      return mongooseInstance.connection;
    } catch (error) {
      console.error('Error waiting for existing connection:', error);
      // Reset connection state to allow a retry
      cached.isConnecting = false;
      cached.promise = null;
    }
  }

  // Start new connection attempt
  cached.isConnecting = true;

  try {
    if (!cached.promise) {
      console.log('Connecting to MongoDB Atlas...');
      cached.promise = mongoose.connect(MONGODB_URI, connectionOptions);
    }

    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance.connection;
    cached.isConnecting = false;
    
    // Set up event listeners for connection status
    if (cached.conn) {
      cached.conn.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      cached.conn.on('disconnected', () => {
        console.warn('MongoDB disconnected. Reconnecting...');
        cached.conn = null;
        cached.promise = null;
        cached.isConnecting = false;
      });
    }
    
    console.log('MongoDB connected successfully');
    
    // Pre-load all model schemas to ensure they're registered
    require('./models/Province');
    require('./models/City');
    require('./models/University');
    
    if (!cached.conn) {
      throw new Error('Failed to establish MongoDB connection');
    }
    
    return cached.conn;
  } catch (error) {
    cached.isConnecting = false;
    cached.promise = null;
    
    console.error(`MongoDB connection error (Attempt ${4 - retries}/3):`, error);
    
    // Retry logic with exponential backoff
    if (retries > 0) {
      const backoffTime = Math.pow(2, 4 - retries) * 1000; // Exponential backoff
      console.log(`Retrying connection in ${backoffTime}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return connectToDatabase(retries - 1);
    }
    
    throw new Error('Failed to connect to MongoDB after multiple attempts');
  }
}

export default connectToDatabase; 