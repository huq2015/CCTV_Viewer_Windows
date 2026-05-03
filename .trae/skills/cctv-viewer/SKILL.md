---
name: "cctv-viewer"
description: "CCTV Viewer Windows 端开发助手。在需要开发、调试或优化电视浏览器应用时调用，提供项目结构指导、代码审查和功能实现建议。"
---

# CCTV Viewer Windows 端开发规范

## 项目概述
基于 Electron 技术栈的电视浏览器 Windows 端应用，实现通过 WebView 加载央视网/央视频网页观看电视直播。

本项目采用 **Vibe Coding** 开发模式，使用 Trae Solo AI IDE 和 Kimi-K2.6 大语言模型辅助开发。

### 参考项目
- **原 Android 版**: [Eanya-Tonic/CCTV_Viewer](https://github.com/Eanya-Tonic/CCTV_Viewer.git)
- **作者**: [Eanya-Tonic](https://github.com/Eanya-Tonic)
- **说明**: 本项目为 Android TV 版电视浏览器的 Windows 桌面端移植版本

## 技术栈
- **框架**: Electron 28+ (基于 Chromium 120+)
- **前端**: HTML5 + CSS3 + Vanilla JavaScript (ES2022)
- **构建工具**: Electron Forge
- **包管理**: npm
- **配置存储**: electron-store
- **开发工具**: Trae Solo (AI 原生 IDE)
- **AI 模型**: Kimi-K2.6 (大语言模型辅助编程)

## 目录结构规范
```
CCTV_Viewer_Windows/
├── package.json              # 项目配置与依赖
├── forge.config.js           # Electron Forge 打包配置
├── src/
│   ├── main/                 # 主进程代码
│   │   ├── index.js          # 主进程入口
│   │   ├── window-manager.js # 窗口管理
│   │   ├── keyboard-handler.js # 键盘事件监听
│   │   ├── session-manager.js # Session 管理（请求头配置）
│   │   ├── preload.js        # 预加载脚本
│   │   └── store.js          # 配置存储
│   ├── renderer/             # 渲染进程代码
│   │   ├── index.html        # 主页面 HTML
│   │   ├── index.js          # 渲染进程入口
│   │   ├── styles/           # CSS 样式文件
│   │   ├── components/       # UI 组件
│   │   ├── webview/          # WebView 控制
│   │   └── utils/            # 工具类
│   └── assets/               # 静态资源
└── .trae/
    ├── documents/            # 项目文档
    └── skills/               # 技能配置
```

## 核心功能模块

### 1. 频道数据 (constants.js)
- 41 个频道（20 个央视频道 + 21 个地方卫视）
- 数据结构: `{ id, name, category, url }`
- 央视频道 URL: `https://tv.cctv.com/live/cctvX/`
- 地方卫视 URL: `https://www.yangshipin.cn/tv/home?pid=...`

### 2. WebView 加载流程
1. 用户触发换台 → 显示加载覆盖层
2. 设置 `webview.src = channel.url`
3. 监听 `dom-ready` → 注入 FastLoading 脚本
4. 监听 `did-finish-load` → 注入 AutoFullscreen 脚本
5. 延迟 500ms → 隐藏加载覆盖层

### 3. 键盘事件映射
- `ArrowUp` → 上一个频道 / 列表上移
- `ArrowDown` → 下一个频道 / 列表下移
- `ArrowLeft` → 返回上级 / 关闭抽屉（当在第一个分类时）
- `ArrowRight` → 切换分类
- `Enter` → 打开频道列表 / 确认选择
- `M` → 打开底部菜单
- `Escape` / `B` → 返回/关闭
- `R` / `F5` → 刷新页面
- `+` / `-` → 放大/缩小页面

### 4. 配置项
- `currentChannelId`: 当前频道 ID (number)
- `settings.directChannelChange`: 直接换台 (boolean)
- `settings.directBack`: 直接返回 (boolean)
- `settings.textSize`: 字体大小 (small/medium/large/xlarge)

### 5. 启动行为与频道持久化

#### 启动流程
1. 应用启动时不自动打开开发者工具（仅在 `NODE_ENV=development` 或 `DEBUG=true` 时打开）
2. 初始化 `ChannelManager`，从 `electron-store` 读取 `currentChannelId`
3. 如果存在保存的频道 ID，恢复上次观看的频道
4. 如果不存在保存的频道 ID，默认加载第一个频道（CCTV-1 综合）
5. 自动加载频道内容到 WebView

#### 频道状态保存
- 每次切换频道时，`ChannelManager.setCurrentChannel()` 自动保存当前频道 ID
- 使用 `electron-store` 持久化存储，路径：`%APPDATA%/CCTVViewer/config.json`
- 应用重启后自动恢复上次观看位置

#### 代码实现
```javascript
// channel-manager.js
class ChannelManager {
  async initialize() {
    const savedChannelId = await this.ipcClient.getStore('currentChannelId');
    if (savedChannelId !== undefined && savedChannelId !== null) {
      this.currentChannelId = savedChannelId;
    }
    return this.currentChannelId;
  }

  setCurrentChannel(channelId) {
    this.currentChannelId = channelId;
    this.ipcClient.setStore('currentChannelId', channelId); // 自动保存
  }
}

// index.js 启动逻辑
const channelToLoad = this.channelManager.getCurrentChannel();
if (channelToLoad) {
  this.loadChannel(channelToLoad.id);
  this.initialChannelLoaded = true;
}
```

## 网络请求头配置

### 问题背景
央视频(yangshipin.cn)和央视网(tv.cctv.com)服务器会检测请求头，缺少标准浏览器头会导致内容无法加载。

### 解决方案
使用 Electron `session.webRequest.onBeforeSendHeaders` API 修改请求头：

```javascript
// session-manager.js
const { session } = require('electron');

class SessionManager {
  initialize() {
    const webviewSession = session.fromPartition('persist:webview');
    
    webviewSession.webRequest.onBeforeSendHeaders({
      urls: ['*://*.cctv.com/*', '*://*.yangshipin.cn/*']
    }, (details, callback) => {
      const headers = details.requestHeaders;
      
      // 设置标准的浏览器请求头
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
      headers['Accept-Language'] = 'zh-CN,zh;q=0.9';
      headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['Sec-Ch-Ua-Mobile'] = '?0';
      headers['Sec-Ch-Ua-Platform'] = '"Windows"';
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'none';
      headers['Sec-Fetch-User'] = '?1';
      headers['Upgrade-Insecure-Requests'] = '1';
      
      // 设置 Referer
      if (details.url.includes('tv.cctv.com')) {
        headers['Referer'] = 'https://tv.cctv.com/';
      } else if (details.url.includes('yangshipin.cn')) {
        headers['Referer'] = 'https://www.yangshipin.cn/';
      }

      callback({ requestHeaders: headers });
    });
  }
}
```

### 关键请求头说明
| 请求头 | 作用 |
|--------|------|
| User-Agent | 标识浏览器类型和版本 |
| Accept | 声明可接受的响应格式 |
| Accept-Language | 声明首选语言 |
| Sec-Ch-Ua | Chrome 品牌标识 |
| Sec-Fetch-* | 请求元数据（目的地、模式等） |
| Referer | 标识请求来源页面 |
| Upgrade-Insecure-Requests | 请求升级到 HTTPS |

### 响应头处理
同时需要移除阻止嵌入的安全头：
```javascript
webviewSession.webRequest.onHeadersReceived({
  urls: ['<all_urls>']
}, (details, callback) => {
  const headers = details.responseHeaders;
  
  // 移除 X-Frame-Options 以允许在 webview 中嵌入
  delete headers['X-Frame-Options'];
  delete headers['x-frame-options'];
  
  // 移除 Content-Security-Policy
  delete headers['Content-Security-Policy'];
  delete headers['content-security-policy'];

  callback({ responseHeaders: headers });
});
```

## 开发注意事项

### 渲染进程脚本加载
- 渲染进程使用 `<script>` 标签直接加载 JS 文件
- **不要使用** `require()` 或 `module.exports`
- 所有类定义自动成为全局变量
- 加载顺序：constants → ipc-client → channel-manager → inject-scripts → webview-controller → components → index

### 安全规范
- `contextIsolation: true` 必须启用
- `nodeIntegration: false` 必须禁用
- 使用 `contextBridge` 暴露 API 到渲染进程
- CSP 策略需配置允许媒体加载

### WebView 配置
```html
<webview
  id="tv-webview"
  src="about:blank"
  allowpopups="false"
  nodeintegration="false"
  partition="persist:webview"
  webpreferences="contextIsolation=true, nodeIntegration=false, allowRunningInsecureContent=true"
  disablewebsecurity="true"
></webview>
```

### 开发者工具控制
```javascript
// window-manager.js
// 仅在开发环境或调试模式下打开开发者工具
if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
  this.mainWindow.webContents.openDevTools();
}
```

## 常见问题排查

### 1. require is not defined / module is not defined
**原因**: 渲染进程中使用了 Node.js 的 CommonJS 语法
**解决**: 移除所有 `require()` 和 `module.exports`，改用 `<script>` 标签加载

### 2. WebView 黑屏/不加载
**排查步骤**:
1. 检查 `webviewTag: true` 是否在 BrowserWindow 配置中启用
2. 检查 `session-manager.js` 是否正确配置请求头
3. 查看 Network 面板检查请求是否被拦截
4. 检查控制台是否有 CSP 或 X-Frame-Options 错误

### 3. 央视频内容加载失败
**排查步骤**:
1. 检查 `session-manager.js` 是否已初始化
2. 验证 `onBeforeSendHeaders` 是否正确设置 User-Agent
3. 检查 `onHeadersReceived` 是否移除了 X-Frame-Options
4. 确认 webview 的 `partition` 与 session 的 partition 一致

### 4. 键盘事件不响应
**排查步骤**:
1. 检查 `globalShortcut` 是否正确注册
2. 确认窗口是否有焦点
3. 检查 IPC 通信是否正常

### 5. 启动时未加载频道 / 总是加载第一个频道
**排查步骤**:
1. 检查 `channel-manager.js` 的 `initialize()` 是否正确读取存储的 `currentChannelId`
2. 检查 `index.js` 是否在初始化完成后调用 `loadChannel()`
3. 验证 `electron-store` 存储路径是否有写入权限
4. 检查控制台是否有 `Restored channel ID:` 日志输出

### 6. 开发者工具自动打开
**原因**: 生产环境下不应自动打开开发者工具
**解决**: 使用环境变量控制：
```javascript
if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
  this.mainWindow.webContents.openDevTools();
}
```

### 7. 抽屉状态未恢复 / 左方向键无法关闭抽屉
**排查步骤**:
1. 检查 `ChannelList.loadState()` 是否正确读取 `channelListState`
2. 验证 `handleArrowLeft()` 是否在第一个分类时调用 `hide()`
3. 检查 `saveState()` 是否在状态变化时被调用
4. 确认 `ipcClient` 是否正确传递给 `ChannelList` 构造函数

## 代码审查清单
- [ ] 所有频道 URL 是否正确
- [ ] WebView 事件监听是否完整
- [ ] 键盘快捷键是否正确注册
- [ ] IPC 通信是否双向正常
- [ ] 配置读写是否持久化
- [ ] CSS 样式是否正确加载
- [ ] JS 注入脚本是否执行成功
- [ ] Session 管理器是否初始化
- [ ] 请求头配置是否完整
- [ ] 响应头处理是否正确
