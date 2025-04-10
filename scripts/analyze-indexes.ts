#!/usr/bin/env ts-node
/**
 * This script analyzes index usage and efficiency for MongoDB collections
 * 
 * Usage:
 * npx ts-node scripts/analyze-indexes.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { logService } from '../lib/services/LogService';

config();

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('MongoDB URI is required!');
  process.exit(1);
}

async function analyzeIndexes() {
  try {
    logService.info('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    logService.info('Connected to MongoDB successfully');

    // Get the database
    const db = mongoose.connection.db;
    
    if (!db) {
      logService.error('Failed to access database');
      return;
    }
    
    // Get collections
    const collections = await db.listCollections().toArray();
    
    logService.info(`Found ${collections.length} collections`);
    
    for (const collection of collections) {
      const collName = collection.name;
      
      // Skip system collections
      if (collName.startsWith('system.')) continue;
      
      logService.info(`Analyzing indexes for collection: ${collName}`);
      
      // Get indexes for the collection
      const coll = db.collection(collName);
      const indexes = await coll.indexes();
      
      logService.info(`Found ${indexes.length} indexes for ${collName}`, { indexes });
      
      // Get index statistics
      const stats = await db.command({ 
        aggregate: collName,
        pipeline: [
          { $indexStats: {} },
          { $sort: { 'accesses.ops': -1 } }
        ],
        cursor: {}
      });
      
      if (stats.cursor && stats.cursor.firstBatch) {
        if (stats.cursor.firstBatch.length === 0) {
          logService.warn(`No index statistics available for ${collName}. This could mean indexes aren't being used.`);
        } else {
          logService.info(`Index usage statistics for ${collName}:`, { 
            indexStats: stats.cursor.firstBatch 
          });
        }
      }
      
      // Analyze document count
      const documentCount = await coll.countDocuments();
      logService.info(`Collection ${collName} has ${documentCount} documents`);
      
      // If this is the StudyOffer collection, provide some specific analysis
      if (collName === 'studyOffers') {
        // Examine index size and efficiency
        const collStats = await db.command({ collStats: collName });
        logService.info(`Collection stats for ${collName}:`, {
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          storageSize: collStats.storageSize,
          totalIndexSize: collStats.totalIndexSize,
          indexSizes: collStats.indexSizes
        });
        
        // Provide recommendations
        const indexSizeToDataRatio = collStats.totalIndexSize / collStats.size;
        if (indexSizeToDataRatio > 0.5) {
          logService.warn(`Index size to data ratio is high (${indexSizeToDataRatio.toFixed(2)}). Consider removing unused indexes.`);
        }
        
        // Check for unused indexes
        stats.cursor.firstBatch.forEach((stat: any) => {
          if (stat.accesses.ops === 0 && stat.name !== '_id_') {
            logService.warn(`Index ${stat.name} has never been used. Consider removing it if it's been deployed for a while.`);
          }
        });
      }
    }
    
    logService.info('Index analysis complete');
  } catch (error) {
    logService.error('Error analyzing indexes:', error);
  } finally {
    await mongoose.disconnect();
    logService.info('Disconnected from MongoDB');
  }
}

// Run the analysis
analyzeIndexes()
  .then(() => process.exit(0))
  .catch((error) => {
    logService.error('Fatal error:', error);
    process.exit(1);
  }); 