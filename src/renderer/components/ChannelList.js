class ChannelList {
  constructor(channelManager, onChannelSelect) {
    this.channelManager = channelManager;
    this.onChannelSelect = onChannelSelect;
    this.element = document.getElementById('channel-list');
    this.itemsContainer = document.getElementById('channel-items');
    this.categoryItems = this.element.querySelectorAll('.category-item');
    
    this.currentCategory = 'cctv';
    this.selectedCategoryIndex = 0;
    this.selectedChannelIndex = 0;
    this.textSize = 'medium';
    this.isVisible = false;

    this.setupEventListeners();
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

  setTextSize(size) {
    this.textSize = size;
    this.renderChannels();
  }

  show() {
    this.isVisible = true;
    this.element.classList.add('active');
    this.renderCategories();
    this.renderChannels();
    this.updateFocus();
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

  selectCategory(index) {
    this.selectedCategoryIndex = index;
    const categoryMap = ['cctv', 'local', 'settings'];
    this.currentCategory = categoryMap[index];
    this.selectedChannelIndex = 0;
    this.renderCategories();
    this.renderChannels();
    this.updateFocus();
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
      item.tabIndex = 0;
      
      if (channel.id === currentChannel.id) {
        item.classList.add('active');
      }

      item.addEventListener('click', () => {
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
    if (this.selectedCategoryIndex < 2) {
      const items = this.itemsContainer.querySelectorAll('.channel-item');
      if (this.selectedChannelIndex > 0) {
        this.selectedChannelIndex--;
        items[this.selectedChannelIndex]?.focus();
      }
    }
  }

  handleArrowDown() {
    if (this.selectedCategoryIndex < 2) {
      const items = this.itemsContainer.querySelectorAll('.channel-item');
      if (this.selectedChannelIndex < items.length - 1) {
        this.selectedChannelIndex++;
        items[this.selectedChannelIndex]?.focus();
      }
    }
  }

  handleArrowLeft() {
    if (this.selectedCategoryIndex > 0) {
      this.selectCategory(this.selectedCategoryIndex - 1);
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
      const channelName = selectedItem.textContent;
      const channels = this.channelManager.getChannelsByCategory(this.currentCategory);
      const channel = channels.find(ch => ch.name === channelName);
      if (channel) {
        this.hide();
        this.onChannelSelect(channel.id);
      }
    }
  }
}

module.exports = ChannelList;
