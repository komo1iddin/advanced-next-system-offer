#!/usr/bin/env node

/**
 * This script starts a Redis server using Docker for local development
 * Usage: node scripts/dev-redis.js
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const REDIS_CONTAINER_NAME = 'study-bridge-redis';
const REDIS_PORT = 6379;
const REDIS_DATA_DIR = path.join(__dirname, '../.redis-data');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Create Redis data directory if it doesn't exist
if (!fs.existsSync(REDIS_DATA_DIR)) {
  console.log(`${colors.yellow}Creating Redis data directory...${colors.reset}`);
  fs.mkdirSync(REDIS_DATA_DIR, { recursive: true });
}

// Check if Docker is installed
exec('docker --version', (error) => {
  if (error) {
    console.error(`${colors.red}Docker is not installed or not in PATH${colors.reset}`);
    console.error(`${colors.yellow}Please install Docker to use this script${colors.reset}`);
    process.exit(1);
  }
  
  // Check if Redis container is already running
  checkRedisContainer();
});

function checkRedisContainer() {
  exec(`docker ps -q -f "name=${REDIS_CONTAINER_NAME}"`, (error, stdout) => {
    if (error) {
      console.error(`${colors.red}Error checking Redis container:${colors.reset}`, error);
      process.exit(1);
    }
    
    if (stdout.trim()) {
      console.log(`${colors.green}Redis container is already running${colors.reset}`);
      showRedisInfo();
    } else {
      // Check if container exists but is not running
      exec(`docker ps -aq -f "name=${REDIS_CONTAINER_NAME}"`, (error, stdout) => {
        if (error) {
          console.error(`${colors.red}Error checking Redis container:${colors.reset}`, error);
          process.exit(1);
        }
        
        if (stdout.trim()) {
          console.log(`${colors.yellow}Starting existing Redis container...${colors.reset}`);
          startExistingContainer();
        } else {
          console.log(`${colors.yellow}Creating new Redis container...${colors.reset}`);
          createRedisContainer();
        }
      });
    }
  });
}

function startExistingContainer() {
  const startProcess = spawn('docker', ['start', REDIS_CONTAINER_NAME]);
  
  startProcess.stdout.on('data', (data) => {
    console.log(`${colors.green}${data.toString().trim()}${colors.reset}`);
  });
  
  startProcess.stderr.on('data', (data) => {
    console.error(`${colors.red}${data.toString().trim()}${colors.reset}`);
  });
  
  startProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`${colors.green}Redis container started successfully${colors.reset}`);
      showRedisInfo();
    } else {
      console.error(`${colors.red}Failed to start Redis container (exit code ${code})${colors.reset}`);
      process.exit(1);
    }
  });
}

function createRedisContainer() {
  // Create a new Redis container
  const dockerArgs = [
    'run',
    '--name', REDIS_CONTAINER_NAME,
    '-p', `${REDIS_PORT}:6379`,
    '-v', `${REDIS_DATA_DIR}:/data`,
    '-d',
    'redis:alpine',
    'redis-server',
    '--appendonly', 'yes'
  ];
  
  const dockerProcess = spawn('docker', dockerArgs);
  
  dockerProcess.stdout.on('data', (data) => {
    console.log(`${colors.green}${data.toString().trim()}${colors.reset}`);
  });
  
  dockerProcess.stderr.on('data', (data) => {
    console.error(`${colors.red}${data.toString().trim()}${colors.reset}`);
  });
  
  dockerProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`${colors.green}Redis container created and started successfully${colors.reset}`);
      showRedisInfo();
    } else {
      console.error(`${colors.red}Failed to create Redis container (exit code ${code})${colors.reset}`);
      process.exit(1);
    }
  });
}

function showRedisInfo() {
  console.log(`${colors.cyan}Redis Information:${colors.reset}`);
  console.log(`${colors.cyan}Container: ${colors.reset}${REDIS_CONTAINER_NAME}`);
  console.log(`${colors.cyan}Port: ${colors.reset}${REDIS_PORT}`);
  console.log(`${colors.cyan}Connection URL: ${colors.reset}redis://localhost:${REDIS_PORT}`);
  console.log(`${colors.cyan}Data directory: ${colors.reset}${REDIS_DATA_DIR}`);
  console.log(`${colors.cyan}---${colors.reset}`);
  console.log(`${colors.green}Redis is now ready to use in your application${colors.reset}`);
  console.log(`${colors.yellow}To stop Redis: ${colors.reset}docker stop ${REDIS_CONTAINER_NAME}`);
  console.log(`${colors.yellow}To view Redis logs: ${colors.reset}docker logs ${REDIS_CONTAINER_NAME}`);
  console.log(`${colors.yellow}To connect to Redis CLI: ${colors.reset}docker exec -it ${REDIS_CONTAINER_NAME} redis-cli`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Exiting Redis development script${colors.reset}`);
  console.log(`${colors.yellow}Note: Redis container will continue running in the background${colors.reset}`);
  console.log(`${colors.yellow}To stop it: ${colors.reset}docker stop ${REDIS_CONTAINER_NAME}`);
  process.exit(0);
}); 