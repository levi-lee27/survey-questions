@echo off
chcp 65001 >/dev/null
echo ========================================
echo GitHub Pages 一键部署
echo ========================================
echo.

REM 检查 git 是否安装
git --version >/dev/null 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git not found. Install from https://git-scm.com/
    echo.
    pause
    exit /b 1
)

echo [OK] Git installed
echo.

REM 进入项目目录
cd /d "%~dp0"
echo Working dir: %cd%
echo.

REM 配置信息
set USERNAME=levi-lee27
set REPO=survey-questions
echo Target: https://github.com/%USERNAME%/%REPO%.git
echo.

REM 检查 .git 是否存在
if exist ".git" (
    echo [WARN] Git repo already exists
    choice /C YN /M "Re-initialize?"
    if errorlevel 2 goto skip_init
    if errorlevel 1 (
        rmdir /s /q .git
        echo Old repo removed
    )
    :skip_init
)

REM 初始化 git
if not exist ".git" (
    echo Initializing git...
    git init
    if %errorlevel% neq 0 (
        echo ERROR: git init failed
        pause
        exit /b 1
    )
)

REM 添加文件
echo Adding files...
git add .
if %errorlevel% neq 0 (
    echo ERROR: git add failed
    pause
    exit /b 1
)

REM 提交
set COMMIT_MSG=Deploy: %date% %time%
echo Committing: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo [WARN] Commit failed (maybe no changes)
)

REM 设置分支
git branch -M main 2>/dev/null

REM 检查远程仓库
git remote | findstr origin >/dev/null
if %errorlevel% equ 0 (
    echo [WARN] Remote 'origin' exists
    choice /C YN /M "Update remote URL?"
    if errorlevel 2 goto skip_remote
    if errorlevel 1 (
        git remote set-url origin https://github.com/%USERNAME%/%REPO%.git
        echo Remote URL updated
    )
    :skip_remote
) else (
    echo Adding remote...
    git remote add origin https://github.com/%USERNAME%/%REPO%.git
)

REM 推送
echo.
echo ========================================
echo Pushing to GitHub...
echo ========================================
echo.
echo NOTE: If asked for password, use Personal Access Token
echo Get token: https://github.com/settings/tokens
echo.
pause

git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo Possible reasons:
    echo 1. Network issue
    echo 2. Authentication failed (need PAT)
    echo 3. Repo doesn't exist
    echo.
    echo See PUSH-TO-GITHUB.md for help
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Code pushed!
echo ========================================
echo.
echo NEXT: Enable GitHub Pages
echo.
echo 1. Visit: https://github.com/%USERNAME%/%REPO%
echo 2. Click Settings tab
echo 3. Find Pages section
echo 4. Source: Deploy from a branch
echo 5. Branch: main -> /root -> Save
echo 6. Wait 1-2 minutes
echo.
echo Your site:
echo   https://%USERNAME%.github.io/%REPO%/
echo.
echo Survey:
echo   https://%USERNAME%.github.io/%REPO%/index.html
echo.
echo QR generator:
echo   https://%USERNAME%.github.io/%REPO%/generate.html
echo.
echo TIPS:
echo - First build takes 1-2 minutes
echo - If 404, wait and refresh
echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
pause
