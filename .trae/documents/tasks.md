# CCTV_Viewer Windows 端 MVP 任务分解

## 任务总览

| 阶段 | 任务数 | 预计工期 |
|------|--------|---------|
| Phase 1: 项目初始化 | 4 | 0.5 天 |
| Phase 2: 主进程开发 | 4 | 1 天 |
| Phase 3: 渲染进程核心 | 5 | 1.5 天 |
| Phase 4: UI 组件开发 | 5 | 1.5 天 |
| Phase 5: 集成测试 | 3 | 0.5 天 |
| **总计** | **21** | **5 天** |

---

## Phase 1: 项目初始化

### Task 1.1: 初始化 Electron 项目
- [x] 创建项目目录 `CCTV_Viewer_Windows/`
- [x] 执行 `npm init -y` 初始化 package.json
- [x] 安装 Electron 生产依赖: `npm install electron@28 electron-store@8`
- [x] 安装 Electron Forge 开发依赖
- [x] 配置 `forge.config.js` 打包配置
- [x] 配置 `.gitignore` 文件
- **验收标准**: `npm start` 能启动基础 Electron 窗口

### Task 1.2: 创建目录结构
- [x] 创建 `src/main/` 目录及入口文件
- [x] 创建 `src/renderer/` 目录及入口文件
- [x] 创建 `src/renderer/styles/` 目录
- [x] 创建 `src/renderer/components/` 目录
- [x] 创建 `src/renderer/webview/` 目录
- [x] 创建 `src/renderer/utils/` 目录
- [x] 创建 `src/assets/icons/` 目录
- **验收标准**: 所有目录结构符合 spec.md 规范

### Task 1.3: 配置开发脚本
- [x] 配置 `package.json` scripts:
  - `start`: `electron-forge start`
  - `package`: `electron-forge package`
  - `make`: `electron-forge make`
- [x] 验证开发环境可正常启动
- **验收标准**: `npm start` 正常启动，热重载生效

### Task 1.4: 创建常量定义文件
- [x] 创建 `src/renderer/utils/constants.js`
- [x] 定义 `CHANNELS` 数组（41 个频道完整数据）
- [x] 定义 `KEYBOARD` 按键映射常量
- [x] 定义 `UI` 样式常量（颜色、字体大小等）
- **验收标准**: 常量文件可被其他模块正确导入

---

## Phase 2: 主进程开发

### Task 2.1: 窗口管理模块
- [x] 创建 `src/main/window-manager.js`
- [x] 实现 `createMainWindow()` 函数
  - 窗口尺寸: 1280x720（开发）/ 全屏（生产）
  - 无边框窗口 (`frame: false`)
  - 背景色: `#000000`
  - 加载 `src/renderer/index.html`
- [x] 实现全屏切换功能
- [x] 实现窗口焦点管理
- [x] 处理 `ready-to-show` 事件
- **验收标准**: 窗口正常创建，可全屏/退出全屏

### Task 2.2: 配置存储模块
- [x] 创建 `src/main/store.js`
- [x] 初始化 `electron-store` 实例
- [x] 定义配置 Schema:
  - `currentChannelId`: number, default 0
  - `settings.directChannelChange`: boolean, default false
  - `settings.directBack`: boolean, default true
  - `settings.textSize`: string, enum ['small','medium','large','xlarge'], default 'medium'
- [x] 封装 `getConfig(key)` 和 `setConfig(key, value)` 方法
- [x] 处理 IPC 请求 `store:get` 和 `store:set`
- **验收标准**: 配置可读写，重启后持久化

### Task 2.3: 键盘事件监听模块
- [x] 创建 `src/main/keyboard-handler.js`
- [x] 注册全局快捷键:
  - `ArrowUp` → 发送 `keyboard:up`
  - `ArrowDown` → 发送 `keyboard:down`
  - `Enter` → 发送 `keyboard:enter`
  - `M` → 发送 `keyboard:menu`
  - `Escape` / `B` → 发送 `keyboard:back`
  - `F5` / `R` → 发送 `keyboard:refresh`
- [x] 实现快捷键状态管理（避免重复触发）
- [x] 处理窗口失焦时注销快捷键
- **验收标准**: 所有快捷键可正常触发，事件正确发送到渲染进程

### Task 2.4: 主进程入口整合
- [x] 创建 `src/main/index.js`
- [x] 导入并初始化窗口管理器
- [x] 导入并初始化键盘处理器
- [x] 导入并初始化配置存储
- [x] 处理 `app.whenReady()` 生命周期
- [x] 处理 `app.on('window-all-closed')` 退出逻辑
- [x] 处理 `app.on('activate')` macOS 行为（Windows 可忽略但保留）
- **验收标准**: 主进程完整运行，各模块协同工作

---

## Phase 3: 渲染进程核心

### Task 3.1: IPC 客户端封装
- [x] 创建 `src/renderer/utils/ipc-client.js`
- [x] 封装 `send(channel, data)` 方法
- [x] 封装 `on(channel, callback)` 方法
- [x] 封装 `once(channel, callback)` 方法
- [x] 提供类型安全的 API 封装:
  - `loadChannel(channelId)`
  - `getSetting(key)`
  - `setSetting(key, value)`
  - `quitApp()`
- **验收标准**: IPC 通信正常，无内存泄漏

### Task 3.2: WebView 控制器
- [x] 创建 `src/renderer/webview/webview-controller.js`
- [x] 封装 WebView 元素操作:
  - `loadUrl(url)` - 加载频道网页
  - `reload()` - 刷新页面
  - `executeJavaScript(code)` - 执行注入脚本
- [x] 监听 WebView 事件:
  - `dom-ready` → 注入 FastLoading 脚本
  - `did-finish-load` → 注入 AutoFullscreen 脚本
  - `did-fail-load` → 显示错误提示
- [x] 实现加载状态管理（显示/隐藏加载覆盖层）
- [x] 处理 WebView 错误（网络错误、SSL 错误等）
- **验收标准**: WebView 正常加载网页，JS 注入执行成功

### Task 3.3: JS 注入脚本集合
- [x] 创建 `src/renderer/webview/inject-scripts.js`
- [x] 实现 `getFastLoadingScript()` 函数
  - 返回 FastLoading 脚本字符串
- [x] 实现 `getAutoFullscreenScript()` 函数
  - 返回 AutoFullscreen 脚本字符串
- [x] 实现 `getZoomScript(direction)` 函数
  - direction: 'in' | 'out'
  - 返回页面缩放脚本
- [x] 实现 `getPlayPauseScript()` 函数
  - 返回播放/暂停控制脚本
- [x] 所有脚本需处理央视网和地方卫视两种页面结构
- **验收标准**: 各脚本在 WebView 中正确执行

### Task 3.4: 频道管理器
- [x] 创建 `src/renderer/utils/channel-manager.js`
- [x] 实现频道数据查询:
  - `getChannelById(id)` - 根据 ID 获取频道
  - `getNextChannel(currentId)` - 获取下一个频道
  - `getPreviousChannel(currentId)` - 获取上一个频道
  - `getChannelsByCategory(category)` - 按分类获取频道
- [x] 实现当前频道状态管理
- [x] 集成配置存储，读取/保存当前频道
- **验收标准**: 频道导航逻辑正确，边界情况处理完善

### Task 3.5: 渲染进程入口整合
- [x] 创建 `src/renderer/index.js`
- [x] 导入 IPC 客户端
- [x] 导入 WebView 控制器
- [x] 导入频道管理器
- [x] 初始化各组件实例
- [x] 绑定 IPC 事件处理:
  - `keyboard:up` → 切换到上一个频道
  - `keyboard:down` → 切换到下一个频道
  - `keyboard:enter` → 打开频道列表
  - `keyboard:menu` → 打开底部菜单
  - `keyboard:back` → 关闭当前覆盖层/返回
  - `keyboard:refresh` → 刷新当前页面
- [x] 应用启动时加载上次保存的频道
- **验收标准**: 渲染进程完整运行，键盘事件正确响应

---

## Phase 4: UI 组件开发

### Task 4.1: 全局样式与 HTML 骨架
- [x] 创建 `src/renderer/index.html`
  - 包含 WebView 容器
  - 包含各覆盖层容器（频道列表、菜单、设置、加载）
- [x] 创建 `src/renderer/styles/main.css`
  - CSS 变量定义（颜色、尺寸）
  - 全局 reset 样式
  - WebView 容器样式（全屏、无滚动条）
  - 覆盖层基础样式（绝对定位、全屏、半透明背景）
- [x] 创建 `src/renderer/styles/channel-list.css`
- [x] 创建 `src/renderer/styles/menu.css`
- [x] 创建 `src/renderer/styles/settings.css`
- **验收标准**: HTML 结构清晰，样式正确渲染

### Task 4.2: 加载覆盖层组件
- [x] 创建 `src/renderer/components/LoadingOverlay.js`
- [x] 实现 `show(message)` 方法
- [x] 实现 `hide()` 方法
- [x] 显示内容:
  - "正在切换频道..." 文字
  - 当前内核信息提示
- [x] 样式: 全屏黑色半透明遮罩，白色文字居中
- **验收标准**: 换台时正确显示/隐藏

### Task 4.3: 频道列表组件
- [x] 创建 `src/renderer/components/ChannelList.js`
- [x] 实现双栏抽屉式布局:
  - 第一栏: 分类选择（央视频道 / 地方频道 / 打开设置）
  - 第二栏: 频道列表
- [x] 实现焦点管理:
  - 上下键在列表内移动焦点
  - 左右键切换分类/频道栏
  - Enter 确认选择
  - Esc 关闭列表
- [x] 实现频道按钮动态生成
- [x] 实现当前播放频道高亮显示
- [x] 集成字体大小设置（small/medium/large/xlarge）
- [x] 动画: 从左侧滑入 (translateX)
- **验收标准**: 
  - 频道列表正确显示所有 41 个频道
  - 焦点导航流畅
  - 选择后正确换台

### Task 4.4: 底部菜单组件
- [x] 创建 `src/renderer/components/MenuOverlay.js`
- [x] 实现横向工具栏布局（6 个按钮）
- [x] 实现各按钮功能:
  - 刷新: 调用 `webview.reload()`
  - 播放/暂停: 注入 JS 控制视频
  - 全屏: 注入 JS 点击全屏按钮
  - 放大: 注入 JS 增加 zoom
  - 缩小: 注入 JS 减少 zoom
  - 设置: 打开设置面板
- [x] 实现焦点管理:
  - 左右键切换按钮焦点
  - Enter 执行操作
  - Esc 关闭菜单
- [x] 动画: 从底部淡入
- **验收标准**: 各按钮功能正常，焦点切换流畅

### Task 4.5: 设置面板组件
- [x] 创建 `src/renderer/components/SettingsPanel.js`
- [x] 实现右侧滑入面板
- [x] 实现设置项:
  - 直接换台开关 (Switch)
  - 直接返回开关 (Switch)
  - 字体大小选择 (Select: 较小/适中/偏大/特大)
- [x] 设置项变更时:
  - 立即保存到 electron-store
  - 显示 "重启后生效" 提示（如需要）
- [x] 实现关于信息展示:
  - 应用名称、版本号
  - 操作系统信息
- [x] 动画: 从右侧滑入
- **验收标准**: 
  - 设置项可正常修改
  - 配置持久化生效
  - 设置影响频道列表显示

---

## Phase 5: 集成测试

### Task 5.1: 功能联调
- [x] 验证启动流程: 打开应用 → 加载上次频道 → 自动全屏
- [x] 验证换台流程: 方向键 → 加载新频道 → 显示加载层 → 播放
- [x] 验证频道列表: Enter → 显示列表 → 选择频道 → 换台
- [x] 验证底部菜单: M 键 → 显示菜单 → 各功能测试
- [x] 验证设置界面: 打开设置 → 修改选项 → 验证生效
- [x] 验证退出流程: 双击 Esc → 退出应用
- **验收标准**: 所有功能流程完整通过

### Task 5.2: 全频道测试
- [x] 逐个测试 41 个频道的加载和播放
- [x] 记录无法播放的频道
- [x] 验证央视网频道 (0-19) 的自动全屏
- [x] 验证地方卫视 (20-40) 的自动全屏
- [x] 测试各频道页面缩放效果
- **验收标准**: 所有频道可正常加载，视频可播放

### Task 5.3: 打包与分发测试
- [ ] 执行 `npm run make` 生成安装包
- [ ] 在干净 Windows 环境测试安装
- [ ] 验证安装后应用正常启动
- [ ] 验证卸载流程
- [ ] 检查安装包体积（目标 < 200MB）
- **验收标准**: 安装包可正常安装/卸载/运行

---

## 依赖关系图

```
Phase 1: 项目初始化
├── Task 1.1 (初始化项目)
├── Task 1.2 (目录结构) ← 依赖 1.1
├── Task 1.3 (开发脚本) ← 依赖 1.1
└── Task 1.4 (常量定义) ← 依赖 1.2

Phase 2: 主进程开发
├── Task 2.1 (窗口管理) ← 依赖 1.3
├── Task 2.2 (配置存储) ← 依赖 1.3
├── Task 2.3 (键盘监听) ← 依赖 1.3, 2.1
└── Task 2.4 (主入口) ← 依赖 2.1, 2.2, 2.3

Phase 3: 渲染进程核心
├── Task 3.1 (IPC 客户端) ← 依赖 1.4
├── Task 3.2 (WebView 控制器) ← 依赖 3.1
├── Task 3.3 (JS 注入脚本) ← 依赖 1.4
├── Task 3.4 (频道管理器) ← 依赖 1.4, 3.1
└── Task 3.5 (渲染入口) ← 依赖 3.1, 3.2, 3.3, 3.4

Phase 4: UI 组件开发
├── Task 4.1 (全局样式) ← 依赖 1.2
├── Task 4.2 (加载层) ← 依赖 4.1, 3.2
├── Task 4.3 (频道列表) ← 依赖 4.1, 3.4, 3.1
├── Task 4.4 (底部菜单) ← 依赖 4.1, 3.2, 3.3
└── Task 4.5 (设置面板) ← 依赖 4.1, 3.1, 2.2

Phase 5: 集成测试
├── Task 5.1 (功能联调) ← 依赖 Phase 2, 3, 4
├── Task 5.2 (全频道测试) ← 依赖 5.1
└── Task 5.3 (打包测试) ← 依赖 5.2
```

---

## 风险应对

| 风险 | 影响任务 | 应对措施 |
|------|---------|---------|
| Electron Forge 配置复杂 | Task 1.1 | 参考官方模板，逐步配置 |
| WebView 标签限制 | Task 3.2 | 使用 `webview` 标签而非 iframe，启用 `nodeintegrationinsubframes` |
| 央视网页改版 | Task 3.3, 5.2 | JS 选择器需兼容多种结构，添加错误处理 |
| 全局快捷键冲突 | Task 2.3 | 使用 `register` 而非 `globalShortcut`，窗口失焦时释放 |
| 字体显示异常 | Task 4.3 | 指定中文字体回退栈 |
