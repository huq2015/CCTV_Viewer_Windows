const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    const validChannels = [
      'app:quit',
      'store:get',
      'store:set',
      'window:enter-fullscreen',
      'window:exit-fullscreen'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, callback) => {
    const validChannels = [
      'keyboard:up',
      'keyboard:down',
      'keyboard:enter',
      'keyboard:menu',
      'keyboard:back',
      'keyboard:refresh',
      'keyboard:zoom-in',
      'keyboard:zoom-out',
      'store:get-response',
      'store:set-response'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  once: (channel, callback) => {
    const validChannels = [
      'keyboard:up',
      'keyboard:down',
      'keyboard:enter',
      'keyboard:menu',
      'keyboard:back',
      'keyboard:refresh',
      'keyboard:zoom-in',
      'keyboard:zoom-out',
      'store:get-response',
      'store:set-response'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (event, ...args) => callback(...args));
    }
  }
});
