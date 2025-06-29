const { spawn } = require("child_process");
const { existsSync } = require("fs");
const { join } = require("path");

const cwd = join(__dirname, "../backend");
const isWin = process.platform === "win32";

const pythonPath = join(
  cwd,
  isWin ? "venv/Scripts/python.exe" : "venv/bin/python"
);

const fallbackPython = isWin ? "py" : "python3";
const cmd = existsSync(pythonPath) ? pythonPath : fallbackPython;

console.log(`Starting backend server using: ${cmd}`);

const child = spawn(cmd, ["server.py"], {
  cwd,
  stdio: "inherit"
});

child.on("error", (err) => {
  console.error("Failed to start backend server:", err);
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== 0) {
    console.error(`Backend server exited with code ${code}`);
  } else {
    console.log("Backend server stopped gracefully.");
  }
});
