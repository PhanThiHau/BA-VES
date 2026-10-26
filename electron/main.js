const { app, BrowserWindow, Menu, globalShortcut } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      devTools: isDev,
    },
  });

  // Tắt menu mặc định (File, Edit, View, Window, Help...)
  Menu.setApplicationMenu(null);

  // Tải trang từ dev server hoặc file dist tĩnh
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Hiển thị mượt khi đã sẵn sàng
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Chặn điều hướng ngoại vi làm mất app SPA
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("http://localhost:5173") && !url.startsWith("file://")) {
      event.preventDefault();
    }
  });

  // Chặn mở popup / cửa sổ mới
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Chặn phím tắt reload trên bản production
  if (!isDev) {
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("F5", () => {});
    globalShortcut.register("CommandOrControl+Shift+R", () => {});
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
