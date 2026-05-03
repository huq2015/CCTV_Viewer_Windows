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
    this.isInitialized = false;
    this.loadTimeout = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async initialize() {
    try {
      console.log('App initializing...');
      
      const webview = document.getElementById('tv-webview');
      if (!webview) {
        console.error('Webview element not found');
        return;
      }
      
      // 先设置 webview 为 about:blank 确保后续加载能触发事件
      webview.src = 'about:blank';
      
      this.webViewController.initialize(webview);

      this.webViewController.onLoadStart = () => {
        this.loadingOverlay.show('正在加载频道...');
      };

      this.webViewController.onLoadFinish = () => {
        clearTimeout(this.loadTimeout);
        this.retryCount = 0; // 重置重试计数
        setTimeout(() => {
          this.loadingOverlay.hide();
        }, 500);
      };

      this.webViewController.onLoadError = (error) => {
        console.error('Load error:', error);
        clearTimeout(this.loadTimeout);
        this.loadingOverlay.hide();
        
        // 自动重试加载
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Auto-retrying load (attempt ${this.retryCount}/${this.maxRetries})...`);
          setTimeout(() => {
            this.webViewController.reload();
          }, 1000);
        }
      };

      // 初始化频道管理器（从存储中恢复上次观看的频道）
      const restoredChannelId = await this.channelManager.initialize();
      console.log('Restored channel ID:', restoredChannelId);

      this.settingsPanel = new SettingsPanel(
        this.ipcClient,
        (settings) => {
          if (this.channelList) {
            this.channelList.setTextSize(settings.textSize);
          }
        }
      );

      const settings = this.settingsPanel.getSettings();

      this.channelList = new ChannelList(
        this.channelManager,
        (channelId, action) => {
          if (action === 'settings') {
            this.settingsPanel.show();
            this.activeOverlay = 'settings';
          } else if (channelId !== null) {
            this.loadChannel(channelId);
          }
        },
        this.ipcClient
      );

      this.channelList.setTextSize(settings.textSize);

      this.menuOverlay = new MenuOverlay(
        this.webViewController,
        () => {
          this.settingsPanel.show();
          this.activeOverlay = 'settings';
        }
      );

      this.setupKeyboardHandlers();
      this.setupGlobalKeyboardHandlers();
      
      // 加载频道：优先恢复上次观看的频道，否则加载第一个频道
      const channelToLoad = this.channelManager.getCurrentChannel();
      if (channelToLoad) {
        console.log('Loading initial channel:', channelToLoad.name, '(ID:', channelToLoad.id + ')');
        // 延迟加载确保 webview 完全初始化
        setTimeout(() => {
          this.loadChannel(channelToLoad.id);
        }, 500);
      } else {
        console.warn('No channel available to load');
      }
      
      this.isInitialized = true;
      console.log('App initialized successfully');
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }

  loadChannel(channelId) {
    console.log('Loading channel:', channelId);
    
    const channel = this.channelManager.getChannelById(channelId);
    if (channel) {
      console.log('Channel found:', channel.name, channel.url);
      this.channelManager.setCurrentChannel(channelId);
      this.retryCount = 0;
      this.webViewController.loadUrl(channel.url);
      
      // 8秒后如果仍未加载完成，自动刷新
      clearTimeout(this.loadTimeout);
      this.loadTimeout = setTimeout(() => {
        if (this.loadingOverlay.isVisible()) {
          console.log('Channel load timeout, reloading...');
          this.webViewController.reload();
        }
      }, 8000);
    } else {
      console.error('Channel not found for id:', channelId);
    }
  }

  setupKeyboardHandlers() {
    // 方向键上
    this.ipcClient.onKeyboardUp(() => {
      if (!this.isInitialized) return;
      
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

    // 方向键下
    this.ipcClient.onKeyboardDown(() => {
      if (!this.isInitialized) return;
      
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

    // Enter 键
    this.ipcClient.onKeyboardEnter(() => {
      if (!this.isInitialized) return;
      
      if (this.activeOverlay === 'channel-list') {
        this.channelList.handleEnter();
        this.activeOverlay = null;
      } else if (!this.activeOverlay) {
        this.channelList.show();
        this.activeOverlay = 'channel-list';
      }
    });

    // M 键 - 菜单
    this.ipcClient.onKeyboardMenu(() => {
      if (!this.isInitialized) return;
      
      if (this.activeOverlay === 'menu') {
        this.menuOverlay.hide();
        this.activeOverlay = null;
      } else if (!this.activeOverlay) {
        this.menuOverlay.show();
        this.activeOverlay = 'menu';
      }
    });

    // Esc / B 键 - 返回
    this.ipcClient.onKeyboardBack(() => {
      if (!this.isInitialized) return;
      this.handleBack();
    });

    // R 键 - 刷新
    this.ipcClient.onKeyboardRefresh(() => {
      if (!this.isInitialized) return;
      
      if (!this.activeOverlay) {
        this.webViewController.reload();
      }
    });

    // + 键 - 放大
    this.ipcClient.onKeyboardZoomIn(() => {
      if (!this.isInitialized) return;
      
      if (this.activeOverlay === 'menu') {
        this.webViewController.zoomIn();
      }
    });

    // - 键 - 缩小
    this.ipcClient.onKeyboardZoomOut(() => {
      if (!this.isInitialized) return;
      
      if (this.activeOverlay === 'menu') {
        this.webViewController.zoomOut();
      }
    });
  }

  // 全局键盘事件处理（不依赖 IPC，直接监听 document）
  setupGlobalKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
      if (!this.isInitialized) return;
      
      // 设置页面支持 ESC 和 B 键关闭
      if (this.activeOverlay === 'settings') {
        if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          e.stopPropagation();
          this.settingsPanel.hide();
          this.activeOverlay = null;
          return;
        }
      }
      
      // 频道列表导航
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

  handleBack() {
    console.log('handleBack called, activeOverlay:', this.activeOverlay);
    
    if (this.activeOverlay) {
      switch (this.activeOverlay) {
        case 'channel-list':
          const settings = this.settingsPanel.getSettings();
          if (settings.directBack) {
            this.channelList.hide();
            this.activeOverlay = null;
          } else {
            this.channelList.handleArrowLeft();
          }
          break;
        case 'menu':
          this.menuOverlay.hide();
          this.activeOverlay = null;
          break;
        case 'settings':
          this.settingsPanel.hide();
          this.activeOverlay = null;
          break;
      }
      return;
    }

    // 没有活动覆盖层时，显示退出提示
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
