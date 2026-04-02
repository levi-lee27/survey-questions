# GitHub Pages 一键部署脚本
# 使用方法：修改脚本中的 YOUR_GITHUB_REPO_URL，然后运行

$REPO_URL = "https://github.com/你的用户名/survey-questionnaire.git"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "问卷系统 - GitHub Pages 部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 git
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ 未找到 git，请先安装：https://git-scm.com/" -ForegroundColor Red
    pause
    exit 1
}

# 进入项目目录
Set-Location "$PSScriptRoot"

Write-Host "📁 当前目录: $(Get-Location)" -ForegroundColor Gray
Write-Host "🔗 仓库地址: $REPO_URL" -ForegroundColor Gray
Write-Host ""

# 配置 git（如果还没有）
if (-not (Test-Path ".git")) {
    Write-Host "初始化 git..." -ForegroundColor Yellow
    git init
}

# 添加所有文件
Write-Host "📦 添加文件..." -ForegroundColor Green
git add .

# 提交
$commitMsg = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMsg

# 推送到 GitHub
Write-Host "🚀 推送到 GitHub..." -ForegroundColor Green
git push -f origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 代码已推送！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 接下来："
Write-Host "1. 访问 https://github.com/你的用户名/survey-questionnaire"
Write-Host "2. 点击 Settings → Pages"
Write-Host "3. Source 选择 'Deploy from a branch'"
Write-Host "4. Branch 选择 'main' → /root → Save"
Write-Host "5. 等待 1-2 分钟，访问："
Write-Host "   https://你的用户名.github.io/survey-questionnaire/"
Write-Host ""
Write-Host "📱 问卷地址：https://你的用户名.github.io/survey-questionnaire/index.html"
Write-Host "🎲 二维码生成：https://你的用户名.github.io/survey-questionnaire/generate.html"
Write-Host ""
pause