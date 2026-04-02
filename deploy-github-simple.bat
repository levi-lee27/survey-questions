@echo off
chcp 65001 >nul
title GitHub Pages 部署

echo ========================================
echo 问卷系统 - GitHub Pages 部署
echo ========================================
echo.

REM 第一步：检查 git
echo [1/6] 检查 Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git 未安装！
    echo 请先安装：https://git-scm.com/
    echo.
    pause
    exit /b 1
)
echo [OK] Git 已安装
echo.

REM 第二步：进入项目目录
echo [2/6] 进入项目目录...
cd /d "%~dp0"
echo 当前目录: %cd%
echo.

REM 第三步：配置信息
set USERNAME=levi-lee27
set REPO=survey-questions
echo [3/6] 配置信息
echo   GitHub 用户名: %USERNAME%
echo   仓库名称: %REPO%
echo   目标地址: https://github.com/%USERNAME%/%REPO%.git
echo.

REM 第四步：检查并初始化 git
echo [4/6] 初始化 Git 仓库...
if exist ".git" (
    echo [WARN] .git 文件夹已存在
    echo 是否删除并重新初始化？
    choice /C YN /M "删除并重新初始化"
    if errorlevel 2 (
        echo 跳过初始化，使用现有仓库
        goto skip_init
    )
    rmdir /s /q .git
    echo 旧仓库已删除
)
git init
if %errorlevel% neq 0 (
    echo [ERROR] git init 失败
    pause
    exit /b 1
)
echo [OK] Git 仓库已创建
:skip_init

REM 第五步：添加并提交文件
echo [5/6] 添加文件并提交...
git add .
git commit -m "Deploy: %date% %time%" 2>nul
if %errorlevel% equ 0 (
    echo [OK] 文件已提交
) else (
    echo [INFO] 提交失败（可能没有变更）
)

REM 设置主分支
git branch -M main 2>nul

REM 第六步：添加远程仓库并推送
echo [6/6] 配置远程仓库并推送...
git remote | findstr origin >nul
if %errorlevel% equ 0 (
    echo [INFO] 远程仓库 origin 已存在，更新 URL...
    git remote set-url origin https://github.com/%USERNAME%/%REPO%.git
) else (
    echo 添加远程仓库...
    git remote add origin https://github.com/%USERNAME%/%REPO%.git
)

echo.
echo ========================================
echo 准备推送到 GitHub
echo ========================================
echo.
echo 注意：GitHub 已不支持密码验证
echo 需要使用 Personal Access Token
echo.
echo 如果没有 Token，请先创建：
echo 1. 访问 https://github.com/settings/tokens
echo 2. 点击 "Generate new token" -> "Classic"
echo 3. 勾选 "repo" 权限
echo 4. 复制生成的 Token（只显示一次）
echo.
echo 推送时会要求输入：
echo   Username: %USERNAME%
echo   Password: 粘贴你的 Token
echo.
pause

git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] 推送失败！
    echo.
    echo 可能原因：
    echo 1. 网络问题
    echo 2. Token 错误或过期
    echo 3. 仓库不存在（请先创建 https://github.com/new）
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] 代码已推送到 GitHub！
echo ========================================
echo.
echo 下一步：启用 GitHub Pages
echo.
echo 1. 访问: https://github.com/%USERNAME%/%REPO%
echo 2. 点击 "Settings" 标签
echo 3. 找到 "Pages"（在 Code and automation 下方）
echo 4. Source 选择: "Deploy from a branch"
echo 5. Branch: main -> /root -> Save
echo 6. 等待 1-2 分钟构建
echo.
echo 访问地址：
echo   主页: https://%USERNAME%.github.io/%REPO%/
echo   问卷: https://%USERNAME%.github.io/%REPO%/index.html
echo   二维码生成: https://%USERNAME%.github.io/%REPO%/generate.html
echo.
echo 提示：
echo - 首次构建需要 1-2 分钟
echo - 如果显示 404，稍等再刷新
echo.
echo ========================================
echo 部署完成，但 Pages 还需要手动启用！
echo ========================================
echo.
pause