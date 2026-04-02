# 🚀 最快部署指南（60秒内完成）

## 方法：Vercel 拖拽部署（无需命令行）

### 准备工作
✅ `survey-web` 文件夹已准备好（当前目录）

---

## 📋 部署步骤

### 第 1 步：打开 Vercel 网站

在浏览器打开：
```
https://vercel.com/new
```

（如果无法访问，请检查网络或使用 GitHub Pages 方案）

---

### 第 2 步：拖拽文件夹

1. 保持浏览器窗口打开
2. 找到 `survey-web` 文件夹：
   ```
   C:\Users\levi_\openclaw\survey-web
   ```
3. 直接将整个文件夹**拖拽**到 Vercel 网页的虚线框内

---

### 第 3 步：配置项目（简单设置）

拖拽后，Vercel 会显示配置页面：

```
Project Name: survey-questions  ← 可以改成你喜欢的名字
Framework Preset: Other          ← 选择 "Other"
```

**其他选项全部留空或默认**

然后点击 **"Deploy"** 按钮

---

### 第 4 步：等待部署 ⏳

- 等待 30-60 秒
- 进度条走完会显示 "Your deployment is ready!"
- 顶部会显示网址，类似：
  ```
  https://survey-questions.vercel.app
  ```

**复制这个网址**，这是你的公网地址

---

### 第 5 步：测试访问

打开新标签页，访问：

```
https://你的域名/index.html
```

应该看到问卷页面。

访问：
```
https://你的域名/generate.html
```

可以生成二维码。

访问：
```
https://你的域名/admin.html
```

是统计后台。

---

### 第 6 步：生成二维码

1. 访问 `https://你的域名/generate.html`
2. 页面会自动显示问卷的预览和二维码
3. 右键点击二维码图片 → "图片另存为"
4. 保存到本地，或截图分享

---

## ✅ 完成！

现在你的问卷系统已经部署到互联网，任何人扫码都能填写。

---

## 🔧 进阶配置（可选）

### 1. 自定义域名

在 Vercel 项目页面：
- 点击项目 → Settings → Domains
- 添加你的域名（如：survey.yourcompany.com）
- 在域名 DNS 添加 CNAME 指向 `cname.vercel-dns.com`

### 2. 修改问卷标题

编辑 `survey-web/app.js` 第 3 行，修改 `title` 字段，然后重新部署。

### 3. 后续更新

修改代码后，重新拖拽部署，或使用命令行：
```bash
cd survey-web
npx vercel --prod
```

---

## ❓ 遇到问题？

### Q: Vercel 网站打不开？
A: 可能需要科学上网。改用 GitHub Pages 方案（见下方）

### Q: 部署后 404？
A: 等待 1-2 分钟，Vercel 需要时间生效

### Q: 微信里打不开？
A: 确保是 HTTPS 网址，Vercel 自动提供 HTTPS

### Q: 数据会丢失吗？
A: 数据存储在用户浏览器本地，不会上传服务器。如需持久化，需对接后端。

---

## 🌐 备选方案：GitHub Pages（不需要科学上网）

如果无法访问 Vercel，使用 GitHub Pages：

1. 登录 https://github.com
2. 点击右上角 "+" → "New repository"
3. 仓库名：`survey-questions`（任意）
4. 选择 "Public"，**不要**勾选 README、.gitignore 等
5. 点击 "Create repository"

然后在 `survey-web` 文件夹运行：

```bash
git init
git add .
git commit -m "Initial"
git branch -M main
git remote add origin https://github.com/你的用户名/survey-questions.git
git push -u origin main
```

回到 GitHub 仓库：
- Settings → Pages
- Source: Deploy from a branch
- Branch: main → /root → Save

等待 2 分钟后访问：
```
https://你的用户名.github.io/survey-questions/
```

---

## 📞 需要帮助？

遇到问题请告诉我：
1. 你用的是哪个方案？
2. 具体在哪个步骤出错？
3. 错误提示是什么？

我可以一步步帮你解决！

---

**祝你部署顺利！🎉**
