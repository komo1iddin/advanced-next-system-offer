#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
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

console.log(`${colors.cyan}Starting development environment...${colors.reset}`);

// First start Redis
console.log(`${colors.yellow}Starting Redis...${colors.reset}`);
const redisScript = path.join(__dirname, 'scripts', 'dev-redis.js');

if (fs.existsSync(redisScript)) {
  const redisProcess = spawn('node', [redisScript], {
    stdio: 'inherit',
  });

  redisProcess.on('error', (err) => {
    console.error(`${colors.red}Failed to start Redis:${colors.reset}`, err);
  });
  
  // No need to wait for Redis process to complete since it runs in Docker
} else {
  console.warn(`${colors.yellow}Redis script not found, skipping Redis initialization${colors.reset}`);
}

// Increase the file descriptor limit for this process
try {
  // macOS specific - increase open files limit for this process
  if (process.platform === 'darwin') {
    const { execSync } = require('child_process');
    try {
      // Try to increase file descriptor limit
      console.log(`${colors.yellow}Attempting to increase file descriptor limit...${colors.reset}`);
      execSync('ulimit -n 10240', { shell: true });
      
      // Check if watchman is running
      execSync('watchman watch-list', { stdio: 'ignore' });
    } catch (e) {
      // Start watchman if it's not running
      console.log(`${colors.yellow}Starting watchman...${colors.reset}`);
      try {
        execSync('watchman watch .');
      } catch (err) {
        console.log(`${colors.red}Could not start watchman:${colors.reset}`, err.message);
      }
    }
  }
} catch (err) {
  console.log(`${colors.red}Failed to set ulimit:${colors.reset}`, err);
}

// Give Redis a moment to start
setTimeout(() => {
  // Run Next.js dev server
  console.log(`${colors.green}Starting Next.js development server...${colors.reset}`);
  const nextDev = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      WATCHPACK_POLLING: 'true',     // Enable polling (can help with EMFILE issues)
      CHOKIDAR_USEPOLLING: 'true',   // Use polling for chokidar
      CHOKIDAR_INTERVAL: '1000',     // Polling interval
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
}, 1000); // 1 second delay to let Redis start up 