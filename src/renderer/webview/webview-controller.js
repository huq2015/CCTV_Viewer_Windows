const {
  getFastLoadingScript,
  getAutoFullscreenScript,
  getZoomScript,
  getPlayPauseScript,
  getFullscreenToggleScript
} = require('./inject-scripts');

class WebViewController {
  constructor() {
    this.webview = null;
    this.onLoadStart = null;
    this.onLoadFinish = null;
    this.onLoadError = null;
  }

  initialize(webviewElement) {
    this.webview = webviewElement;

    this.webview.addEventListener('dom-ready', () => {
      this.executeJavaScript(getFastLoadingScript());
    });

    this.webview.addEventListener('did-finish-load', () => {
      if (this.webview.src && this.webview.src !== 'about:blank') {
        setTimeout(() => {
          this.executeJavaScript(getAutoFullscreenScript());
        }, 500);

        if (this.onLoadFinish) {
          this.onLoadFinish();
        }
      }
    });

    this.webview.addEventListener('did-fail-load', (event) => {
      if (event.errorCode !== -3 && this.onLoadError) {
        this.onLoadError(event.errorDescription);
      }
    });
  }

  loadUrl(url) {
    if (this.webview) {
      if (this.onLoadStart) {
        this.onLoadStart();
      }
      this.webview.src = url;
    }
  }

  reload() {
    if (this.webview) {
      if (this.onLoadStart) {
        this.onLoadStart();
      }
      this.webview.reload();
    }
  }

  executeJavaScript(code) {
    if (this.webview) {
      this.webview.executeJavaScript(code, true).catch(err => {
        console.error('JS injection error:', err);
      });
    }
  }

  zoomIn() {
    this.executeJavaScript(getZoomScript('in'));
  }

  zoomOut() {
    this.executeJavaScript(getZoomScript('out'));
  }

  togglePlayPause() {
    this.executeJavaScript(getPlayPauseScript());
  }

  toggleFullscreen() {
    this.executeJavaScript(getFullscreenToggleScript());
  }
}

module.exports = WebViewController;
