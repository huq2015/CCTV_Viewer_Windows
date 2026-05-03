class SettingsPanel {
  constructor(ipcClient, onSettingsChange) {
    this.ipcClient = ipcClient;
    this.onSettingsChange = onSettingsChange;
    this.element = document.getElementById('settings-panel');
    this.closeBtn = document.getElementById('settings-close-btn');
    
    this.directChannelChange = document.getElementById('setting-direct-channel-change');
    this.directBack = document.getElementById('setting-direct-back');
    this.textSize = document.getElementById('setting-text-size');
    
    this.isVisible = false;
    this.settings = {
      directChannelChange: false,
      directBack: true,
      textSize: 'medium'
    };

    this.inactivityTimer = null;
    this.inactivityDelay = 10000; // 10秒自动关闭

    this.setupEventListeners();
    this.loadSettings();
  }

  setupEventListeners() {
    // 设置项变更监听
    this.directChannelChange.addEventListener('change', (e) => {
      this.settings.directChannelChange = e.target.checked;
      this.saveSettings();
      this.resetInactivityTimer();
    });

    this.directBack.addEventListener('change', (e) => {
      this.settings.directBack = e.target.checked;
      this.saveSettings();
      this.resetInactivityTimer();
    });

    this.textSize.addEventListener('change', (e) => {
      this.settings.textSize = e.target.value;
      this.saveSettings();
      this.resetInactivityTimer();
    });

    // 关闭按钮点击事件
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // 用户活动监听（用于自动关闭）
    this.element.addEventListener('mousemove', () => {
      this.resetInactivityTimer();
    });
    this.element.addEventListener('keydown', () => {
      this.resetInactivityTimer();
    });
    this.element.addEventListener('click', () => {
      this.resetInactivityTimer();
    });
    this.element.addEventListener('touchstart', () => {
      this.resetInactivityTimer();
    });
  }

  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.isVisible) {
      this.inactivityTimer = setTimeout(() => {
        console.log('Settings panel auto-closing due to inactivity');
        this.hide();
      }, this.inactivityDelay);
    }
  }

  clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  async loadSettings() {
    const savedSettings = await this.ipcClient.getStore('settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...savedSettings };
      this.applySettings();
    }
  }

  applySettings() {
    this.directChannelChange.checked = this.settings.directChannelChange;
    this.directBack.checked = this.settings.directBack;
    this.textSize.value = this.settings.textSize;
  }

  async saveSettings() {
    await this.ipcClient.setStore('settings', this.settings);
    if (this.onSettingsChange) {
      this.onSettingsChange(this.settings);
    }
  }

  getSettings() {
    return this.settings;
  }

  show() {
    this.isVisible = true;
    this.element.classList.add('active');
    this.resetInactivityTimer();
    
    // 聚焦到第一个可交互元素
    if (this.closeBtn) {
      this.closeBtn.focus();
    }
  }

  hide() {
    this.isVisible = false;
    this.element.classList.remove('active');
    this.clearInactivityTimer();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
