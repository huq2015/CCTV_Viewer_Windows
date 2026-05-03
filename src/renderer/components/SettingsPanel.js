class SettingsPanel {
  constructor(ipcClient, onSettingsChange) {
    this.ipcClient = ipcClient;
    this.onSettingsChange = onSettingsChange;
    this.element = document.getElementById('settings-panel');
    
    this.directChannelChange = document.getElementById('setting-direct-channel-change');
    this.directBack = document.getElementById('setting-direct-back');
    this.textSize = document.getElementById('setting-text-size');
    
    this.isVisible = false;
    this.settings = {
      directChannelChange: false,
      directBack: true,
      textSize: 'medium'
    };

    this.setupEventListeners();
    this.loadSettings();
  }

  setupEventListeners() {
    this.directChannelChange.addEventListener('change', (e) => {
      this.settings.directChannelChange = e.target.checked;
      this.saveSettings();
    });

    this.directBack.addEventListener('change', (e) => {
      this.settings.directBack = e.target.checked;
      this.saveSettings();
    });

    this.textSize.addEventListener('change', (e) => {
      this.settings.textSize = e.target.value;
      this.saveSettings();
    });
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
    this.directChannelChange.focus();
  }

  hide() {
    this.isVisible = false;
    this.element.classList.remove('active');
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

module.exports = SettingsPanel;
