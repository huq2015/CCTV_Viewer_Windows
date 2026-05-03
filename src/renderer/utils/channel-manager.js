class ChannelManager {
  constructor(ipcClient) {
    this.ipcClient = ipcClient;
    this.currentChannelId = 0;
    this.channels = CHANNELS;
  }

  async initialize() {
    const savedChannelId = await this.ipcClient.getStore('currentChannelId');
    if (savedChannelId !== undefined && savedChannelId !== null) {
      this.currentChannelId = savedChannelId;
    }
    return this.currentChannelId;
  }

  getChannelById(id) {
    return this.channels.find(ch => ch.id === id) || this.channels[0];
  }

  getNextChannel() {
    const nextId = (this.currentChannelId + 1) % this.channels.length;
    return this.getChannelById(nextId);
  }

  getPreviousChannel() {
    const prevId = (this.currentChannelId - 1 + this.channels.length) % this.channels.length;
    return this.getChannelById(prevId);
  }

  getChannelsByCategory(category) {
    return this.channels.filter(ch => ch.category === category);
  }

  getCurrentChannel() {
    return this.getChannelById(this.currentChannelId);
  }

  setCurrentChannel(channelId) {
    this.currentChannelId = channelId;
    this.ipcClient.setStore('currentChannelId', channelId);
  }

  getAllChannels() {
    return this.channels;
  }

  getCategories() {
    return [
      { id: 'cctv', name: '央视频道' },
      { id: 'local', name: '地方频道' }
    ];
  }
}
