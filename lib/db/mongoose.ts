import mongoose from 'mongoose';

class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: mongoose.Connection | null = null;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
      }

      // Configure connection options
      const options: mongoose.ConnectOptions = {
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        minPoolSize: 5,  // Minimum number of connections in the connection pool
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000, // Timeout for socket operations
        family: 4, // Use IPv4
        retryWrites: true, // Enable retryable writes
        retryReads: true, // Enable retryable reads
      };

      // Create connection
      this.connection = await mongoose.createConnection(MONGODB_URI, options);

      // Set up event listeners
      this.connection.on('connected', () => {
        this.isConnected = true;
        console.log('MongoDB connected successfully');
      });

      this.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        await this.close();
        process.exit(0);
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.isConnected = false;
      this.connection = null;
    }
  }

  getConnection(): mongoose.Connection {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }
    return this.connection;
  }

  async withTransaction<T>(callback: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
    const session = await this.getConnection().startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await callback(session);
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  isConnectionEstablished(): boolean {
    return this.isConnected;
  }
}

export const dbManager = DatabaseManager.getInstance(); 