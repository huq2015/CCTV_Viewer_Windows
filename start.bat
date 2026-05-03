@echo off
chcp 65001 >nul
set NODE_HOME=e:\tv\cctv_Viewer\nodejs\node-v20.11.1-win-x64
set PATH=%NODE_HOME%;%PATH%
echo 正在启动 CCTV Viewer Windows 版...
npm start
pause
