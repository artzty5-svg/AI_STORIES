#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SERVER_DIR = path.resolve(ROOT_DIR, 'server');
const CLIENT_DIR = path.resolve(ROOT_DIR, 'client');

const children = [];

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const req = http.request({ host, port, path: '/', method: 'GET', timeout: 1500 }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function printBanner() {
  console.log('\n\x1b[36m╔════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m     \x1b[1m\x1b[35mNEUROCANVAS AI — PRODUCTION LOCAL STUDIO\x1b[0m                   \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m     Apple Silicon M5 Pro • 16GB Unified Memory • Local Only   \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚════════════════════════════════════════════════════════════════╝\x1b[0m\n');
}

async function main() {
  printBanner();

  // 1. Check ComfyUI (Sole Generation Engine)
  console.log('\x1b[34m[1/3]\x1b[0m Checking ComfyUI engine...');
  const comfyUp = await checkPort(8188);
  if (comfyUp) {
    console.log('      \x1b[32m✔ ComfyUI detected at http://127.0.0.1:8188\x1b[0m');
  } else {
    console.log('      \x1b[33m⚠ ComfyUI is not running on port 8188. Start it with: python main.py --listen 127.0.0.1 --port 8188\x1b[0m');
  }

  // 2. Start Backend Server
  console.log('\x1b[34m[2/3]\x1b[0m Starting Express Backend (:5000)...');
  const backend = spawn('node', ['server.js'], {
    cwd: SERVER_DIR,
    stdio: 'inherit',
    env: { ...process.env, PORT: '5000', HOST: '127.0.0.1' }
  });
  children.push(backend);

  // Wait for backend to be ready
  let backendReady = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    backendReady = await checkPort(5000);
    if (backendReady) break;
  }
  console.log('      \x1b[32m✔ Backend online at http://127.0.0.1:5000\x1b[0m');

  // 3. Start Vite Frontend
  console.log('\x1b[34m[3/3]\x1b[0m Starting Vite React Client (:5173)...');
  const frontend = spawn('npx', ['vite', '--port', '5173'], {
    cwd: CLIENT_DIR,
    stdio: 'inherit'
  });
  children.push(frontend);

  // Wait for frontend to be ready
  let frontendReady = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 300));
    frontendReady = await checkPort(5173);
    if (frontendReady) break;
  }

  console.log('\n\x1b[32m✔ Studio Ready!\x1b[0m Access your workspace at:');
  console.log('  \x1b[1m\x1b[36m👉 http://localhost:5173\x1b[0m\n');

  // Optional: open default browser on macOS
  try {
    if (process.platform === 'darwin') {
      execSync('open http://localhost:5173 2>/dev/null || true');
    }
  } catch (e) {
    // ignore
  }

  // Graceful shutdown
  const cleanup = () => {
    console.log('\n\x1b[33mShutting down NeuroCanvas AI Studio processes...\x1b[0m');
    for (const child of children) {
      try {
        child.kill('SIGTERM');
      } catch (e) {
        // ignore
      }
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});

