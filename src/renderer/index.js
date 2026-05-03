const IpcClient = require('./utils/ipc-client');
const ChannelManager = require('./utils/channel-manager');
const WebViewController = require('./webview/webview-controller');
const LoadingOverlay = require('./components/LoadingOverlay');
const ChannelList = require('./components/ChannelList');
const MenuOverlay = require('./components/MenuOverlay');
const SettingsPanel = require('./components/SettingsPanel');

class App {
  constructor() {
    this.ipcClient = new IpcClient();
    this.channelManager = new ChannelManager(this.ipcClient);
    this.webViewController = new WebViewController();
    this.loadingOverlay = new LoadingOverlay();
    this.channelList = null;
    this.menuOverlay = null;
    this.settingsPanel = null;
    
    this.activeOverlay = null;
    this.backPressCount = 0;
    this.backPressTimer = null;
  }

  async initialize() {
    const webview = document.getElementById('tv-webview');
    this.webViewController.initialize(webview);

    this.webViewController.onLoadStart = () => {
      this.loadingOverlay.show();
    };

    this.webViewController.onLoadFinish = () => {
      setTimeout(() => {
        this.loadingOverlay.hide();
      }, 500);
    };

    this.webViewController.onLoadError = (error) => {
      console.error('Load error:', error);
      this.loadingOverlay.hide();
    };

    await this.channelManager.initialize();

    this.channelList = new ChannelList(
      this.channelManager,
      (channelId, action) => {
        if (action === 'settings') {
          this.settingsPanel.show();
          this.activeOverlay = 'settings';
        } else if (channelId !== null) {
          this.loadChannel(channelId);
        }
      }
    );

    this.menuOverlay = new MenuOverlay(
      this.webViewController,
      () => {
        this.settingsPanel.show();
        this.activeOverlay = 'settings';
      }
    );

    this.settingsPanel = new SettingsPanel(
      this.ipcClient,
      (settings) => {
        this.channelList.setTextSize(settings.textSize);
      }
    );

    const settings = this.settingsPanel.getSettings();
    this.channelList.setTextSize(settings.textSize);

    this.loadChannel(this.channelManager.getCurrentChannel().id);
    this.setupKeyboardHandlers();
  }

  loadChannel(channelId) {
    const channel = this.channelManager.getChannelById(channelId);
    if (channel) {
      this.channelManager.setCurrentChannel(channelId);
      this.webViewController.loadUrl(channel.url);
    }
  }

  setupKeyboardHandlers() {
    this.ipcClient.onKeyboardUp(() => {
      if (this.activeOverlay) {
        if (this.activeOverlay === 'channel-list') {
          this.channelList.handleArrowUp();
        }
        return;
      }

      const settings = this.settingsPanel.getSettings();
      if (settings.directChannelChange) {
        const prevChannel = this.channelManager.getPreviousChannel();
        this.loadChannel(prevChannel.id);
      } else {
        this.channelList.show();
        this.activeOverlay = 'channel-list';
      }
    });

    this.ipcClient.onKeyboardDown(() => {
      if (this.activeOverlay) {
        if (this.activeOverlay === 'channel-list') {
          this.channelList.handleArrowDown();
        }
        return;
      }

      const settings = this.settingsPanel.getSettings();
      if (settings.directChannelChange) {
        const nextChannel = this.channelManager.getNextChannel();
        this.loadChannel(nextChannel.id);
      } else {
        this.channelList.show();
        this.activeOverlay = 'channel-list';
      }
    });

    this.ipcClient.onKeyboardEnter(() => {
      if (this.activeOverlay === 'channel-list') {
        this.channelList.handleEnter();
        this.activeOverlay = null;
      } else if (!this.activeOverlay) {
        this.channelList.show();
        this.activeOverlay = 'channel-list';
      }
    });

    this.ipcClient.onKeyboardMenu(() => {
      if (this.activeOverlay === 'menu') {
        this.menuOverlay.hide();
        this.activeOverlay = null;
      } else if (!this.activeOverlay) {
        this.menuOverlay.show();
        this.activeOverlay = 'menu';
      }
    });

    this.ipcClient.onKeyboardBack(() => {
      if (this.activeOverlay) {
        if (this.activeOverlay === 'channel-list') {
          const settings = this.settingsPanel.getSettings();
          if (settings.directBack) {
            this.channelList.hide();
            this.activeOverlay = null;
          } else {
            this.channelList.handleArrowLeft();
          }
        } else if (this.activeOverlay === 'menu') {
          this.menuOverlay.hide();
          this.activeOverlay = null;
        } else if (this.activeOverlay === 'settings') {
          this.settingsPanel.hide();
          this.activeOverlay = null;
        }
        return;
      }

      this.backPressCount++;
      if (this.backPressCount === 1) {
        this.showToast('再按一次返回键退出应用');
        this.backPressTimer = setTimeout(() => {
          this.backPressCount = 0;
        }, 2000);
      } else if (this.backPressCount >= 2) {
        clearTimeout(this.backPressTimer);
        this.ipcClient.quitApp();
      }
    });

    this.ipcClient.onKeyboardRefresh(() => {
      if (!this.activeOverlay) {
        this.webViewController.reload();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (this.activeOverlay === 'channel-list') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            this.channelList.handleArrowUp();
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.channelList.handleArrowDown();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            this.channelList.handleArrowLeft();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.channelList.handleArrowRight();
            break;
          case 'Enter':
            e.preventDefault();
            this.channelList.handleEnter();
            this.activeOverlay = null;
            break;
        }
      } else if (this.activeOverlay === 'menu') {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.menuOverlay.handleArrowLeft();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.menuOverlay.handleArrowRight();
            break;
          case 'Enter':
            e.preventDefault();
            this.menuOverlay.handleEnter();
            break;
        }
      }
    });
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      z-index: 1000;
      pointer-events: none;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }
}

const app = new App();
app.initialize();
