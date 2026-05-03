class WebViewController {
  constructor() {
    this.webview = null;
    this.onLoadStart = null;
    this.onLoadFinish = null;
    this.onLoadError = null;
    this.isLoading = false;
    this.loadStartTime = 0;
    this.currentUrl = null;
  }

  initialize(webviewElement) {
    this.webview = webviewElement;

    this.webview.addEventListener('dom-ready', () => {
      console.log('WebView dom-ready');
      this.executeJavaScript(getFastLoadingScript());
    });

    this.webview.addEventListener('did-finish-load', () => {
      console.log('WebView did-finish-load, src:', this.webview.src);
      if (this.webview.src && this.webview.src !== 'about:blank') {
        this.isLoading = false;
        
        setTimeout(() => {
          this.executeJavaScript(getAutoFullscreenScript());
        }, 500);

        if (this.onLoadFinish) {
          this.onLoadFinish();
        }
      }
    });

    this.webview.addEventListener('did-fail-load', (event) => {
      console.error('WebView did-fail-load:', event.errorCode, event.errorDescription);
      this.isLoading = false;
      
      // 忽略 -3 (ERR_ABORTED) 错误，这是正常的取消加载
      if (event.errorCode !== -3 && this.onLoadError) {
        this.onLoadError(event.errorDescription);
      }
    });

    this.webview.addEventListener('did-start-loading', () => {
      console.log('WebView did-start-loading');
      this.isLoading = true;
      this.loadStartTime = Date.now();
    });

    this.webview.addEventListener('did-stop-loading', () => {
      console.log('WebView did-stop-loading');
      this.isLoading = false;
    });

    this.webview.addEventListener('console-message', (event) => {
      console.log('WebView console:', event.message);
    });
  }

  loadUrl(url) {
    console.log('WebView loading URL:', url);
    this.currentUrl = url;
    
    if (this.webview) {
      if (this.onLoadStart) {
        this.onLoadStart();
      }
      
      // 先设置为 about:blank 再设置目标 URL，确保触发加载事件
      if (this.webview.src === url) {
        // 如果 URL 相同，强制刷新
        this.webview.reload();
      } else {
        this.webview.src = url;
      }
    } else {
      console.error('WebView not initialized');
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

  getLoadDuration() {
    if (this.loadStartTime === 0) return 0;
    return Date.now() - this.loadStartTime;
  }
}
