import { shell } from "electron";
import { dialog } from "electron";
import path from "path";

export async function showFileDownloadedDialog(filePath: string): Promise<boolean> {
  try {
    const { response } = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Open File', 'Open Folder', 'Cancel'],
      defaultId: 0,
      title: 'File Downloaded',
      message: 'What would you like to do?'
    });

    if (response === 0) {
      await shell.openPath(filePath);
    } else if (response === 1) {
      await shell.openPath(path.dirname(filePath));
    }

    return true;
  } catch (error: any) {
    console.error('Error handling downloaded file:', error);
    return false;
  }
}