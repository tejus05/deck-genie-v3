import { BrowserWindow, ipcMain, } from "electron";
import { baseDir, downloadsDir } from "../utils/constants";
import fs from "fs";
import path from "path";
import { showFileDownloadedDialog } from "../utils/dialog";
import { sanitizeFilename } from "../utils";


export function setupExportHandlers() {
  ipcMain.handle("file-downloaded", async (_, filePath: string): Promise<IPCStatus> => {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(downloadsDir, fileName);

    await fs.promises.rename(filePath, destinationPath);
    const success = await showFileDownloadedDialog(destinationPath);
    return { success };
  });

  ipcMain.handle("export-as-pdf", async (_, id: string, title: string) => {
    const ppt_url = `${process.env.NEXT_PUBLIC_URL}/pdf-maker?id=${id}`;
    const browser = new BrowserWindow({
      width: 1280,
      height: 720,
      icon: path.join(baseDir, "resources/ui/assets/images/presenton_short_filled.png"),
      webPreferences: {
        webSecurity: false,

        preload: path.join(__dirname, '../preloads/index.js'),
      },
      show: false,
    });
    browser.loadURL(ppt_url);

    const success = await new Promise((resolve, _) => {
      browser.webContents.on('did-finish-load', async () => {
        // Wait for 1 second to make sure the page is loaded
        await new Promise((resolve, _) => {
          setTimeout(resolve, 1000);
        });

        const pdfBuffer = await browser.webContents.printToPDF({
          printBackground: true,
          pageSize: { width: 1280 / 96, height: 720 / 96 },
          margins: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        browser.close();
        const sanitizedTitle = sanitizeFilename(title);
        const destinationPath = path.join(downloadsDir, `${sanitizedTitle}.pdf`);
        await fs.promises.writeFile(destinationPath, pdfBuffer);

        const success = await showFileDownloadedDialog(destinationPath);
        resolve(success);
      });
    });
    return { success };
  })

}