import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
export function setupReadFile() {
  ipcMain.handle("read-file", async (_, filePath: string) => {
    const normalizedPath = path.normalize(filePath);
    return  fs.readFileSync(normalizedPath, 'utf-8');
  });
}