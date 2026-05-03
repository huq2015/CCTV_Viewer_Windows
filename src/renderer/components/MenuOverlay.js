class MenuOverlay {
  constructor(webViewController, onSettingsOpen) {
    this.webViewController = webViewController;
    this.onSettingsOpen = onSettingsOpen;
    this.element = document.getElementById('menu-overlay');
    this.menuItems = this.element.querySelectorAll('.menu-item');
    
    this.selectedIndex = 0;
    this.isVisible = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.menuItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.executeAction(item.dataset.action);
      });
    });
  }

  show() {
    this.isVisible = true;
    this.element.classList.add('active');
    this.selectedIndex = 0;
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

  updateFocus() {
    this.menuItems.forEach((item, index) => {
      item.classList.toggle('active', index === this.selectedIndex);
      if (index === this.selectedIndex) {
        item.focus();
      }
    });
  }

  handleArrowLeft() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateFocus();
    }
  }

  handleArrowRight() {
    if (this.selectedIndex < this.menuItems.length - 1) {
      this.selectedIndex++;
      this.updateFocus();
    }
  }

  handleEnter() {
    const item = this.menuItems[this.selectedIndex];
    if (item) {
      this.executeAction(item.dataset.action);
    }
  }

  executeAction(action) {
    switch (action) {
      case 'refresh':
        this.webViewController.reload();
        break;
      case 'play-pause':
        this.webViewController.togglePlayPause();
        break;
      case 'fullscreen':
        this.webViewController.toggleFullscreen();
        break;
      case 'zoom-in':
        this.webViewController.zoomIn();
        break;
      case 'zoom-out':
        this.webViewController.zoomOut();
        break;
      case 'settings':
        this.hide();
        this.onSettingsOpen();
        break;
    }
  }
}

module.exports = MenuOverlay;
