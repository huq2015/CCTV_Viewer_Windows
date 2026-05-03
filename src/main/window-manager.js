const { BrowserWindow } = require('electron');
const path = require('path');

class WindowManager {
  constructor() {
    this.mainWindow = null;
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      fullscreen: true,
      frame: false,
      backgroundColor: '#000000',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webviewTag: true
      },
      show: false,
      icon: path.join(__dirname, '../assets/icons/icon.png')
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  getMainWindow() {
    return this.mainWindow;
  }

  toggleFullscreen() {
    if (this.mainWindow) {
      const isFullScreen = this.mainWindow.isFullScreen();
      this.mainWindow.setFullScreen(!isFullScreen);
    }
  }

  enterFullscreen() {
    if (this.mainWindow) {
      this.mainWindow.setFullScreen(true);
    }
  }

  exitFullscreen() {
    if (this.mainWindow) {
      this.mainWindow.setFullScreen(false);
    }
  }

  focus() {
    if (this.mainWindow) {
      this.mainWindow.focus();
    }
  }
}

module.exports = WindowManager;
