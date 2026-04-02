# GitHub Pages 部署指南 - 完整步骤

## ✅ 第一步：创建 GitHub 仓库

1. 登录 https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写：
   - Repository name: `survey-questions`
   - 选择 **Public**
   - 不要勾选任何初始化文件
4. 点击 "Create repository"

---

## ✅ 第二步：推送代码

创建成功后，你会看到页面显示：

```
…or create a new repository on the command line
```

复制下面的完整命令，在 PowerShell 中运行：

```powershell
cd "C:\Users\levi_\openclaw\survey-web"

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/survey-questions.git
git push -u origin main
```

**注意：**
- 把 `你的用户名` 换成你的 GitHub 用户名
- 例如：`https://github.com/john/survey-questions.git`

**完整示例：**
```powershell
cd "C:\Users\levi_\openclaw\survey-web"

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/zhangsan/survey-questions.git
git push -u origin main
```

运行后会提示输入 GitHub 用户名和密码（或个人访问令牌）。

---

## ✅ 第三步：启用 GitHub Pages

推送成功后：

1. 回到你的 GitHub 仓库页面
   - 地址：`https://github.com/你的用户名/survey-questions`

2. 点击 **"Settings"** 标签页

3. 在左侧找到 **"Pages"**（或者直接滚动到 "Pages" 部分）

4. 在 "Build and deployment" 部分：
   ```
   Source: [ Deploy from a branch v ]
   ```
   点击下拉菜单，选择 **"Deploy from a branch"**

5. 点击 **"Save"** 按钮

6. 等待 1-2 分钟
   - 会显示一个绿色的部署进度
   - 完成后会显示网址：`https://你的用户名.github.io/survey-questions/`

---

## ✅ 第四步：测试访问

等待 Pages 构建完成后，访问：

```
https://你的用户名.github.io/survey-questions/
```

应该看到项目列表或直接进入问卷页面。

**访问具体页面：**
- 问卷：`https://你的用户名.github.io/survey-questions/index.html`
- 二维码生成器：`https://你的用户名.github.io/survey-questions/generate.html`
- 统计后台：`https://你的用户名.github.io/survey-questions/admin.html`

---

## ✅ 第五步：生成二维码

1. 访问：`https://你的用户名.github.io/survey-questions/generate.html`
2. 确保域名正确（已预填）
3. 点击「生成二维码」
4. 右键保存二维码图片
5. 分享给用户

---

## 🔄 更新代码

以后修改了代码，重新部署：

```powershell
cd "C:\Users\levi_\openclaw\survey-web"

git add .
git commit -m "Update message"
git push
```

GitHub Pages 会自动重新构建（约 1-2 分钟）。

---

## ⚠️ 常见问题

### 1. 推送时提示 "fatal: Authentication failed"
**原因**：GitHub 从 2021 年起不再支持密码验证
**解决**：
- 使用 **个人访问令牌（Personal Access Token）** 作为密码
- 或使用 **SSH 密钥**

创建令牌：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Classic
3. 勾选 "repo" 权限
4. 复制生成的令牌，在推送时密码框粘贴该令牌

---

### 2. Pages 显示 404
**原因**：还在构建中
**解决**：等待 2-3 分钟再刷新

---

### 3. 仓库没有 Pages 选项
**原因**：仓库是 Private 或组织限制
**解决**：
- 确保仓库是 **Public**
- 组织仓库需要管理员开启 Pages 权限

---

### 4. 页面样式加载失败
**原因**：GitHub Pages 有时缓存问题
**解决**：强制刷新（Ctrl+F5）

---

## 📱 最终访问地址

假设：
- 你的 GitHub 用户名是：`xiaoming`
- 仓库名：`survey-questions`

最终地址：
- **问卷页面**：`https://xiaoming.github.io/survey-questions/index.html`
- **生成二维码**：`https://xiaoming.github.io/survey-questions/generate.html`
- **统计后台**：`https://xiaoming.github.io/survey-questions/admin.html`

---

## 🎯 快速命令（复制即用）

```powershell
# 一次性执行（替换你的用户名）
cd "C:\Users\levi_\openclaw\survey-web"
git init
git add .
git commit -m "Initial"
git branch -M main
git remote add origin https://github.com/你的用户名/survey-questions.git
git push -u origin main
```

---

准备好开始了吗？

**告诉我你的 GitHub 用户名**，我可以帮你生成完整的命令。

或者你已经创建了仓库？把仓库链接发给我，我告诉你下一步怎么做！🚀