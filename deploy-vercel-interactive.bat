@echo off
chcp 65001 >nul
echo ========================================
echo Vercel 一键部署向导
echo ========================================
echo.
echo 步骤 1: 检查 Vercel CLI
call vercel --version 2>nul
if %errorlevel% neq 0 (
    echo 正在安装 Vercel CLI...
    call npm install -g vercel
    echo.
)
echo ✅ Vercel CLI 已就绪
echo.

echo 步骤 2: 登录 Vercel
echo 注意：首次部署需要登录 Vercel 账号
echo 如果已有账号，请选择 "Continue with GitHub"
echo 如果没有，可以使用邮箱注册
echo.
pause

cd /d "%~dp0"
call vercel login

echo.
echo ========================================
echo 步骤 3: 部署项目
echo ========================================
echo.
echo 提示：
echo - 第一次部署会询问项目设置
echo - 按提示输入 "Y" 确认配置
echo - 或直接按 Enter 接受默认值
echo.
pause

call vercel --prod

echo.
echo ========================================
echo ✅ 部署完成！
echo ========================================
echo.
echo 请查看上面的输出，获取您的访问地址
echo 通常是类似：https://项目名.vercel.app
echo.
echo 访问下面地址生成二维码：
echo   https://项目名.vercel.app/generate.html
echo.
pause