# 电视浏览器 (CCTV_Viewer) Windows 端可行性评估报告

## 一、项目概述

### 1.1 项目基本信息
- **项目名称**：电视浏览器 (CCTV_Viewer)
- **当前平台**：Android (Android TV / 机顶盒)
- **最低支持版本**：Android 4.4 (API 19)
- **目标 SDK**：API 28
- **当前版本**：v1.8.0

### 1.2 核心功能
- 通过 WebView 加载央视网和地方卫视的网页直播页面
- 支持 41 个电视频道（20 个央视频道 + 21 个地方卫视）
- 遥控器/键盘操作：上下换台、数字键直达、菜单键功能菜单
- 双 WebView 缓冲加载，提升换台体验
- 支持腾讯 X5 内核和系统 WebView 两种渲染引擎
- 自动全屏播放、页面缩放、刷新等功能

### 1.3 技术栈分析
- **开发语言**：Java
- **构建工具**：Gradle + Android Gradle Plugin 8.1.3
- **UI 框架**：Android Native UI (XML Layout + 动态生成视图)
- **核心依赖**：
  - `androidx.leanback:leanback:1.0.0` (Android TV UI 组件)
  - `com.tencent.smtt.sdk` (腾讯 X5 浏览器内核，本地 JAR 包)
  - `androidx.appcompat:appcompat` (AppCompat 支持库)
  - `androidx.preference:preference` (设置界面)
  - `com.github.bumptech.glide:glide` (图片加载)
  - `androidx.multidex:multidex` (MultiDex 支持)

---

## 二、Windows 端可行性评估

### 2.1 总体结论

**可行，但需要进行完整的技术重构。**

本项目本质上是一个**基于 WebView 的网页视频浏览器**，核心逻辑是通过 WebView 加载特定网页，然后使用 JavaScript 注入实现自动全屏、页面精简、节目信息提取等功能。这种架构在 Windows 平台完全可以复现，但需要选择合适的技术栈进行重写。

---

## 三、Windows 端实现方案对比

### 方案一：Electron (推荐度：⭐⭐⭐⭐⭐)

**技术描述**：使用 Electron 框架构建跨平台桌面应用，内置 Chromium 内核。

**优势**：
- **WebView 兼容性最佳**：Electron 内置完整 Chromium，与现有网页兼容性最好，无需担心视频解码问题
- **JavaScript 注入无缝迁移**：现有项目中的 `evaluateJavascript` 逻辑可以直接复用
- **开发效率高**：使用 HTML/CSS/JS 开发 UI，快速实现频道列表、设置界面等
- **跨平台**：一套代码可同时支持 Windows、macOS、Linux
- **遥控器/键盘支持**：Electron 可以很好地处理键盘事件，模拟现有遥控逻辑
- **自动更新**：内置自动更新机制

**劣势**：
- 安装包体积较大（约 100-150MB，含 Chromium）
- 内存占用相对较高

**适配工作量**：
- 中等。需要重写 UI 层（频道列表、设置界面、菜单覆盖层），但核心 WebView 逻辑和 JavaScript 注入代码可直接迁移。

---

### 方案二：.NET WPF / WinUI 3 (推荐度：⭐⭐⭐⭐)

**技术描述**：使用 .NET 框架配合 WebView2 控件（基于 Edge Chromium）构建原生 Windows 应用。

**优势**：
- **原生 Windows 体验**：WPF/WinUI 3 提供最佳的 Windows 原生 UI 体验
- **WebView2 性能优秀**：基于 Edge Chromium，视频解码和网页渲染性能出色
- **安装包体积相对较小**：如果目标机器已安装 WebView2 Runtime，安装包可控制在 10-20MB
- **C# 开发效率高**：适合有 .NET 经验的开发者
- **系统集成度高**：可以很好地集成 Windows 原生功能（如系统音量控制、通知等）

**劣势**：
- 仅支持 Windows 平台
- 需要重写所有 UI 和交互逻辑
- JavaScript 注入语法与 Android WebView 略有不同，需要适配

**适配工作量**：
- 中等偏高。需要重写全部 Java 代码为 C#，UI 层需要重新设计实现。

---

### 方案三：.NET MAUI / Avalonia UI (推荐度：⭐⭐⭐)

**技术描述**：使用跨平台 .NET UI 框架，配合 WebView 控件。

**优势**：
- 跨平台支持（MAUI 支持 Windows/macOS/iOS/Android，Avalonia 支持 Windows/macOS/Linux）
- 单一代码库维护

**劣势**：
- MAUI 的 Windows WebView 基于 WebView2，但跨平台 WebView API 可能有限制
- Avalonia 的 WebView 支持相对不成熟
- 社区生态和文档相对较弱

**适配工作量**：
- 高。框架本身的学习成本和踩坑成本较高。

---

### 方案四：Qt + QtWebEngine (推荐度：⭐⭐⭐)

**技术描述**：使用 Qt 框架配合 QtWebEngine（基于 Chromium）构建跨平台应用。

**优势**：
- C++ 性能优秀
- 跨平台支持好
- QtWebEngine 基于 Chromium，网页兼容性好

**劣势**：
- C++ 开发效率相对较低
- 安装包体积大
- 需要处理 Qt 的授权问题（LGPL/商业授权）

**适配工作量**：
- 高。需要重写全部代码，且 C++ 开发周期较长。

---

### 方案五：Flutter Desktop (推荐度：⭐⭐)

**技术描述**：使用 Flutter 框架构建桌面应用。

**优势**：
- 跨平台支持
- UI 渲染性能优秀

**劣势**：
- Flutter Desktop 的 WebView 支持非常有限（通常需要嵌入原生平台视图）
- Windows 平台的 WebView 集成不够成熟
- 视频播放和复杂网页交互可能存在问题

**适配工作量**：
- 很高。Flutter 的 WebView 在桌面端不成熟，可能无法满足需求。

---

## 四、核心功能 Windows 端实现分析

### 4.1 WebView 视频播放 (核心功能)

| 功能 | Android 实现 | Windows 对应方案 |
|------|-------------|-----------------|
| 网页加载 | `WebView.loadUrl()` | Electron: `webContents.loadURL()` / WPF: `WebView2.Source` |
| JavaScript 注入 | `evaluateJavascript()` | Electron: `webContents.executeJavaScript()` / WebView2: `ExecuteScriptAsync()` |
| 自动全屏 | JS 点击全屏按钮 | 完全复用现有 JS 代码 |
| 页面精简 | JS 删除图片/脚本/DIV | 完全复用现有 JS 代码 |
| 节目信息提取 | JS 查询 DOM | 完全复用现有 JS 代码 |
| 双缓冲加载 | 两个 WebView 交替显示 | 两个 WebView 实例交替显示 |

**风险评估**：**低风险**。网页加载和 JS 注入是 WebView 的基础功能，各平台实现都很成熟。

### 4.2 用户输入与遥控逻辑

| 功能 | Android 实现 | Windows 对应方案 |
|------|-------------|-----------------|
| 方向键换台 | `dispatchKeyEvent(KEYCODE_DPAD_UP/DOWN)` | 监听键盘 `ArrowUp`/`ArrowDown` 事件 |
| 数字键换台 | `KEYCODE_0` ~ `KEYCODE_9` | 监听键盘 `0` ~ `9` 数字键 |
| 确认键 | `KEYCODE_ENTER` / `KEYCODE_DPAD_CENTER` | `Enter` 键 |
| 菜单键 | `KEYCODE_MENU` / `KEYCODE_M` | `M` 键或自定义快捷键 |
| 返回键 | `KEYCODE_BACK` / `KEYCODE_B` | `Esc` 键或 `B` 键 |
| 音量控制 | `AudioManager.adjustStreamVolume()` | Windows Core Audio API 或媒体键监听 |

**风险评估**：**低风险**。键盘事件处理在各平台都很简单。如果需要支持物理遥控器，可能需要额外的红外接收驱动支持。

### 4.3 频道列表与 UI 覆盖层

| 功能 | Android 实现 | Windows 对应方案 |
|------|-------------|-----------------|
| 频道抽屉 | `LinearLayout` + 动态 `Button` | HTML/CSS 侧边栏 / WPF `ListBox` |
| 底部菜单 | `LinearLayout` + `ImageButton` | HTML/CSS 底部栏 / WPF `ToolBar` |
| 加载覆盖层 | `RelativeLayout` + `TextView` | HTML/CSS 遮罩层 / WPF `Grid` 覆盖 |
| 频道信息提示 | `TextView` 延时隐藏 | HTML/CSS Toast / WPF `Popup` |
| 设置界面 | `PreferenceFragmentCompat` | HTML 设置页 / WPF `SettingsPage` |

**风险评估**：**极低风险**。UI 层完全需要重写，但逻辑简单，没有技术难点。

### 4.4 X5 内核相关功能

| 功能 | Android 实现 | Windows 对应方案 |
|------|-------------|-----------------|
| X5 内核加载 | `QbSdk.installLocalTbsCore()` | **不需要**。Windows 平台直接使用系统浏览器内核即可 |
| 无图模式 | `IX5WebSettingsExtension.setPicModel()` | Electron: 通过 JS 拦截图片 / WebView2: 类似处理 |
| 内核切换 | `QbSdk.forceSysWebView()` | **不需要**。Windows 直接使用 Chromium 内核 |

**风险评估**：**极低风险**。Windows 平台完全不需要 X5 内核，这是 Android 特有的兼容层方案。

### 4.5 数据持久化

| 功能 | Android 实现 | Windows 对应方案 |
|------|-------------|-----------------|
| 保存当前频道 | `SharedPreferences` | Electron: `localStorage` / `electron-store` / WPF: `Settings` |
| 设置项存储 | `SharedPreferences` | 同上 |
| 文件下载 | `DownloadManager` | Electron: `electron-dl` / WPF: `HttpClient` |

**风险评估**：**极低风险**。数据存储方案成熟且简单。

---

## 五、实现难度评估

### 5.1 按方案评估

| 方案 | 难度等级 | 预估工期 | 主要难点 |
|------|---------|---------|---------|
| **Electron** | ⭐⭐⭐ (中等) | 2-4 周 | UI 重写、JS 注入迁移、打包分发 |
| **WPF + WebView2** | ⭐⭐⭐⭐ (中高) | 3-5 周 | 全部代码重写为 C#、UI 重新设计 |
| **.NET MAUI** | ⭐⭐⭐⭐ (中高) | 4-6 周 | 框架成熟度问题、跨平台 WebView 限制 |
| **Qt** | ⭐⭐⭐⭐⭐ (高) | 5-8 周 | C++ 开发效率、体积控制 |
| **Flutter Desktop** | ⭐⭐⭐⭐⭐ (高) | 6-8 周 | WebView 支持不成熟 |

### 5.2 按功能模块评估

| 模块 | 难度 | 说明 |
|------|------|------|
| WebView 视频播放 | ⭐⭐ (低) | 核心逻辑是网页加载，各平台都成熟 |
| JavaScript 注入 | ⭐⭐ (低) | 现有 JS 代码可直接复用 |
| 键盘/遥控输入 | ⭐⭐ (低) | 事件监听简单 |
| 频道列表 UI | ⭐⭐⭐ (中) | 需要重写但逻辑简单 |
| 设置界面 | ⭐⭐⭐ (中) | 需要重写但逻辑简单 |
| 双缓冲换台 | ⭐⭐⭐ (中) | 需要管理两个 WebView 实例状态 |
| 打包与分发 | ⭐⭐⭐ (中) | 需要配置自动更新、签名等 |
| 物理遥控器支持 | ⭐⭐⭐⭐ (中高) | 需要额外的硬件驱动支持 |

---

## 六、风险评估

### 6.1 技术风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|--------|------|------|---------|
| 网页兼容性 | **中** | 央视网和央视频网页可能检测 User-Agent 或平台 | 模拟 Android UA，充分测试 |
| 视频解码 | **低** | Windows Chromium 解码能力通常优于 Android | 使用最新 Chromium 内核 |
| DRM 限制 | **中** | 部分视频可能有平台限制 | 测试各频道播放情况 |
| 网页结构变更 | **高** | 央视网页面改版会导致 JS 注入失效 | 建立监控机制，及时更新选择器 |

### 6.2 项目风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|--------|------|------|---------|
| 开发周期 | **中** | 完整重写需要一定时间 | 采用 Electron 方案缩短周期 |
| 维护成本 | **中** | 需要维护两个代码库 | 考虑后续是否统一技术栈 |
| 用户习惯 | **低** | Windows 用户操作习惯不同 | 提供键盘快捷键说明 |

### 6.3 平台特有风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|--------|------|------|---------|
| 遥控器支持 | **中** | Windows 默认不支持红外遥控 | 推荐键盘/鼠标操作，或选配 USB 遥控器 |
| 全屏独占 | **低** | Windows 全屏模式与 Android 不同 | 使用无边框窗口模拟 |
| 系统音量 | **低** | Windows 音量控制 API 不同 | 使用系统媒体键或应用内音量控制 |

---

## 七、推荐方案

### 首选方案：Electron

**推荐理由**：
1. **WebView 兼容性最佳**：内置完整 Chromium，对央视网、央视频网页兼容性最好
2. **开发效率最高**：UI 层使用 Web 技术快速实现，核心 JS 注入逻辑直接复用
3. **社区生态成熟**：丰富的 npm 生态，打包分发工具链完善
4. **跨平台潜力**：未来如需 macOS/Linux 版本，几乎零成本扩展

**技术架构建议**：
```
Electron (主进程)
├── 菜单/频道列表/设置 UI (渲染进程 - HTML/CSS/JS)
├── WebView 容器 (渲染进程 - 嵌入页面)
│   ├── WebView 实例 A (当前播放)
│   └── WebView 实例 B (缓冲加载)
├── 键盘事件监听 (主进程)
└── 配置存储 (electron-store / localStorage)
```

### 备选方案：WPF + WebView2

如果团队有 .NET 背景，或需要更小的安装包体积（依赖 WebView2 Runtime），可以选择此方案。

---

## 八、实施建议

### 8.1 最小可行产品 (MVP)
建议先实现以下核心功能：
1. 单 WebView 加载指定频道网页
2. JavaScript 注入实现自动全屏
3. 键盘方向键换台
4. 频道列表覆盖层
5. 设置界面（仅保留必要选项）

### 8.2 逐步迭代
MVP 验证通过后，逐步添加：
1. 双 WebView 缓冲加载
2. 数字键直达换台
3. 页面缩放功能
4. 节目信息提取显示
5. 设置项持久化
6. 自动更新机制

### 8.3 测试重点
1. 所有 41 个频道的播放兼容性
2. 长时间运行稳定性
3. 内存占用情况（特别是双 WebView 模式）
4. 不同 Windows 版本兼容性（Win10/Win11）

---

## 九、总结

| 评估维度 | 结论 |
|---------|------|
| **可行性** | ✅ **完全可行** |
| **推荐方案** | **Electron** (开发效率最高，兼容性最好) |
| **实现难度** | **中等** (核心逻辑可复用，主要是 UI 重写) |
| **预估工期** | **2-4 周** (MVP 版本) |
| **主要风险** | 网页结构变更、DRM 限制、遥控器支持 |
| **维护成本** | 中等 (需维护 Android + Windows 双版本) |

本项目在 Windows 端实现的核心优势在于：**业务逻辑主要依赖 WebView 和 JavaScript，与平台无关**。最大的工作量在于 UI 层的重写，而非核心播放逻辑的重新开发。采用 Electron 方案可以最大程度复用现有 JavaScript 代码，是实现 Windows 版本的最快路径。
