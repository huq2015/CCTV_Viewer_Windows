class LoadingOverlay {
  constructor() {
    this.element = document.getElementById('loading-overlay');
  }

  show(message = '正在切换频道...') {
    const textEl = this.element.querySelector('.loading-text');
    if (textEl) {
      textEl.textContent = message;
    }
    this.element.classList.add('active');
  }

  hide() {
    this.element.classList.remove('active');
  }

  isVisible() {
    return this.element.classList.contains('active');
  }
}


