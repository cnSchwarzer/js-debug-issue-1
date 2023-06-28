import { app, BrowserWindow, shell, ipcMain, crashReporter } from "electron";
import { release } from "node:os";
import { join } from "node:path";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

crashReporter.start({
  productName: "GalDanmu",
  companyName: "reito",
  submitURL:
    "https://submit.backtrace.io/reito/874c6d8cc3a7f8f9faa24b416ed9494cba10efc950616e77f4dc2a718c99e7ea/minidump",
  uploadToServer: true,
});

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let editorWindow: BrowserWindow | null = null;
let playerWindow: BrowserWindow | null = null;

const indexHtml = join(process.env.DIST, "index.html");
const preload = join(__dirname, "../preload/index.js");
const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.commandLine.appendSwitch('v', '1')
app.commandLine.appendSwitch('log-level', '0')
app.commandLine.appendSwitch('enable-logging') 
app.commandLine.appendSwitch('trace-warnings')

async function createWindow() {
  // Editor
  editorWindow = new BrowserWindow({
    title: "Editor",
    webPreferences: {
      preload,
    },
    show: true,
    width: 1000,
    height: 800,
  }); 
  editorWindow.webContents.openDevTools();

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    await editorWindow.loadURL(process.env.VITE_DEV_SERVER_URL + "editor", { extraHeaders: "Cache-Control: no-cache,no-store" });
  } else {
    editorWindow.loadFile(indexHtml, { hash: "editor" });
  }

  // Player
  const useOffscreen = false;
  playerWindow = new BrowserWindow({
    title: "Player",
    webPreferences: {
      preload,
      offscreen: useOffscreen,
    },
    show: !useOffscreen
  });
  playerWindow.setMenuBarVisibility(false)
  playerWindow.webContents.openDevTools();

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    await playerWindow.loadURL(process.env.VITE_DEV_SERVER_URL + "player", { extraHeaders: "Cache-Control: no-cache,no-store" });
    playerWindow.setContentSize(1280, 720);
    // Open devTool if the app is not packaged
  } else {
    playerWindow.loadFile(indexHtml, { hash: "player" });
    playerWindow.setContentSize(1920, 1080);
  }

  const spout = require("E:/ElectronSpout/electron-spout/build/Release/electron_spout.node");
  const osr = new spout.SpoutOutput("GAL Output");

  playerWindow.webContents.setFrameRate(60);
  playerWindow.webContents.on("paint", (event, dirty, image) => {
    osr.updateFrame(image.getBitmap(), image.getSize());
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  editorWindow = null;
  playerWindow = null;
  app.quit();
});

app.on("second-instance", () => {
  if (editorWindow) {
    // Focus on the main window if the user tried to open another
    if (editorWindow.isMinimized()) editorWindow.restore();
    editorWindow.focus();
  }
});

app.on("activate", () => {
  if (editorWindow) {
    editorWindow.focus();
  } else {
    createWindow();
  }
}); 
