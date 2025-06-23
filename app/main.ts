require("dotenv").config();
import { app, BrowserWindow } from "electron";
import path from "path";
import { findUnusedPorts, killProcess, setupEnv, setUserConfig } from "./utils";
import { startFastApiServer, startNextJsServer } from "./utils/servers";
import { ChildProcessByStdio } from "child_process";
import { baseDir, fastapiDir, isDev, localhost, nextjsDir, tempDir, userConfigPath, userDataDir } from "./utils/constants";
import { setupIpcHandlers } from "./ipc";


var win: BrowserWindow | undefined;
var fastApiProcess: ChildProcessByStdio<any, any, any> | undefined;
var nextjsProcess: any;

app.commandLine.appendSwitch('gtk-version', '3');

const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(baseDir, "resources/ui/assets/images/presenton_short_filled.png"),
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preloads/index.js'),
    },
  });
};

async function startServers(fastApiPort: number, nextjsPort: number) {
  try {
    fastApiProcess = await startFastApiServer(
      fastapiDir,
      fastApiPort,
      {
        DEBUG: isDev ? "True" : "False",
        LLM: process.env.LLM,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        APP_DATA_DIRECTORY: userDataDir,
        TEMP_DIRECTORY: tempDir,
        USER_CONFIG_PATH: userConfigPath,
      },
      isDev,
    );
    nextjsProcess = await startNextJsServer(
      nextjsDir,
      nextjsPort,
      {
        NEXT_PUBLIC_FAST_API: process.env.NEXT_PUBLIC_FAST_API,
        TEMP_DIRECTORY: process.env.TEMP_DIRECTORY,
        NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
        NEXT_PUBLIC_USER_CONFIG_PATH: process.env.NEXT_PUBLIC_USER_CONFIG_PATH,
      },
      isDev,
    )
  } catch (error) {
    console.error("Server startup error:", error);
  }
}

async function stopServers() {
  if (fastApiProcess?.pid) {
    await killProcess(fastApiProcess.pid);
  }
  if (nextjsProcess) {
    if (isDev) {
      await killProcess(nextjsProcess.pid);
    } else {
      nextjsProcess.close();
    }
  }
}

app.whenReady().then(async () => {
  createWindow();
  win?.loadFile(path.join(baseDir, "resources/ui/homepage/index.html"));

  setUserConfig({
    LLM: process.env.LLM,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  })

  const [fastApiPort, nextjsPort] = await findUnusedPorts();
  console.log(`FastAPI port: ${fastApiPort}, NextJS port: ${nextjsPort}`);

  //? Setup environment variables to be used in the preloads
  setupEnv(fastApiPort, nextjsPort);
  setupIpcHandlers();

  await startServers(fastApiPort, nextjsPort);
  win?.loadURL(`${localhost}:${nextjsPort}`);
});

app.on("window-all-closed", async () => {
  await stopServers();
  app.quit();
});
