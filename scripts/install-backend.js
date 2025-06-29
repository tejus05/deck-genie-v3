const { spawnSync } = require("child_process");
const { existsSync } = require("fs");
const { join } = require("path");

const cwd = join(__dirname, "../backend");
const isWin = process.platform === "win32";
const venvDir = join(cwd, "venv");
const pythonLauncher = isWin ? "py" : "python3";

if (!existsSync(join(venvDir, isWin ? "Scripts" : "bin"))) {
  console.log("Creating virtual environment...");
  spawnSync(pythonLauncher, ["-m", "venv", "venv"], { cwd, stdio: "inherit" });
}

const pythonExe = join(venvDir, isWin ? "Scripts/python.exe" : "bin/python");

console.log("Upgrading pip...");
spawnSync(pythonExe, ["-m", "pip", "install", "--upgrade", "pip"], {
  cwd,
  stdio: "inherit",
});

console.log("Installing backend requirements...");
spawnSync(pythonExe, ["-m", "pip", "install", "-r", "requirements.txt"], {
  cwd,
  stdio: "inherit",
});

console.log("Backend environment setup complete.");
