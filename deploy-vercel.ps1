# Vercel 一键部署脚本（PowerShell）
# 使用方法：右键 → 使用 PowerShell 运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "问卷系统 - Vercel 部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否已安装 Vercel CLI
$vercelExists = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelExists) {
    Write-Host "正在安装 Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host ""
}

Write-Host "📦 开始部署..." -ForegroundColor Green
Write-Host ""

# 进入项目目录
Set-Location "$PSScriptRoot"

# 执行部署
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 问卷地址：https://你的项目名.vercel.app/index.html"
Write-Host "🎲 二维码生成：https://你的项目名.vercel.app/generate.html"
Write-Host "📊 统计后台：https://你的项目名.vercel.app/admin.html"
Write-Host ""
Write-Host "💡 提示：首次部署会要求登录 Vercel 账号" -ForegroundColor Yellow
pause