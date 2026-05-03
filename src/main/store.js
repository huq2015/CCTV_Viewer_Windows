const Store = require('electron-store');
const { ipcMain } = require('electron');

class ConfigStore {
  constructor() {
    this.store = new Store({
      schema: {
        currentChannelId: {
          type: 'number',
          default: 0
        },
        settings: {
          type: 'object',
          properties: {
            directChannelChange: {
              type: 'boolean',
              default: false
            },
            directBack: {
              type: 'boolean',
              default: true
            },
            textSize: {
              type: 'string',
              enum: ['small', 'medium', 'large', 'xlarge'],
              default: 'medium'
            }
          },
          default: {
            directChannelChange: false,
            directBack: true,
            textSize: 'medium'
          }
        }
      }
    });

    this.setupIpcHandlers();
  }

  setupIpcHandlers() {
    ipcMain.on('store:get', (event, { key }) => {
      const value = this.get(key);
      event.reply('store:get-response', { key, value });
    });

    ipcMain.on('store:set', (event, { key, value }) => {
      this.set(key, value);
      event.reply('store:set-response', { key, value, success: true });
    });
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

  getCurrentChannelId() {
    return this.store.get('currentChannelId', 0);
  }

  setCurrentChannelId(channelId) {
    this.store.set('currentChannelId', channelId);
  }

  getSettings() {
    return this.store.get('settings', {
      directChannelChange: false,
      directBack: true,
      textSize: 'medium'
    });
  }

  setSettings(settings) {
    this.store.set('settings', settings);
  }
}

module.exports = ConfigStore;
