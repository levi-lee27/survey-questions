#!/bin/bash

echo "========================================"
echo "评审满意度调查 - 快速启动"
echo "========================================"
echo ""

# 检查端口是否占用
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 8080 已被占用，尝试使用 8081..."
    PORT=8081
else
    PORT=8080
fi

echo "📦 正在启动服务器，端口: $PORT"
echo "📱 问卷地址: http://localhost:$PORT/index.html"
echo "📊 统计后台: http://localhost:$PORT/admin.html"
echo "🎲 生成二维码: http://localhost:$PORT/generate.html"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================================"
echo ""

# 尝试使用 Python 启动
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
elif command -v node &> /dev/null; then
    npx -y serve -l $PORT
else
    echo "❌ 未找到 Python 或 Node.js，请先安装其中之一："
    echo "   - Python: https://www.python.org/downloads/"
    echo "   - Node.js: https://nodejs.org/"
    echo ""
    echo "或者直接打开 index.html 在浏览器中"
    echo "========================================"
    read -p "按 Enter 继续..."
fi