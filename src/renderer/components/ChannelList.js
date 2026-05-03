class ChannelList {
  constructor(channelManager, onChannelSelect, ipcClient) {
    this.channelManager = channelManager;
    this.onChannelSelect = onChannelSelect;
    this.ipcClient = ipcClient;
    this.element = document.getElementById('channel-list');
    this.itemsContainer = document.getElementById('channel-items');
    this.categoryItems = this.element.querySelectorAll('.category-item');
    
    this.currentCategory = 'cctv';
    this.selectedCategoryIndex = 0;
    this.selectedChannelIndex = 0;
    this.textSize = 'medium';
    this.isVisible = false;

    this.setupEventListeners();
    this.loadState();
  }

  setupEventListeners() {
    this.categoryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        if (item.classList.contains('settings-trigger')) {
          this.hide();
          this.onChannelSelect(null, 'settings');
          return;
        }
        this.selectCategory(index);
      });
    });
  }

  // 加载保存的抽屉状态
  async loadState() {
    try {
      const savedState = await this.ipcClient.getStore('channelListState');
      if (savedState) {
        this.currentCategory = savedState.currentCategory || 'cctv';
        this.selectedCategoryIndex = savedState.selectedCategoryIndex || 0;
        this.selectedChannelIndex = savedState.selectedChannelIndex || 0;
        
        // 同步当前频道到对应的分类
        const currentChannel = this.channelManager.getCurrentChannel();
        if (currentChannel) {
          const categoryMap = ['cctv', 'local', 'settings'];
          const channelCategoryIndex = categoryMap.indexOf(currentChannel.category);
          if (channelCategoryIndex !== -1) {
            this.selectedCategoryIndex = channelCategoryIndex;
            this.currentCategory = currentChannel.category;
          }
          
          // 计算当前频道在分类中的索引
          const channels = this.channelManager.getChannelsByCategory(this.currentCategory);
          const channelIndex = channels.findIndex(ch => ch.id === currentChannel.id);
          if (channelIndex !== -1) {
            this.selectedChannelIndex = channelIndex;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load channel list state:', error);
    }
  }

  // 保存抽屉状态
  async saveState() {
    try {
      await this.ipcClient.setStore('channelListState', {
        currentCategory: this.currentCategory,
        selectedCategoryIndex: this.selectedCategoryIndex,
        selectedChannelIndex: this.selectedChannelIndex
      });
    } catch (error) {
      console.error('Failed to save channel list state:', error);
    }
  }

  setTextSize(size) {
    this.textSize = size;
    if (this.isVisible) {
      this.renderChannels();
    }
  }

  show() {
    this.isVisible = true;
    this.element.classList.add('active');
    this.renderCategories();
    this.renderChannels();
    this.updateFocus();
    this.saveState();
  }

  hide() {
    this.isVisible = false;
    this.element.classList.remove('active');
    this.saveState();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  selectCategory(index) {
    this.selectedCategoryIndex = index;
    const categoryMap = ['cctv', 'local', 'settings'];
    this.currentCategory = categoryMap[index];
    this.selectedChannelIndex = 0;
    this.renderCategories();
    this.renderChannels();
    this.updateFocus();
    this.saveState();
  }

  renderCategories() {
    this.categoryItems.forEach((item, index) => {
      item.classList.toggle('active', index === this.selectedCategoryIndex);
    });
  }

  renderChannels() {
    this.itemsContainer.innerHTML = '';
    
    if (this.currentCategory === 'settings') return;

    const channels = this.channelManager.getChannelsByCategory(this.currentCategory);
    const currentChannel = this.channelManager.getCurrentChannel();

    channels.forEach((channel, index) => {
      const item = document.createElement('div');
      item.className = `channel-item ${this.textSize}`;
      item.textContent = channel.name;
      item.dataset.channelId = channel.id;
      item.tabIndex = 0;
      
      if (channel.id === currentChannel.id) {
        item.classList.add('active');
      }

      item.addEventListener('click', () => {
        console.log('Channel clicked:', channel.id, channel.name);
        this.hide();
        this.onChannelSelect(channel.id);
      });

      this.itemsContainer.appendChild(item);
    });
  }

  updateFocus() {
    const items = this.itemsContainer.querySelectorAll('.channel-item');
    if (items.length > 0 && this.selectedChannelIndex < items.length) {
      items[this.selectedChannelIndex].focus();
    }
  }

  handleArrowUp() {
    if (this.selectedCategoryIndex === 2) {
      // 在设置分类时，向上切换到地方频道
      this.selectCategory(1);
      return;
    }
    
    const items = this.itemsContainer.querySelectorAll('.channel-item');
    if (this.selectedChannelIndex > 0) {
      this.selectedChannelIndex--;
      items[this.selectedChannelIndex]?.focus();
      this.saveState();
    }
  }

  handleArrowDown() {
    if (this.selectedCategoryIndex === 2) {
      // 在设置分类时，向下切换到央视频道
      this.selectCategory(0);
      return;
    }
    
    const items = this.itemsContainer.querySelectorAll('.channel-item');
    if (this.selectedChannelIndex < items.length - 1) {
      this.selectedChannelIndex++;
      items[this.selectedChannelIndex]?.focus();
      this.saveState();
    }
  }

  handleArrowLeft() {
    if (this.selectedCategoryIndex > 0) {
      this.selectCategory(this.selectedCategoryIndex - 1);
    } else {
      // 已在最左侧分类，关闭抽屉
      this.hide();
    }
  }

  handleArrowRight() {
    if (this.selectedCategoryIndex < 2) {
      this.selectCategory(this.selectedCategoryIndex + 1);
    }
  }

  handleEnter() {
    if (this.selectedCategoryIndex === 2) {
      this.hide();
      this.onChannelSelect(null, 'settings');
      return;
    }

    const items = this.itemsContainer.querySelectorAll('.channel-item');
    const selectedItem = items[this.selectedChannelIndex];
    if (selectedItem) {
      const channelId = parseInt(selectedItem.dataset.channelId);
      console.log('Channel selected via Enter:', channelId);
      if (!isNaN(channelId)) {
        this.hide();
        this.onChannelSelect(channelId);
      }
    }
  }
}
