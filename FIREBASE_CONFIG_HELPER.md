# 🔧 Firebase 配置助手

## 当前状态
- ✅ 代码已包含 Firebase 集成（已推送 GitHub）
- ❌ 尚未配置 Firebase（firebase-config.js 为空）
- 📍 部署地址：https://levi-lee27.github.io/survey-questions/

---

## 📋 配置步骤（跟着做即可）

### 步骤 1：访问 Firebase Console

打开：https://console.firebase.google.com/

**需要 Google 账号**（如 Gmail）

### 步骤 2：创建项目

1. 点击 **"Add project"** 或 **"创建项目"**
2. 项目名称输入：`survey-questions`（或任意名称）
3. **取消勾选** "Enable Google Analytics for this project"
4. 点击 **Create project**
5. 等待 1-2 分钟创建完成

### 步骤 3：启用 Realtime Database

1. 在项目控制台左侧，找到 **"Realtime Database"**（可能在 Build 分类下）
2. 点击 **"Create Database"**
3. **选择位置**：选择离你最近的区域，例如：
   - `asia-southeast1`（东南亚，新加坡）
   - `asia-east1`（东亚，台湾/香港）
   - `us-central1`（美国中部）
4. **安全规则**：选择 **"Start in test mode"**（⚠️ 重要）
5. 点击 **Enable**

你会看到数据库 URL，例如：
```
https://survey-questions-default-rtdb.asia-southeast1.firebasedatabase.app
```

**记下这个 URL**（后续需要）

### 步骤 4：获取 Web 应用配置

1. 点击项目名称旁边的 **⚙️ 齿轮图标** → **Project settings**
2. 滚动到 **"Your apps"** 部分
3. 点击 **Web 图标** `</>`（"Add app"）
4. 注册应用：
   - **App nickname**: `survey-web`（任意）
   - **Also set up Firebase Hosting?** → **不要勾选**
5. 点击 **Register app**
6. **复制 firebaseConfig 对象**（非常重要！）

你会看到类似这样的代码：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "survey-questions.firebaseapp.com",
  databaseURL: "https://survey-questions-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "survey-questions",
  storageBucket: "survey-questions.appspot.com",
  messagingSenderId: "123456789012345",
  appId: "1:123456789012345:web:abcdef123456789"
};
```

### 步骤 5：填入配置

打开项目文件夹：
```
C:\Users\levi_\openclaw\survey-web\firebase-config.js
```

用记事本（或任何编辑器）打开它，替换成你的配置：

```javascript
const firebaseConfig = {
  // ⬇️ 粘贴你从 Firebase 复制的完整配置
  apiKey: "AIzaSy你的apiKey",
  authDomain: "你的项目.firebaseapp.com",
  databaseURL: "https://你的项目-default-rtdb.你的区域.firebasedatabase.app",
  projectId: "你的项目",
  storageBucket: "你的项目.appspot.com",
  messagingSenderId: "123456789012345",
  appId: "1:123456789012345:web:abcdef123456789"
};
```

**保存文件**

---

## ✅ 验证配置

### 方法 A：本地测试

1. 启动本地服务器：
```bash
cd C:\Users\levi_\openclaw\survey-web
python -m http.server 8080
```

2. 打开浏览器访问：
   ```
   http://localhost:8080/generate.html
   ```

3. 打开浏览器控制台（F12）

4. 应该看到：
   ```
   [Firebase] 初始化成功
   Database URL: https://你的项目...
   ```

   如果看到 "⚠️ Firebase 未配置"，说明配置有误

### 方法 B：验证数据同步

1. 在 `generate.html` 创建问卷
2. 在 `admin.html` 查看统计
3. 提交问卷后，检查：
   - 右上角显示 **"● 云端同步"**（绿色）
   - 数据正常显示

### 方法 C：查看 Firebase 控制台

1. 回到 Firebase Console
2. 点击 **Realtime Database**
3. 你应该看到数据结构：
```
surveys/
  {surveyId}/
    meta/
    results/
```

---

## 🔐 设置安全规则（可选但建议）

进入 Firebase Console → Realtime Database → Rules

**测试阶段**（允许所有人读写）：
```json
{
  "rules": {
    "surveys": {
      ".read": true,
      ".write": true
    }
  }
}
```

**生产阶段**（更安全，需要认证）：
```json
{
  "rules": {
    "surveys": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

点击 **Publish** 保存

---

## 🐛 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 显示"Firebase 未配置" | firebase-config.js 为空或格式错误 | 检查是否填入完整配置，保存文件 |
| 控制台报错 404 | Firebase SDK 加载失败 | 检查网络，或直接访问 https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js 是否能打开 |
| 无法写入数据 | 安全规则限制 | 设置为测试模式（.read/.write: true） |
| 显示"本地模式" | Firebase 未初始化 | 检查 firebaseConfig.apiKey 是否存在 |
| 数据不同步 | 两个设备访问不同 surveyId | 确认 URL 中的 surveyId 一致 |

---

## 🎯 完成后测试

1. ✅ 电脑访问 generate.html → 创建问卷
2. ✅ 电脑提交 2-3 次
3. ✅ 手机扫码 → 提交 1-2 次
4. ✅ 电脑 admin.html → 看到手机提交的数据
5. ✅ 右上角显示 "云端同步"

**恭喜！跨设备同步已完成！** 🎉

---

## 📝 需要我帮你？

如果你已完成 Firebase 项目创建，但不确定如何获取配置：
1. 截图 Firebase Project settings → Your apps 部分发给我
2. 我会帮你填写配置

或者，如果你遇到任何错误，把控制台的错误信息发给我，我会帮你解决。

**现在请开始步骤 1，完成后告诉我进展！** 💪
