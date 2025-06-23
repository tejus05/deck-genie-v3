import { spawn } from "child_process";
import { localhost, logsDir, userDataDir } from "./constants";
import http from "http";
import fs from "fs";

// @ts-ignore
import handler from "serve-handler";
import path from "path";

export async function startFastApiServer(
  directory: string,
  port: number,
  env: FastApiEnv,
  isDev: boolean,
) {
  // Start FastAPI server
  const startCommand = isDev ? [
    ".venv/bin/python",
    ["server_autoreload.py", "--port", port.toString()],
  ] : [
    "./fastapi", ["--port", port.toString()],
  ];


  const fastApiProcess = spawn(
    startCommand[0] as string,
    startCommand[1] as string[],
    {
      cwd: directory,
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env, ...env },
    }
  );
  fastApiProcess.stdout.on("data", (data: any) => {
    fs.appendFileSync(path.join(logsDir, "fastapi-server.log"), data);
    console.log(`FastAPI: ${data}`);
  });
  fastApiProcess.stderr.on("data", (data: any) => {
    fs.appendFileSync(path.join(logsDir, "fastapi-server.log"), data);
    console.error(`FastAPI: ${data}`);
  });
  // Wait for FastAPI server to start
  await waitForServer(`${localhost}:${port}/docs`);
  return fastApiProcess;
}

export async function startNextJsServer(
  directory: string,
  port: number,
  env: NextJsEnv,
  isDev: boolean,
) {
  let nextjsProcess;

  if (isDev) {
    // Start NextJS development server
    nextjsProcess = spawn(
      "npm",
      ["run", "dev", "--", "-p", port.toString()],
      {
        cwd: directory,
        stdio: ["inherit", "pipe", "pipe"],
        env: { ...process.env, ...env },
      }
    );
    nextjsProcess.stdout.on("data", (data: any) => {
      fs.appendFileSync(path.join(logsDir, "nextjs-server.log"), data);
      console.log(`NextJS: ${data}`);
    });
    nextjsProcess.stderr.on("data", (data: any) => {
      fs.appendFileSync(path.join(logsDir, "nextjs-server.log"), data);
      console.error(`NextJS: ${data}`);
    });
  } else {
    // Start NextJS build server
    nextjsProcess = startNextjsBuildServer(directory, port);
  }

  // Wait for NextJS server to start
  await waitForServer(`${localhost}:${port}`);
  return nextjsProcess;
}

async function startNextjsBuildServer(directory: string, port: number) {
  const server = http.createServer((req, res) => {
    return handler(req, res, {
      public: directory,
      cleanUrls: true,
    });
  });

  server.listen(port);
  return server;
}


async function waitForServer(url: string, timeout = 30000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      await new Promise<void>((resolve, reject) => {
        http.get(url, (res) => {
          if (res.statusCode === 200 || res.statusCode === 304) {
            resolve();
          } else {
            reject(new Error(`Unexpected status code: ${res.statusCode}`));
          }
        }).on('error', reject);
      });
      return;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`Server did not start within ${timeout}ms`);
}