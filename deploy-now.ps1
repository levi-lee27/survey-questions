# GitHub Pages 一键部署脚本
# 使用方法：右键 → 使用 PowerShell 运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📦 问卷系统 - GitHub Pages 部署" -ForegroundColor Cyan
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

Write-Host "✅ git 已安装" -ForegroundColor Green
Write-Host ""

# 进入项目目录
Set-Location "$PSScriptRoot"
Write-Host "📁 工作目录: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# 配置信息
$username = "levi-lee27"
$repoName = "survey-questions"
$repoUrl = "https://github.com/$username/$repoName.git"

Write-Host "🎯 目标仓库: $repoUrl" -ForegroundColor Yellow
Write-Host ""

# 检查是否已初始化
if (Test-Path ".git") {
    Write-Host "⚠️  检测到已存在的 git 仓库" -ForegroundColor Yellow
    $action = Read-Host "是否重新初始化？(y/N)"
    if ($action -eq 'y') {
        Remove-Item -Recurse -Force .git
        Write-Host "已删除旧仓库" -ForegroundColor Green
    } else {
        Write-Host "使用现有仓库配置" -ForegroundColor Gray
    }
}

# 初始化 git
if (-not (Test-Path ".git")) {
    Write-Host "📋 初始化 git..." -ForegroundColor Green
    git init
}

# 添加文件
Write-Host "📦 添加文件到暂存区..." -ForegroundColor Green
git add .

# 提交
$commitMsg = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "💾 提交代码: $commitMsg" -ForegroundColor Green
git commit -m $commitMsg

# 设置主分支
Write-Host "🔧 设置主分支为 main..." -ForegroundColor Green
git branch -M main 2>$null

# 检查远程仓库
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "⚠️  远程仓库 origin 已存在，是否更新？" -ForegroundColor Yellow
    $action = Read-Host "输入 Y 确认更新，其他跳过 (Y/N)"
    if ($action -eq 'y' -or $action -eq 'Y') {
        git remote set-url origin $repoUrl
        Write-Host "✅ 远程仓库已更新" -ForegroundColor Green
    }
} else {
    Write-Host "🔗 添加远程仓库: $repoUrl" -ForegroundColor Green
    git remote add origin $repoUrl
}

# 推送
Write-Host ""
Write-Host "🚀 开始推送到 GitHub..." -ForegroundColor Green
Write-Host "提示：如果提示输入密码，请使用 Personal Access Token" -ForegroundColor Yellow
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ 代码推送成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ 推送失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "1. 网络问题 - 检查网络连接"
    Write-Host "2. 认证失败 - 需要 Personal Access Token"
    Write-Host "3. 仓库不存在 - 确认已创建仓库"
    Write-Host ""
    Write-Host "详细帮助请查看 PUSH-TO-GITHUB.md" -ForegroundColor Cyan
    pause
    exit 1
}

Write-Host ""
Write-Host "📝 下一步：启用 GitHub Pages" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 访问: https://github.com/$username/$repoName" -ForegroundColor White
Write-Host "2. 点击 Settings 标签页" -ForegroundColor White
Write-Host "3. 左侧找到 Pages（或滚动到 Pages 部分）" -ForegroundColor White
Write-Host "4. Source 选择: Deploy from a branch" -ForegroundColor White
Write-Host "5. Branch: main → /root → Save" -ForegroundColor White
Write-Host "6. 等待 1-2 分钟" -ForegroundColor White
Write-Host ""
Write-Host "🌐 访问地址:" -ForegroundColor Green
Write-Host "   https://$username.github.io/$repoName/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 生成二维码：" -ForegroundColor Green
Write-Host "   https://$username.github.io/$repoName/generate.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "- 首次 Pages 构建需要 1-2 分钟" -ForegroundColor Gray
Write-Host "- 如果显示 404，请稍等再刷新" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 部署成功！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
pause