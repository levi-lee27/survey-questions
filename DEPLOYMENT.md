# 部署到互联网 - 完整指南

## 📋 目录

1. [Vercel 部署（推荐）](#vercel)
2. [GitHub Pages 部署](#github-pages)
3. [Cloudflare Pages 部署](#cloudflare-pages)
4. [常见问题](#常见问题)

---

## Vercel 部署 ⚡

Vercel 是最简单的方案，无需配置，自动 HTTPS，全球 CDN。

### 前置要求

- 一个邮箱（用于注册 Vercel）
- 网络可以访问国际网站（注册时可能需要）

### 部署步骤

#### 方式 A：拖拽部署（最简单）

1. **打开 Vercel**
   https://vercel.com/new

2. **拖拽文件夹**
   - 将整个 `survey-web` 文件夹拖入窗口
   - 或点击 "Choose" 选中文件夹

3. **配置项目**
   ```
   Project Name: 任意名称（如：review-survey）
   Framework Preset: Other
   Build Command: 留空
   Output Directory: 留空
   ```

4. **点击 Deploy**
   - 等待 30-60 秒
   - 自动获得：`https://项目名.vercel.app`

5. **测试访问**
   - 问卷：`https://xxx.vercel.app/index.html`
   - 二维码生成器：`https://xxx.vercel.app/generate.html`
   - 统计后台：`https://xxx.vercel.app/admin.html`

---

#### 方式 B：使用命令行（适合多次部署）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **运行部署脚本**
   ```powershell
   # Windows PowerShell
   .\deploy-vercel.ps1
   ```

   或手动：
   ```bash
   cd survey-web
   vercel --prod
   ```

3. **登录**
   - 首次会打开浏览器登录
   - 选择 "Continue with GitHub" 或邮箱登录

4. **确认部署**
   - 按提示确认项目设置（Y）
   - 等待完成

---

#### 方式 C：使用 GitHub 集成（自动部署）

1. **推送到 GitHub**
   ```bash
   cd survey-web
   git init
   git add .
   git commit -m "Initial"
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

2. **导入到 Vercel**
   - 在 Vercel 点击 "Import Project"
   - 选择 "Continue with GitHub"
   - 选择你的仓库

3. **自动更新**
   - 以后只需 `git push`，Vercel 会自动重新部署

---

## GitHub Pages 部署 🐙

适合已有 GitHub 账号的用户，免费稳定。

### 步骤

1. **创建 GitHub 仓库**
   - 访问：https://github.com/new
   - 仓库名：`survey-questionnaire`（建议）
   - 选择 Public（免费）
   - 不要初始化 README

2. **推送代码**
   ```bash
   cd C:\Users\levi_\openclaw\survey-web

   # 修改脚本中的仓库地址，然后运行：
   .\deploy-github.ps1
   ```

   或手动：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/survey-questionnaire.git
   git branch -M main
   git push -u origin main
   ```

3. **启用 Pages**
   - 进入仓库 Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` → `/root`
   - 点击 Save

4. **等待生效**
   - 约 1-2 分钟
   - 访问：`https://你的用户名.github.io/survey-questionnaire/`

5. **测试**
   - 问卷：`https://xxx/index.html`
   - 二维码生成器：`https://xxx/generate.html`

---

## Cloudflare Pages 部署 ☁️

全球 CDN 加速，速度很快。

### 步骤

1. **准备代码**
   - 确保 `survey-web` 文件夹完整

2. **访问 Cloudflare Pages**
   https://dash.cloudflare.com/pages

3. **创建项目**
   - 点击 "Create a project"
   - 选择 "Upload assets"
   - 拖拽 `survey-web` 文件夹

4. **配置构建**
   ```
   Build command: (留空)
   Build output directory: (留空)
   ```

5. **部署**
   - 点击 "Save and Deploy"
   - 获得：`https://项目名.pages.dev`

6. **自定义域名（可选）**
   - 在项目 Settings → Custom domains
   - 添加你的域名

---

## 📱 生成最终二维码

部署成功后，获取你的域名（假设为 `https://your-survey.vercel.app`）：

### 访问生成器

```
https://your-survey.vercel.app/generate.html
```

或使用带参数的链接：

```
https://your-survey.vercel.app/generate.html?title=评审满意度调查
```

### 生成二维码

1. 打开生成器页面
2. 确认域名正确
3. 修改问卷标题（可选）
4. 点击「生成二维码」
5. 右键保存二维码图片

### 分享给用户

**直接链接：**
```
https://your-survey.vercel.app/index.html?title=评审满意度调查
```

**二维码图片：**
- 下载保存的二维码图片
- 打印或分享到微信群

**访问后台统计：**
```
https://your-survey.vercel.app/admin.html
```

---

## 🎨 自定义配置（部署前修改）

### 修改默认标题

编辑 `survey-web/app.js`：
```javascript
const CONFIG = {
  title: '你的问卷标题',  // 修改这里
  questions: [...]
}
```

### 修改域名（脚本中）

编辑 `survey-web/generate.html` 中的默认域名：
```javascript
const serverUrl = 'https://your-survey.vercel.app'
```

---

## 🔄 更新部署

### Vercel
```bash
cd survey-web
# 修改代码后
vercel --prod --force
```

### GitHub Pages
```bash
git add .
git commit -m "Update"
git push
```

---

## ⚠️ 常见问题

### 1. Vercel 部署失败
**原因**：需要科学上网访问
**解决**：使用 GitHub Pages 方案或切换网络

### 2. GitHub Pages 显示 404
**原因**：Pages 还在构建中
**解决**：等待 2-3 分钟，刷新页面

### 3. 微信中无法打开
**原因**：微信内必须 HTTPS
**解决**：所有方案都自动 HTTPS，确保域名已备案（国内需备案）

### 4. 数据丢失
**原因**：localStorage 按域名存储
**解决**：同一域名数据会保留，不同域名数据独立

### 5. 想要自定义域名
**方案**：
- Vercel：Project Settings → Domains 添加
- GitHub Pages：CNAME 文件 + DNS 配置
- Cloudflare：Custom domains 添加

---

## 📊 访问统计（可选）

### Vercel Analytics
- 在 Vercel 项目点击 "Analytics"
- 查看流量、访问来源

### Google Analytics
在 `index.html` 和 `admin.html` 的 `<head>` 添加：
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🎯 推荐方案对比

| 特性 | Vercel | GitHub Pages | Cloudflare Pages |
|------|--------|--------------|------------------|
| 部署难度 | ⭐ 最简单 | ⭐⭐ 简单 | ⭐⭐ 简单 |
| 速度 | ⭐⭐⭐ 快 | ⭐⭐ 中等 | ⭐⭐⭐ 极快 |
| 自定义域名 | ✅ 免费 | ✅ 免费 | ✅ 免费 |
| 构建时间 | 自动 | 1-2分钟 | 自动 |
| 免费额度 | 无限制 | 无限制 | 无限制 |
| 需要账号 | ✅ | ✅ | ✅ |
| HTTPS | ✅ 自动 | ✅ 自动 | ✅ 自动 |
| 国内访问 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

**推荐选择：** 优先 Vercel，次选 Cloudflare Pages

---

## 🚀 快速决策

**如果你：**
- 有 GitHub 账号 → 选 **GitHub Pages**
- 可以访问 Vercel → 选 **Vercel**（最快）
- 需要国内访问 → 选 **Cloudflare Pages**
- 想要最简单 → 直接双击 `deploy-vercel.ps1`

---

## 💡 下一步

部署成功后：

1. ✅ 访问你的域名确认正常
2. ✅ 用手机扫码测试问卷
3. ✅ 生成并分享二维码
4. ✅ 将统计后台链接保存到收藏夹
5. 🔄 定期导出数据备份（admin.html → 导出 CSV）

---

**有问题？**
查看 `README.md` 或运行 `start.bat` 本地测试
