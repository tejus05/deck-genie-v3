import { ipcMain } from "electron";
import { getUserConfig, setUserConfig } from "../utils";

export function setupUserConfigHandlers() {
  ipcMain.handle("get-user-config", async (_, __) => {
    return getUserConfig();
  });

  ipcMain.handle("set-user-config", async (_, userConfig: UserConfig) => {
    setUserConfig(userConfig);
  });
}
