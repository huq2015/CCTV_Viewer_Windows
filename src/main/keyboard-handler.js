const { ipcMain } = require('electron');

class KeyboardHandler {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.mainWindow = null;
    this.isProcessing = false;
  }

  register() {
    this.mainWindow = this.windowManager.getMainWindow();
    if (!this.mainWindow) return;

    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown') return;

      const key = input.code;
      const isOverlayOpen = this.isOverlayOpen();

      switch (key) {
        case 'ArrowUp':
          if (!isOverlayOpen) {
            event.preventDefault();
            this.sendToRenderer('keyboard:up');
          }
          break;
        case 'ArrowDown':
          if (!isOverlayOpen) {
            event.preventDefault();
            this.sendToRenderer('keyboard:down');
          }
          break;
        case 'Enter':
          if (!isOverlayOpen) {
            event.preventDefault();
            this.sendToRenderer('keyboard:enter');
          }
          break;
        case 'KeyM':
          event.preventDefault();
          this.sendToRenderer('keyboard:menu');
          break;
        case 'Escape':
        case 'KeyB':
          event.preventDefault();
          this.sendToRenderer('keyboard:back');
          break;
        case 'KeyR':
          if (!input.control && !input.meta) {
            event.preventDefault();
            this.sendToRenderer('keyboard:refresh');
          }
          break;
      }
    });
  }

  sendToRenderer(channel) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel);
    }
  }

  isOverlayOpen() {
    return false;
  }

  unregister() {
    this.mainWindow = null;
  }
}

module.exports = KeyboardHandler;
