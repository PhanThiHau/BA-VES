const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
  minimizeWindow: () => ipcRenderer.send("app:minimize"),
  maximizeWindow: () => ipcRenderer.send("app:maximize"),
  closeWindow: () => ipcRenderer.send("app:close"),
});
