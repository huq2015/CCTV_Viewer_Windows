const { app, ipcMain } = require('electron');
const WindowManager = require('./window-manager');
const ConfigStore = require('./store');
const KeyboardHandler = require('./keyboard-handler');
const SessionManager = require('./session-manager');

class MainProcess {
  constructor() {
    this.windowManager = new WindowManager();
    this.configStore = new ConfigStore();
    this.keyboardHandler = null;
    this.sessionManager = new SessionManager();
  }

  async initialize() {
    await app.whenReady();

    // 初始化 session 管理器（在创建窗口之前）
    this.sessionManager.initialize();

    this.windowManager.createMainWindow();
    this.keyboardHandler = new KeyboardHandler(this.windowManager);
    this.keyboardHandler.register();

    this.setupIpcHandlers();
    this.setupLifecycleHandlers();
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

  setupLifecycleHandlers() {
    app.on('window-all-closed', () => {
      if (this.keyboardHandler) {
        this.keyboardHandler.unregister();
      }
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

    app.on('will-quit', () => {
      if (this.keyboardHandler) {
        this.keyboardHandler.unregister();
      }
    });
  }
}

const mainProcess = new MainProcess();
mainProcess.initialize();
