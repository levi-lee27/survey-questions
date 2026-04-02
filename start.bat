@echo off
chcp 65001 >nul
echo ========================================
echo 评审满意度调查 - 快速启动
echo ========================================
echo.

REM 检查端口是否占用
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口 8080 已被占用，尝试使用 8081...
    set PORT=8081
) else (
    set PORT=8080
)

echo 📦 正在启动服务器，端口: %PORT%
echo 📱 问卷地址: http://localhost:%PORT%/index.html
echo 📊 统计后台: http://localhost:%PORT%/admin.html
echo 🎲 生成二维码: http://localhost:%PORT%/generate.html
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

REM 尝试使用 Python 启动
python --version >nul 2>&1
if %errorlevel% equ 0 (
    python -m http.server %PORT%
    goto :end
)

REM 尝试使用 Node.js 启动
node --version >nul 2>&1
if %errorlevel% equ 0 (
    npx -y serve -l %PORT%
    goto :end
)

echo ❌ 未找到 Python 或 Node.js，请先安装其中之一：
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
echo 或者直接双击 index.html 在浏览器中打开
echo ========================================
pause

:end