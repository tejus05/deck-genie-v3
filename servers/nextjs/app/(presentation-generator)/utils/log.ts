 // Add logging function
export const logOperation = (message: string) => {
  // @ts-ignore
  window.electron.writeNextjsLog(message)
};

  // Add clear logs function
export const clearLogs = () => {
  // @ts-ignore
  window.electron.clearNextjsLogs();
};