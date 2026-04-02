@echo off
chcp 437 >/dev/null
echo ========================================
echo GITHUB PAGES DEPLOYMENT
echo ========================================
echo.

REM Check git
git --version >/dev/null 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git not found.
    echo Install from: https://git-scm.com/
    echo.
    pause
    exit /b 1
)
echo [OK] Git installed
echo.

REM Change to script directory
cd /d "%~dp0"
echo Working directory: %cd%
echo.

REM Configuration
set USERNAME=levi-lee27
set REPO=survey-questions
echo Target: https://github.com/%USERNAME%/%REPO%.git
echo.

REM Initialize git if needed
if exist ".git" (
    echo [WARN] .git folder exists.
    choice /C YN /M "Delete and re-init?"
    if errorlevel 2 goto skip_init
    rmdir /s /q .git
    echo Old repo removed.
)
if not exist ".git" (
    echo Initializing git...
    git init
    if %errorlevel% neq 0 (
        echo ERROR: git init failed
        pause
        exit /b 1
    )
)
:skip_init

REM Add and commit
echo Adding files...
git add .
git commit -m "Deploy: %date% %time%" 2>/dev/null
if %errorlevel% equ 0 (
    echo [OK] Files committed
) else (
    echo [INFO] Commit skipped (no changes)
)

REM Set branch
git branch -M main 2>/dev/null

REM Configure remote
git remote | findstr origin >/dev/null
if %errorlevel% equ 0 (
    echo [INFO] Remote 'origin' exists, updating...
    git remote set-url origin https://github.com/%USERNAME%/%REPO%.git
) else (
    echo Adding remote repository...
    git remote add origin https://github.com/%USERNAME%/%REPO%.git
)

echo.
echo ========================================
echo PUSHING TO GITHUB
echo ========================================
echo.
echo IMPORTANT: GitHub no longer accepts passwords.
echo You need a Personal Access Token (PAT).
echo.
echo Create token at:
echo https://github.com/settings/tokens
echo (Select "Classic", check "repo" scope)
echo.
echo When prompted:
echo   Username: %USERNAME%
echo   Password: [paste your token here]
echo.
pause

git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo Possible reasons:
    echo 1. Network issue
    echo 2. Invalid/expired token
    echo 3. Repository not created yet
    echo.
    echo Action needed:
    echo - Ensure repo exists: https://github.com/%USERNAME%/%REPO%
    echo - Create new token if needed
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Code pushed to GitHub!
echo ========================================
echo.
echo NEXT STEP: Enable GitHub Pages
echo.
echo 1. Go to: https://github.com/%USERNAME%/%REPO%
echo 2. Click "Settings" tab
echo 3. Scroll to "Pages" section
echo 4. Source: select "Deploy from a branch"
echo 5. Branch: choose "main" -> "/root" -> Save
echo 6. Wait 1-2 minutes for build
echo.
echo YOUR URLS:
echo   Homepage: https://%USERNAME%.github.io/%REPO%/
echo   Survey:   https://%USERNAME%.github.io/%REPO%/index.html
echo   QR Code:  https://%USERNAME%.github.io/%REPO%/generate.html
echo.
echo NOTES:
echo - First build takes 1-2 minutes
echo - If 404 appears, wait and refresh
echo.
echo ========================================
echo DEPLOYMENT FINISHED!
echo ========================================
echo.
pause
