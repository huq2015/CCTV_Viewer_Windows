# Windows 可执行程序打包计划

## 目标

将当前 Electron 项目打包为可在 Windows 10 操作系统环境下正常运行的可执行程序，具备以下特性：
- 无需额外安装依赖即可独立运行
- 支持 Windows 10 的 32 位和 64 位系统版本
- 程序启动正常且功能完整
- 无运行时错误或依赖缺失问题

## 当前项目状态分析

### 技术栈
- **框架**: Electron 28.3.3
- **构建工具**: Electron Forge 7.11.1
- **打包工具**: @electron-forge/maker-squirrel
- **Node.js**: 20.x (本地已安装)

### 现有配置
- `package.json` 已配置打包脚本
- `forge.config.js` 已配置 Windows 打包参数
- 图标文件位于 `src/assets/icons/`

### 潜在问题
1. **架构支持**: 当前配置未明确指定 32 位和 64 位同时支持
2. **依赖完整性**: 需要确保 `electron-store` 等原生模块正确打包
3. **图标文件**: 需要确认图标文件是否存在
4. **Webpack 配置**: 之前移除了 webpack，但 package.json 中仍保留相关依赖

## 实施步骤

### 步骤1：检查并准备打包环境

**操作内容**:
1. 检查 Node.js 和 npm 版本
2. 检查图标文件是否存在
3. 检查 forge.config.js 配置完整性
4. 清理不必要的 webpack 依赖

**验证标准**:
- `node -v` 显示 v20.x
- `npm -v` 显示 9.x
- `src/assets/icons/icon.ico` 存在
- `src/assets/icons/icon.png` 存在

### 步骤2：清理和优化项目配置

**操作内容**:
1. 从 `package.json` 中移除未使用的 webpack 相关依赖
2. 确保 `forge.config.js` 配置正确
3. 添加 `arch` 配置支持 32 位和 64 位

**代码变更**:
```javascript
// forge.config.js 修改
packagerConfig: {
  name: 'CCTVViewer',
  executableName: 'CCTVViewer',
  appBundleId: 'com.eanyatonic.cctvviewer',
  icon: './src/assets/icons/icon',
  asar: true,
  arch: ['ia32', 'x64'], // 支持 32 位和 64 位
  win32metadata: {
    CompanyName: 'Eanya-Tonic',
    FileDescription: '电视浏览器 - Windows版',
    OriginalFilename: 'CCTVViewer.exe',
    ProductName: '电视浏览器',
    InternalName: 'CCTVViewer'
  }
}
```

### 步骤3：执行打包命令

**操作内容**:
1. 运行 `npm run make` 执行完整打包流程
2. 监控打包过程，记录任何错误

**命令**:
```bash
npm run make
```

**预期输出**:
- 打包成功，生成 `out/` 目录
- 包含 `CCTVViewer.exe` 可执行文件
- 包含必要的 DLL 和资源文件

### 步骤4：验证打包结果

**操作内容**:
1. 检查 `out/` 目录结构
2. 验证可执行文件是否存在
3. 检查文件大小是否合理（通常 100-200MB）

**验证标准**:
- `out/CCTVViewer-win32-x64/CCTVViewer.exe` 存在（64位）
- `out/CCTVViewer-win32-ia32/CCTVViewer.exe` 存在（32位）
- 或者 `out/make/squirrel.windows/x64/` 包含安装包

### 步骤5：测试可执行程序

**操作内容**:
1. 直接运行打包后的 `CCTVViewer.exe`
2. 验证程序是否正常启动
3. 验证频道加载功能
4. 验证键盘控制功能

**验证标准**:
- 程序启动无错误弹窗
- 显示全屏界面
- 自动加载频道内容
- 键盘控制正常响应

### 步骤6：创建独立分发包

**操作内容**:
1. 将打包后的文件压缩为 ZIP 格式
2. 或者生成安装程序（Squirrel.Windows）

**命令**:
```bash
# 生成安装程序
npm run make:win
```

## 风险与应对措施

| 风险 | 可能性 | 应对措施 |
|------|--------|----------|
| 图标文件缺失 | 中 | 提前检查，使用默认图标替代 |
| 原生模块打包失败 | 中 | 使用 `--arch=ia32,x64` 参数重新打包 |
| 文件体积过大 | 低 | 正常现象，Electron 包含完整 Chromium |
| 杀毒软件误报 | 中 | 添加数字签名或提交白名单 |
| Windows 7 不兼容 | 高 | 明确说明最低支持 Windows 10 |

## 回滚方案

如果打包失败：
1. 检查 `node_modules` 完整性
2. 删除 `out/` 目录重新打包
3. 使用 `npm run package` 替代 `npm run make`
4. 检查 Electron Forge 版本兼容性

## 文件修改清单

| 文件 | 修改类型 | 修改内容 |
|------|----------|----------|
| `forge.config.js` | 修改 | 添加 `arch: ['ia32', 'x64']` 支持双架构 |
| `package.json` | 可选修改 | 移除未使用的 webpack 依赖 |

## 预期成果

1. **可执行文件**: `CCTVViewer.exe`（支持 32/64 位）
2. **安装程序**: `CCTVViewerSetup.exe`（可选）
3. **独立运行**: 无需安装 Node.js 或其他依赖
4. **功能完整**: 所有功能与开发环境一致
