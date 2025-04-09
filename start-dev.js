#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

// Increase the file descriptor limit for this process
try {
  // macOS specific - increase open files limit for this process
  if (process.platform === 'darwin') {
    const { execSync } = require('child_process');
    try {
      // Try to increase file descriptor limit
      console.log('Attempting to increase file descriptor limit...');
      execSync('ulimit -n 10240', { shell: true });
      
      // Check if watchman is running
      execSync('watchman watch-list', { stdio: 'ignore' });
    } catch (e) {
      // Start watchman if it's not running
      console.log('Starting watchman...');
      try {
        execSync('watchman watch .');
      } catch (err) {
        console.log('Could not start watchman:', err.message);
      }
    }
  }
} catch (err) {
  console.log('Failed to set ulimit:', err);
}

// Run Next.js dev server
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
  process.exit(code);
});

// Handle termination signals
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    nextDev.kill(signal);
  });
}); 