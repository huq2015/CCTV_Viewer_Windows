class IpcClient {
  constructor() {
    this.api = window.electronAPI;
  }

  send(channel, data = {}) {
    this.api.send(channel, data);
  }

  on(channel, callback) {
    this.api.on(channel, callback);
  }

  once(channel, callback) {
    this.api.once(channel, callback);
  }

  async getStore(key) {
    return new Promise((resolve) => {
      this.once('store:get-response', (response) => {
        resolve(response.value);
      });
      this.send('store:get', { key });
    });
  }

  async setStore(key, value) {
    return new Promise((resolve) => {
      this.once('store:set-response', (response) => {
        resolve(response.success);
      });
      this.send('store:set', { key, value });
    });
  }

  quitApp() {
    this.send('app:quit');
  }

  enterFullscreen() {
    this.send('window:enter-fullscreen');
  }

  exitFullscreen() {
    this.send('window:exit-fullscreen');
  }

  onKeyboardUp(callback) {
    this.on('keyboard:up', callback);
  }

  onKeyboardDown(callback) {
    this.on('keyboard:down', callback);
  }

  onKeyboardEnter(callback) {
    this.on('keyboard:enter', callback);
  }

  onKeyboardMenu(callback) {
    this.on('keyboard:menu', callback);
  }

  onKeyboardBack(callback) {
    this.on('keyboard:back', callback);
  }

  onKeyboardRefresh(callback) {
    this.on('keyboard:refresh', callback);
  }

  onKeyboardZoomIn(callback) {
    this.on('keyboard:zoom-in', callback);
  }

  onKeyboardZoomOut(callback) {
    this.on('keyboard:zoom-out', callback);
  }
}


