const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

// Determine the Python executable path
const isWindows = os.platform() === 'win32';
const venvPath = path.join(__dirname, '..', 'backend', 'venv');
const pythonPath = isWindows 
  ? path.join(venvPath, 'Scripts', 'python.exe')
  : path.join(venvPath, 'bin', 'python');

console.log(`Starting backend server using: ${pythonPath}`);

// Set up environment variables like in server.py
const backendDir = path.join(__dirname, '..', 'backend');
const dataDir = path.join(backendDir, 'data');

const env = {
  ...process.env,
  APP_DATA_DIRECTORY: dataDir,
  TEMP_DIRECTORY: path.join(dataDir, 'temp'),
  USER_CONFIG_PATH: path.join(dataDir, 'config.json'),
  LLM: 'google'
};

// Start the backend server in production mode
const backendProcess = spawn(pythonPath, ['-m', 'uvicorn', 'api.main:app', '--host', '127.0.0.1', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
  env: env
});

backendProcess.on('error', (err) => {
  console.error('Failed to start backend server:', err);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down backend server...');
  backendProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down backend server...');
  backendProcess.kill('SIGTERM');
});
