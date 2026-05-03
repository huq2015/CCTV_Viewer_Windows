const { app, ipcMain } = require('electron');
const WindowManager = require('./window-manager');
const ConfigStore = require('./store');
const KeyboardHandler = require('./keyboard-handler');

class MainProcess {
  constructor() {
    this.windowManager = new WindowManager();
    this.configStore = new ConfigStore();
    this.keyboardHandler = null;
  }

  async initialize() {
    await app.whenReady();

    this.windowManager.createMainWindow();
    this.keyboardHandler = new KeyboardHandler(this.windowManager);
    this.keyboardHandler.register();

    this.setupIpcHandlers();

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.windowManager.getMainWindow() === null) {
        this.windowManager.createMainWindow();
        this.keyboardHandler.register();
      }
    });
  }

  setupIpcHandlers() {
    ipcMain.on('app:quit', () => {
      app.quit();
    });

    ipcMain.on('window:enter-fullscreen', () => {
      this.windowManager.enterFullscreen();
    });

    ipcMain.on('window:exit-fullscreen', () => {
      this.windowManager.exitFullscreen();
    });
  }
}

const mainProcess = new MainProcess();
mainProcess.initialize();
