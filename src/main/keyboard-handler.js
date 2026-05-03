const { globalShortcut, ipcMain } = require('electron');

class KeyboardHandler {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.mainWindow = null;
    this.isProcessing = false;
  }

  register() {
    this.mainWindow = this.windowManager.getMainWindow();
    if (!this.mainWindow) return;

    // 注册全局快捷键
    const shortcuts = [
      { key: 'Up', channel: 'keyboard:up' },
      { key: 'Down', channel: 'keyboard:down' },
      { key: 'Enter', channel: 'keyboard:enter' },
      { key: 'M', channel: 'keyboard:menu' },
      { key: 'Esc', channel: 'keyboard:back' },
      { key: 'B', channel: 'keyboard:back' },
      { key: 'R', channel: 'keyboard:refresh' },
      { key: 'Plus', channel: 'keyboard:zoom-in' },
      { key: 'Numadd', channel: 'keyboard:zoom-in' },
      { key: '-', channel: 'keyboard:zoom-out' },
      { key: 'Numsub', channel: 'keyboard:zoom-out' }
    ];

    shortcuts.forEach(({ key, channel }) => {
      globalShortcut.register(key, () => {
        this.sendToRenderer(channel);
      });
    });
  }

  sendToRenderer(channel) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel);
    }
  }

  unregister() {
    globalShortcut.unregisterAll();
    this.mainWindow = null;
  }
}

module.exports = KeyboardHandler;
