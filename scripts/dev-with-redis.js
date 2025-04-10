#!/usr/bin/env node

/**
 * This script starts Redis using Docker and then runs the Next.js development server
 * with Redis-specific environment variables set.
 * 
 * Usage: node scripts/dev-with-redis.js
 */

const { spawn } = require('child_process');
const path = require('path');

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

console.log(`${colors.cyan}Starting development environment with Redis...${colors.reset}`);

// First start Redis
console.log(`${colors.yellow}Starting Redis...${colors.reset}`);
const redisScript = path.join(__dirname, 'dev-redis.js');

const redisProcess = spawn('node', [redisScript], {
  stdio: 'inherit',
});

redisProcess.on('error', (err) => {
  console.error(`${colors.red}Failed to start Redis:${colors.reset}`, err);
  process.exit(1);
});

// Give Redis a moment to start
setTimeout(() => {
  // Run Next.js dev server with Redis environment variables
  console.log(`${colors.green}Starting Next.js development server with Redis...${colors.reset}`);
  const nextDev = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Set Redis-specific environment variables
      REDIS_ENABLED: 'true',
      REDIS_URL: 'redis://localhost:6379',
      NODE_OPTIONS: '--max-old-space-size=4096',
    },
  });

  nextDev.on('close', (code) => {
    console.log(`${colors.yellow}Next.js development server exited with code ${code}${colors.reset}`);
    process.exit(code);
  });

  // Handle termination signals
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      console.log(`${colors.yellow}Shutting down development environment...${colors.reset}`);
      nextDev.kill(signal);
    });
  });
}, 2000); // 2 second delay to let Redis start up 