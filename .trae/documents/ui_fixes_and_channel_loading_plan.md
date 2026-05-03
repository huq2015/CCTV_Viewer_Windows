# UI修复与频道加载优化计划

## 问题概述

应用存在以下功能和UI问题需要修复：

1. **频道加载机制问题**：应用启动后未能默认加载频道内容，需要手动等待2秒并刷新才能正常显示
2. **抽屉菜单栏样式问题**：当前为纯黑色，需调整为灰色并设置70%透明度
3. **选择状态样式问题**：未确认选择状态的背景色为灰色，需调整为黄色增强辨识度
4. **按键说明位置问题**：当前显示在频道页面下方，需迁移至设置页面内

## 实施步骤

### 步骤1：修复频道加载机制

**目标**：确保应用启动后自动完成频道内容加载，无需用户手动刷新

**分析**：

* 当前 `index.js` 中 `initialChannelLoaded` 标志阻止了首次加载时的 loading 显示

* `webViewController.onLoadStart` 在 `initialChannelLoaded` 为 false 时不显示 loading

* 需要确保 webview 在设置 `src` 后正确触发加载事件

**修改文件**：`src/renderer/index.js`

**具体修改**：

1. 移除 `initialChannelLoaded` 标志对 loading 显示的限制
2. 确保 `loadChannel()` 在初始化时正确调用
3. 添加 webview 加载超时检测机制（5秒），若未触发 `did-finish-load` 则自动刷新
4. 在 `initialize()` 中确保频道加载后立即显示 loading 状态

**代码变更**：

```javascript
// 修改前
this.webViewController.onLoadStart = () => {
  if (this.initialChannelLoaded) {
    this.loadingOverlay.show();
  }
};

// 修改后
this.webViewController.onLoadStart = () => {
  this.loadingOverlay.show('正在加载频道...');
};

// 添加加载超时检测
this.webViewController.onLoadFinish = () => {
  clearTimeout(this.loadTimeout);
  setTimeout(() => {
    this.loadingOverlay.hide();
  }, 500);
};

// 在 loadChannel 中添加超时检测
loadChannel(channelId) {
  // ... 现有代码 ...
  this.webViewController.loadUrl(channel.url);
  
  // 5秒后如果仍未加载完成，自动刷新
  this.loadTimeout = setTimeout(() => {
    if (this.loadingOverlay.isVisible()) {
      console.log('Channel load timeout, reloading...');
      this.webViewController.reload();
    }
  }, 5000);
}
```

### 步骤2：修复抽屉菜单栏背景色

**目标**：将抽屉菜单栏从纯黑色调整为灰色，透明度70%

**分析**：

* 当前 `.channel-list-overlay.active` 背景为 `rgba(128, 128, 128, 0.7)`（已经是灰色70%透明度）

* 但 `.channel-list-container` 使用 `var(--bg-overlay)` 即 `rgba(0, 0, 0, 0.85)` 纯黑

* 需要修改容器背景色

**修改文件**：`src/renderer/styles/channel-list.css`

**具体修改**：

1. 修改 `.channel-list-container` 的背景色为灰色 `rgba(80, 80, 80, 0.7)`
2. 保持 `.channel-list-overlay.active` 的背景或同步调整

**代码变更**：

```css
/* 修改前 */
.channel-list-container {
  background: var(--bg-overlay); /* rgba(0, 0, 0, 0.85) */
}

/* 修改后 */
.channel-list-container {
  background: rgba(80, 80, 80, 0.7);
}
```

### 步骤3：修复选择状态样式（黄色高亮）

**目标**：将未确认选择状态的背景色从灰色调整为黄色

**分析**：

* 当前 `.category-item:hover, .category-item:focus` 和 `.channel-item:hover, .channel-item:focus` 使用 `rgba(255, 255, 255, 0.1)` 灰色

* 需要改为黄色以提高辨识度

**修改文件**：`src/renderer/styles/channel-list.css`

**具体修改**：

1. 修改 `.category-item:hover, .category-item:focus` 背景色为黄色
2. 修改 `.channel-item:hover, .channel-item:focus` 背景色为黄色
3. 调整文字颜色确保在黄色背景上可读

**代码变更**：

```css
/* 修改前 */
.category-item:hover,
.category-item:focus {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* 修改后 */
.category-item:hover,
.category-item:focus {
  background-color: rgba(255, 193, 7, 0.8); /* 黄色 */
  color: #000000; /* 黑色文字确保可读性 */
}

/* 频道项同样修改 */
.channel-item:hover,
.channel-item:focus {
  background-color: rgba(255, 193, 7, 0.8); /* 黄色 */
  color: #000000;
  outline: none;
}
```

### 步骤4：迁移按键说明到设置页面

**目标**：将键盘快捷键说明从频道抽屉底部迁移到设置页面内

**分析**：

* 当前按键说明在 `index.html` 的 `channel-list` 抽屉内

* 需要将其移动到 `settings-panel` 内

* 需要添加对应的 CSS 样式

**修改文件**：

* `src/renderer/index.html`

* `src/renderer/styles/settings.css`

**具体修改**：

1. **从频道抽屉移除按键说明**：

   * 删除 `channel-list-shortcuts` 整个 div

2. **在设置页面添加按键说明**：

   * 在 `settings-content` 内添加新的 `settings-section`

   * 添加标题"键盘快捷键"

   * 以列表形式展示所有快捷键

3. **添加设置页面快捷键样式**：

   * 在 `settings.css` 中添加 `.settings-shortcuts` 相关样式

**HTML 变更**：

```html
<!-- 从 channel-list 中删除 -->
<div class="channel-list-shortcuts">...</div>

<!-- 添加到 settings-panel 中 -->
<div class="settings-section">
  <h3>键盘快捷键</h3>
  <div class="settings-shortcuts">
    <div class="shortcut-row">
      <span class="shortcut-key">↑ ↓</span>
      <span class="shortcut-desc">切换频道 / 列表移动</span>
    </div>
    <div class="shortcut-row">
      <span class="shortcut-key">←</span>
      <span class="shortcut-desc">返回上级 / 关闭抽屉</span>
    </div>
    <div class="shortcut-row">
      <span class="shortcut-key">→</span>
      <span class="shortcut-desc">切换分类</span>
    </div>
    <div class="shortcut-row">
      <span class="shortcut-key">Enter</span>
      <span class="shortcut-desc">确认选择 / 打开频道列表</span>
    </div>
    <div class="shortcut-row">
      <span class="shortcut-key">M</span>
      <span class="shortcut-desc">打开/关闭底部菜单</span>
    </div>
    <div class="shortcut-row">
      <span class="shortcut-key">Esc / B</span>
      <span class="shortcut-desc">返回 / 退出应用</span>
    </div>
    <div class="shortcut-row">
      <span class="shortcut-key">R</span>
      <span class="shortcut-desc">刷新页面</span>
    </div>
    <div class="shortcut-row">
      <span class="shortcut-key">+ / -</span>
      <span class="shortcut-desc">放大 / 缩小页面</span>
    </div>
  </div>
</div>
```

**CSS 变更**：

```css
/* 添加到 settings.css */
.settings-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.shortcut-row .shortcut-key {
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  min-width: 80px;
  text-align: center;
  white-space: nowrap;
}

.shortcut-row .shortcut-desc {
  font-size: 15px;
  color: var(--text-secondary);
}
```

### 步骤5：清理频道抽屉CSS

**目标**：移除频道抽屉中不再使用的快捷键样式

**修改文件**：`src/renderer/styles/channel-list.css`

**具体修改**：

* 删除 `.channel-list-shortcuts` 相关所有 CSS 规则

### 步骤6：测试验证

**测试项**：

1. **频道自动加载**：

   * 启动应用，验证是否自动加载上次观看的频道

   * 验证 loading 提示是否正确显示

   * 验证5秒内是否自动完成加载（无需手动刷新）

2. **抽屉样式**：

   * 打开频道抽屉，验证背景是否为灰色70%透明

   * 验证菜单项hover/focus时是否为黄色背景

   * 验证黄色背景上的文字是否清晰可读

3. **设置页面**：

   * 打开设置页面，验证是否显示"键盘快捷键"部分

   * 验证快捷键列表是否完整、样式是否正确

4. **频道抽屉**：

   * 验证频道抽屉底部不再显示快捷键说明

   * 验证频道列表区域空间是否充足

5. **跨平台兼容性**：

   * 验证所有样式在不同屏幕尺寸下正常显示

   * 验证键盘导航功能正常

## 文件修改清单

| 文件                                     | 修改类型 | 修改内容                                     |
| -------------------------------------- | ---- | ---------------------------------------- |
| `src/renderer/index.js`                | 修改   | 修复频道加载逻辑，移除initialChannelLoaded限制，添加超时刷新 |
| `src/renderer/styles/channel-list.css` | 修改   | 抽屉背景灰色70%，选择状态黄色，删除快捷键样式                 |
| `src/renderer/styles/settings.css`     | 修改   | 添加快捷键说明样式                                |
| `src/renderer/index.html`              | 修改   | 移除抽屉快捷键，添加到设置页面                          |

## 风险与注意事项

1. **黄色背景可读性**：需确保黄色背景上的黑色文字在各种显示器上都有良好对比度
2. **加载超时时间**：5秒超时需根据实际网络情况调整，避免过早刷新
3. **样式冲突**：确保新的快捷键样式与现有设置页面样式不冲突

