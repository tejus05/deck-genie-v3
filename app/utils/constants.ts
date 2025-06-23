import { app } from "electron"
import path from "path"

export const localhost = "http://127.0.0.1"


export const isDev = !app.isPackaged;
export const baseDir = app.getAppPath();
export const fastapiDir = isDev ? path.join(baseDir, "servers/fastapi") : path.join(baseDir, "resources/fastapi");
export const nextjsDir = isDev ? path.join(baseDir, "servers/nextjs") : path.join(baseDir, "resources/nextjs");

export const tempDir = path.join(app.getPath("temp"), "presenton")
export const userDataDir = app.getPath("userData")
export const downloadsDir = app.getPath("downloads")
export const userConfigPath = path.join(userDataDir, "userConfig.json")
export const logsDir = path.join(userDataDir, "logs")