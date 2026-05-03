const { session } = require('electron');

class SessionManager {
  constructor() {
    this.webviewSession = null;
  }

  initialize() {
    // 创建或获取 webview 的 session
    this.webviewSession = session.fromPartition('persist:webview');
    
    this.setupRequestHeaders();
    this.setupCorsHandling();
  }

  setupRequestHeaders() {
    // 修改请求头，模拟真实浏览器
    this.webviewSession.webRequest.onBeforeSendHeaders({
      urls: ['*://*.cctv.com/*', '*://*.yangshipin.cn/*', '*://*.cntv.cn/*']
    }, (details, callback) => {
      const headers = details.requestHeaders;
      
      // 设置标准的浏览器请求头
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8';
      headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
      headers['Accept-Encoding'] = 'gzip, deflate, br';
      headers['Cache-Control'] = 'max-age=0';
      headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['Sec-Ch-Ua-Mobile'] = '?0';
      headers['Sec-Ch-Ua-Platform'] = '"Windows"';
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'none';
      headers['Sec-Fetch-User'] = '?1';
      headers['Upgrade-Insecure-Requests'] = '1';
      
      // 对于央视网和央视频，设置合适的 Referer
      if (details.url.includes('tv.cctv.com')) {
        headers['Referer'] = 'https://tv.cctv.com/';
      } else if (details.url.includes('yangshipin.cn')) {
        headers['Referer'] = 'https://www.yangshipin.cn/';
      }

      callback({ requestHeaders: headers });
    });
  }

  setupCorsHandling() {
    // 处理响应头，移除可能阻止加载的安全头
    this.webviewSession.webRequest.onHeadersReceived({
      urls: ['<all_urls>']
    }, (details, callback) => {
      const headers = details.responseHeaders;
      
      // 移除 X-Frame-Options 以允许在 webview 中嵌入
      if (headers['X-Frame-Options']) {
        delete headers['X-Frame-Options'];
      }
      if (headers['x-frame-options']) {
        delete headers['x-frame-options'];
      }
      
      // 修改 Content-Security-Policy 以允许资源加载
      if (headers['Content-Security-Policy']) {
        delete headers['Content-Security-Policy'];
      }
      if (headers['content-security-policy']) {
        delete headers['content-security-policy'];
      }

      callback({ responseHeaders: headers });
    });
  }

  getSession() {
    return this.webviewSession;
  }
}

module.exports = SessionManager;
