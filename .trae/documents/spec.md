# CCTV_Viewer Windows 端 MVP Spec 文档

## 1. 项目概述

### 1.1 目标
基于 Electron 技术栈，将 Android 版「电视浏览器」移植到 Windows 平台，实现最小可行产品（MVP）。

### 1.2 MVP 功能范围
1. 单 WebView 加载指定频道网页
2. JavaScript 注入实现自动全屏
3. 键盘方向键换台
4. 频道列表覆盖层
5. 设置界面（仅保留必要选项）

### 1.3 非目标（后续迭代）
- 双 WebView 缓冲加载
- 数字键直达换台
- 页面缩放功能
- 节目信息提取显示
- X5 内核相关功能
- 自动更新机制

---

## 2. 技术架构

### 2.1 技术栈
- **框架**: Electron 28+ (基于 Chromium 120+)
- **前端**: HTML5 + CSS3 + Vanilla JavaScript (ES2022)
- **构建工具**: Electron Forge (Webpack / Vite 打包)
- **包管理**: npm
- **配置存储**: electron-store

### 2.2 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      Electron 主进程                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 窗口管理     │  │ 键盘事件监听 │  │ 配置管理 (electron-store)│  │
│  │ (BrowserWindow)│ │ (globalShortcut)│ │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ IPC 通信
┌─────────────────────────────────────────────────────────────┐
│                    渲染进程 (Renderer)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  UI 层 (HTML/CSS/JS)                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │  │
│  │  │ 频道列表  │  │ 底部菜单  │  │ 设置界面              │ │  │
│  │  │ 覆盖层    │  │ 覆盖层    │  │ (Preference 样式)     │ │  │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              WebView 层 (<webview> 标签)               │  │
│  │         加载央视网/央视频网页，执行 JS 注入              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 进程职责划分

#### 主进程 (Main Process)
- 创建和管理 BrowserWindow
- 注册全局键盘快捷键（方向键、Enter、Esc、M 键等）
- 管理应用生命周期（启动、退出）
- 通过 electron-store 读写配置
- 向渲染进程发送键盘事件通知

#### 渲染进程 (Renderer Process)
- 渲染所有 UI 覆盖层（频道列表、菜单、设置）
- 嵌入 `<webview>` 标签加载电视网页
- 执行 JavaScript 注入（自动全屏、页面精简）
- 处理用户交互（点击、焦点管理）
- 通过 IPC 与主进程通信

---

## 3. 目录结构

```
CCTV_Viewer_Windows/
├── package.json              # 项目配置与依赖
├── forge.config.js           # Electron Forge 打包配置
├── src/
│   ├── main/                 # 主进程代码
│   │   ├── index.js          # 主进程入口
│   │   ├── window-manager.js # 窗口管理（创建、全屏、焦点）
│   │   ├── keyboard-handler.js # 键盘事件监听与分发
│   │   └── store.js          # 配置存储封装
│   ├── renderer/             # 渲染进程代码
│   │   ├── index.html        # 主页面 HTML
│   │   ├── index.js          # 渲染进程入口
│   │   ├── styles/
│   │   │   ├── main.css      # 全局样式
│   │   │   ├── channel-list.css # 频道列表样式
│   │   │   ├── menu.css      # 底部菜单样式
│   │   │   └── settings.css  # 设置界面样式
│   │   ├── components/
│   │   │   ├── ChannelList.js   # 频道列表组件
│   │   │   ├── MenuOverlay.js   # 底部菜单组件
│   │   │   ├── SettingsPanel.js # 设置面板组件
│   │   │   └── LoadingOverlay.js # 加载覆盖层组件
│   │   ├── webview/
│   │   │   ├── webview-controller.js # WebView 管理
│   │   │   └── inject-scripts.js     # JS 注入脚本集合
│   │   └── utils/
│   │       ├── ipc-client.js  # IPC 通信封装
│   │       └── constants.js   # 常量定义（频道列表等）
│   └── assets/               # 静态资源
│       ├── icons/            # 应用图标
│       └── images/           # UI 图片资源
└── docs/
    └── README.md             # 项目说明
```

---

## 4. 核心功能规范

### 4.1 频道数据定义

频道列表完全复用 Android 版的 41 个频道，数据结构如下：

```javascript
// src/renderer/utils/constants.js
const CHANNELS = [
  // 央视频道 (0-19)
  { id: 0,  name: "CCTV-1 综合",       category: "cctv", url: "https://tv.cctv.com/live/cctv1/" },
  { id: 1,  name: "CCTV-2 财经",       category: "cctv", url: "https://tv.cctv.com/live/cctv2/" },
  { id: 2,  name: "CCTV-3 综艺",       category: "cctv", url: "https://tv.cctv.com/live/cctv3/" },
  { id: 3,  name: "CCTV-4 中文国际（亚）", category: "cctv", url: "https://tv.cctv.com/live/cctv4/" },
  { id: 4,  name: "CCTV-5 体育",       category: "cctv", url: "https://tv.cctv.com/live/cctv5/" },
  { id: 5,  name: "CCTV-6 电影",       category: "cctv", url: "https://tv.cctv.com/live/cctv6/" },
  { id: 6,  name: "CCTV-7 国防军事",    category: "cctv", url: "https://tv.cctv.com/live/cctv7/" },
  { id: 7,  name: "CCTV-8 电视剧",      category: "cctv", url: "https://tv.cctv.com/live/cctv8/" },
  { id: 8,  name: "CCTV-9 纪录",       category: "cctv", url: "https://tv.cctv.com/live/cctvjilu" },
  { id: 9,  name: "CCTV-10 科教",      category: "cctv", url: "https://tv.cctv.com/live/cctv10/" },
  { id: 10, name: "CCTV-11 戏曲",      category: "cctv", url: "https://tv.cctv.com/live/cctv11/" },
  { id: 11, name: "CCTV-12 社会与法",   category: "cctv", url: "https://tv.cctv.com/live/cctv12/" },
  { id: 12, name: "CCTV-13 新闻",      category: "cctv", url: "https://tv.cctv.com/live/cctv13/" },
  { id: 13, name: "CCTV-14 少儿",      category: "cctv", url: "https://tv.cctv.com/live/cctvchild" },
  { id: 14, name: "CCTV-15 音乐",      category: "cctv", url: "https://tv.cctv.com/live/cctv15/" },
  { id: 15, name: "CCTV-16 奥林匹克",   category: "cctv", url: "https://tv.cctv.com/live/cctv16/" },
  { id: 16, name: "CCTV-17 农业农村",   category: "cctv", url: "https://tv.cctv.com/live/cctv17/" },
  { id: 17, name: "CCTV-5+ 体育赛事",   category: "cctv", url: "https://tv.cctv.com/live/cctv5plus/" },
  { id: 18, name: "CCTV-4 中文国际（欧）", category: "cctv", url: "https://tv.cctv.com/live/cctveurope" },
  { id: 19, name: "CCTV-4 中文国际（美）", category: "cctv", url: "https://tv.cctv.com/live/cctvamerica/" },
  
  // 地方卫视 (20-40)
  { id: 20, name: "北京卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002309" },
  { id: 21, name: "江苏卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002521" },
  { id: 22, name: "东方卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002483" },
  { id: 23, name: "浙江卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002520" },
  { id: 24, name: "湖南卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002475" },
  { id: 25, name: "湖北卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002508" },
  { id: 26, name: "广东卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002485" },
  { id: 27, name: "广西卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002509" },
  { id: 28, name: "黑龙江卫视", category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002498" },
  { id: 29, name: "海南卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002506" },
  { id: 30, name: "重庆卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002531" },
  { id: 31, name: "深圳卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002481" },
  { id: 32, name: "四川卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002516" },
  { id: 33, name: "河南卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002525" },
  { id: 34, name: "福建东南卫视", category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002484" },
  { id: 35, name: "贵州卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002490" },
  { id: 36, name: "江西卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002503" },
  { id: 37, name: "辽宁卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002505" },
  { id: 38, name: "安徽卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002532" },
  { id: 39, name: "河北卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002493" },
  { id: 40, name: "山东卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002513" }
];
```

### 4.2 WebView 加载规范

#### 4.2.1 WebView 配置
```javascript
// webview 标签属性
<webview
  id="tv-webview"
  src="about:blank"
  useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  allowpopups="false"
  nodeintegration="false"
  contextIsolation="true"
  disablewebsecurity="false"
  partition="persist:webview"
></webview>
```

#### 4.2.2 页面加载流程
1. 用户触发换台 → 显示加载覆盖层
2. 设置 `webview.src = channel.url`
3. 监听 `dom-ready` 事件 → 注入 `FastLoading` 脚本
4. 监听 `did-finish-load` 事件 → 注入 `AutoFullscreen` 脚本
5. 延迟 500ms → 隐藏加载覆盖层

### 4.3 JavaScript 注入规范

#### 4.3.1 FastLoading 脚本（页面精简）
直接复用 Android 版逻辑，在 `dom-ready` 时注入：

```javascript
function FastLoading() {
  const fullscreenBtn = document.querySelector('#player_pagefullscreen_yes_player') 
    || document.querySelector('.videoFull');
  if (fullscreenBtn) return;

  // 清空所有图片的 src 属性
  Array.from(document.getElementsByTagName('img')).forEach(img => {
    img.src = '';
  });

  // 清空特定的脚本 src 属性
  const scriptKeywords = ['login', 'index', 'daohang', 'grey', 'jquery'];
  Array.from(document.getElementsByTagName('script')).forEach(script => {
    if (scriptKeywords.some(keyword => script.src.includes(keyword))) {
      script.src = '';
    }
  });

  // 清空具有特定 class 的 div 内容
  const classNames = ['newmap', 'newtopbz', 'newtopbzTV', 'column_wrapper'];
  classNames.forEach(className => {
    Array.from(document.getElementsByClassName(className)).forEach(div => {
      div.innerHTML = '';
    });
  });

  setTimeout(FastLoading, 4);
}
FastLoading();
```

#### 4.3.2 AutoFullscreen 脚本（自动全屏）
在 `did-finish-load` 时注入：

```javascript
function AutoFullscreen() {
  var fullscreenBtn = document.querySelector('#player_pagefullscreen_yes_player') 
    || document.querySelector('.videoFull');
  if (fullscreenBtn != null) {
    fullscreenBtn.click();
    var video = document.querySelector('video');
    if (video) video.volume = 1;
  } else {
    setTimeout(() => { AutoFullscreen(); }, 16);
  }
}
AutoFullscreen();
```

### 4.4 键盘输入映射规范

| 按键 | 功能 | 触发条件 |
|------|------|---------|
| `ArrowUp` | 上一个频道 | 非菜单/列表打开状态 |
| `ArrowDown` | 下一个频道 | 非菜单/列表打开状态 |
| `Enter` | 打开频道列表 | 非菜单/列表打开状态 |
| `M` | 打开/关闭底部菜单 | 全局 |
| `Esc` / `B` | 返回/关闭当前覆盖层 | 全局 |
| `+` / `-` | 页面放大/缩小 | 菜单打开时 |
| `F5` / `R` | 刷新页面 | 全局 |

### 4.5 频道列表覆盖层规范

#### 4.5.1 交互设计
- **触发方式**：按 `Enter` 键或 `ArrowUp`/`ArrowDown`（根据设置）
- **布局**：左侧双栏抽屉式菜单
  - 第一栏："央视频道"、"地方频道"、"打开设置"
  - 第二栏：对应分类的频道列表
- **焦点管理**：
  - 方向键上下移动焦点
  - 左右键切换一级/二级菜单
  - Enter 确认选择
  - Esc 关闭列表
- **视觉样式**：半透明黑色背景 (`rgba(0,0,0,0.85)`)，白色文字，选中项高亮

#### 4.5.2 状态管理
```javascript
const channelListState = {
  visible: false,        // 是否显示
  selectedCategory: 0,   // 0: cctv, 1: local
  selectedIndex: {       // 各分类当前选中索引
    cctv: 0,
    local: 0
  },
  currentChannelId: 0    // 当前播放频道 ID
};
```

### 4.6 底部菜单覆盖层规范

#### 4.6.1 菜单项
| 图标 | 文字 | 功能 |
|------|------|------|
| 🔄 | 刷新页面 | `webview.reload()` |
| ▶️ | 播放/暂停 | 注入 JS 控制视频播放 |
| ⛶ | 切换全屏 | 注入 JS 点击全屏按钮 |
| 🔍+ | 放大页面 | 注入 JS 增加 `document.body.style.zoom` |
| 🔍- | 缩小页面 | 注入 JS 减少 `document.body.style.zoom` |
| ⚙️ | 打开设置 | 打开设置面板 |

#### 4.6.2 交互设计
- **触发方式**：按 `M` 键
- **布局**：底部横向工具栏，6 个等宽按钮
- **焦点管理**：左右方向键切换焦点，Enter 执行，Esc 关闭

### 4.7 设置界面规范

#### 4.7.1 MVP 保留设置项
| 设置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `directChannelChange` | Boolean | `false` | 上下键直接换台，不弹出列表 |
| `directBack` | Boolean | `true` | 频道列表中按 Esc 直接关闭 |
| `textSize` | Enum | `"medium"` | 频道列表字体大小 |

#### 4.7.2 配置存储 Schema
```javascript
// electron-store schema
const storeSchema = {
  currentChannelId: { type: 'number', default: 0 },
  settings: {
    type: 'object',
    properties: {
      directChannelChange: { type: 'boolean', default: false },
      directBack: { type: 'boolean', default: true },
      textSize: { type: 'string', enum: ['small', 'medium', 'large', 'xlarge'], default: 'medium' }
    }
  }
};
```

---

## 5. UI 设计规范

### 5.1 色彩方案
```css
:root {
  --bg-primary: #000000;           /* 主背景 */
  --bg-overlay: rgba(0, 0, 0, 0.85); /* 覆盖层背景 */
  --bg-overlay-light: rgba(0, 0, 0, 0.5); /* 轻覆盖层 */
  --text-primary: #ffffff;         /* 主文字 */
  --text-secondary: #cccccc;       /* 次要文字 */
  --accent-color: #2196F3;         /* 强调色（选中高亮） */
  --accent-hover: #42A5F5;         /* 悬停色 */
  --border-color: rgba(255, 255, 255, 0.2); /* 边框 */
}
```

### 5.2 字体规范
- 基础字体：`"Microsoft YaHei", "PingFang SC", sans-serif`
- 频道列表字体大小：
  - small: 16px
  - medium: 20px
  - large: 24px
  - xlarge: 28px

### 5.3 布局尺寸
- 频道列表抽屉宽度：第一栏 160px，第二栏 280px
- 底部菜单高度：80px
- 加载覆盖层：全屏
- 设置面板：宽度 500px，右侧滑入

### 5.4 动画规范
- 覆盖层显示/隐藏：fade-in/fade-out，duration 200ms，ease-out
- 频道列表滑入：translateX(-100% → 0)，duration 300ms，ease-out
- 设置面板滑入：translateX(100% → 0)，duration 300ms，ease-out
- 焦点切换：背景色过渡 150ms

---

## 6. IPC 通信规范

### 6.1 主进程 → 渲染进程
| Channel | Payload | 说明 |
|---------|---------|------|
| `keyboard:up` | `{}` | 方向键上 |
| `keyboard:down` | `{}` | 方向键下 |
| `keyboard:enter` | `{}` | Enter 键 |
| `keyboard:menu` | `{}` | M 键（菜单） |
| `keyboard:back` | `{}` | Esc / B 键 |
| `keyboard:refresh` | `{}` | F5 / R 键 |

### 6.2 渲染进程 → 主进程
| Channel | Payload | 说明 |
|---------|---------|------|
| `app:quit` | `{}` | 退出应用 |
| `store:get` | `{ key: string }` | 读取配置 |
| `store:set` | `{ key: string, value: any }` | 写入配置 |
| `window:enter-fullscreen` | `{}` | 进入全屏 |
| `window:exit-fullscreen` | `{}` | 退出全屏 |

---

## 7. 构建与打包规范

### 7.1 开发脚本
```json
{
  "scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make",
    "make:win": "electron-forge make --platform=win32"
  }
}
```

### 7.2 打包目标
- **平台**: Windows 10/11 (x64)
- **格式**: `.exe` 安装程序 (Squirrel.Windows)
- **输出目录**: `out/make/squirrel.windows/x64/`

### 7.3 应用信息
```javascript
// forge.config.js
module.exports = {
  packagerConfig: {
    name: 'CCTVViewer',
    executableName: 'CCTVViewer',
    appBundleId: 'com.eanyatonic.cctvviewer',
    icon: './src/assets/icons/icon',
    win32metadata: {
      CompanyName: 'Eanya-Tonic',
      FileDescription: '电视浏览器 - Windows版',
      OriginalFilename: 'CCTVViewer.exe',
      ProductName: '电视浏览器',
      InternalName: 'CCTVViewer'
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'CCTVViewer',
        setupIcon: './src/assets/icons/icon.ico'
      }
    }
  ]
};
```

---

## 8. 依赖清单

### 8.1 生产依赖
```json
{
  "electron": "^28.0.0",
  "electron-store": "^8.1.0"
}
```

### 8.2 开发依赖
```json
{
  "@electron-forge/cli": "^7.2.0",
  "@electron-forge/maker-squirrel": "^7.2.0",
  "@electron-forge/plugin-auto-unpack-natives": "^7.2.0",
  "@electron-forge/plugin-fuses": "^7.2.0",
  "@electron/fuses": "^1.8.0"
}
```

---

## 9. 测试规范

### 9.1 功能测试清单
- [ ] 应用正常启动，窗口全屏显示
- [ ] 默认加载 CCTV-1 频道
- [ ] 方向键上下可切换频道
- [ ] Enter 键打开频道列表
- [ ] 频道列表中方向键可导航
- [ ] 频道列表中 Enter 确认换台
- [ ] Esc 键关闭频道列表
- [ ] M 键打开底部菜单
- [ ] 底部菜单各功能正常
- [ ] 设置界面可打开
- [ ] 设置项修改后生效
- [ ] 重启后保留上次频道
- [ ] 所有 41 个频道均可加载

### 9.2 兼容性测试
- [ ] Windows 10 正常运行
- [ ] Windows 11 正常运行
- [ ] 键盘操作响应流畅
- [ ] 长时间播放无内存泄漏

---

## 10. 注意事项

### 10.1 安全规范
- 禁用 `nodeIntegration`，启用 `contextIsolation`
- WebView 使用独立分区 (`partition`)
- 不暴露 Node.js API 到渲染进程
- IPC 通信白名单机制

### 10.2 性能规范
- WebView 页面缓存启用
- 图片加载通过 JS 拦截禁用
- 覆盖层使用 `transform` 动画（GPU 加速）
- 避免频繁的 IPC 通信

### 10.3 代码规范
- 使用 ES2022 语法
- 异步操作使用 `async/await`
- IPC 通道名使用 `namespace:action` 格式
- 组件类使用 PascalCase，工具函数使用 camelCase
