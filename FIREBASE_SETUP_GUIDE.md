# 🔥 Firebase Realtime Database 集成指南

## 为什么选择 Firebase？

- ✅ **完全免费**：10GB 存储 + 100GB 月流量（足够问卷系统使用）
- ✅ **实时同步**：数据写入后立即可见
- ✅ **跨设备**：手机、电脑数据完全同步
- ✅ **无需后端**：纯前端直接调用
- ✅ **安全规则**：可配置读写权限

## 第一步：创建 Firebase 项目

1. 访问：https://console.firebase.google.com/
2. 点击 **"Add project"** 或 **"创建项目"**
3. 输入项目名称：`survey-questions`（或任何名称）
4. 关闭 Analytics（可选）
5. 点击 **Create project**（等待 1-2 分钟）

## 第二步：启用 Realtime Database

1. 在项目控制台中，点击 **"Realtime Database"**（左侧菜单）
2. 点击 **"Create Database"**
3. **选择位置**：选择离你最近的区域（如 `asia-southeast1`）
4. **安全规则**：选择 **"Start in test mode"**（先这样，后面可调整）
5. 点击 **Enable**

你会看到数据库 URL，类似：
```
https://survey-questions-default-rtdb.asia-southeast1.firebasedatabase.app
```

**记下这个 URL**，后面需要。

## 第三步：获取 Firebase 配置

1. 点击项目名称旁边的 **齿轮图标** ⚙️
2. 选择 **"Project settings"**
3. 滚动到 **"Your apps"** 部分
4. 点击 **Web 图标** `</>`
5. 注册应用：
   - App nickname: `survey-web`（任意）
   - 勾选 **"Also set up Firebase Hosting?"** → **不勾选**
6. 点击 **"Register app"**
7. 复制 `firebaseConfig` 对象！

**配置示例**：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "survey-questions.firebaseapp.com",
  databaseURL: "https://survey-questions-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "survey-questions",
  storageBucket: "survey-questions.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

## 第四步：部署配置

将 `firebaseConfig` 配置到代码中：

**方法 A：修改 `generate.html`（推荐）**
在 `<script>` 标签中添加配置：

```javascript
// 在 generate.html 的 <script> 标签顶部添加
const firebaseConfig = {
  apiKey: "你的-apiKey",
  authDomain: "你的-authDomain",
  databaseURL: "你的-databaseURL",
  projectId: "你的-projectId",
  storageBucket: "你的-storageBucket",
  messagingSenderId: "你的-messagingSenderId",
  appId: "你的-appId"
};

// 初始化 Firebase（如果 config 存在）
if (firebaseConfig && typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  window.database = firebase.database();
  console.log('[Firebase] 初始化成功');
} else if (typeof firebase === 'undefined') {
  console.warn('[Firebase] Firebase SDK 未加载');
}
```

**方法 B：创建独立的 `firebase-config.js`**
```javascript
// firebase-config.js
window.firebaseConfig = {
  apiKey: "...",
  databaseURL: "...",
  // ...
};
```

然后在 `index.html`, `admin.html`, `generate.html` 中引入：
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
<script src="firebase-config.js"></script>
```

## 第五步：数据模型

Firebase 数据结构（JSON 树）：

```
survey-questions-default-rtdb/
├── surveys/
│   ├── {surveyId}/
│   │   ├── meta/
│   │   │   ├── title: "评审满意度调查"
│   │   │   ├── password: ""
│   │   │   ├── createdAt: "2025-04-03T..."
│   │   │   └── submissionCount: 5
│   │   └── results/
│   │       ├── {submissionId1}/
│   │       │   ├── id: 12345
│   │       │   ├── timestamp: "2025-04-03T..."
│   │       │   ├── answers: {1: 5, 2: 3, 3: 5}
│   │       │   ├── suggestion: "很好"
│   │       │   └── totalScore: 4.2
│   │       └── ...
├── survey_manager_list (可选，兼容旧版)
```

## 第六步：更新安全规则

进入 Firebase Console → Realtime Database → Rules：

**测试阶段**（允许读写）：
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

**生产阶段**（需要认证，更安全）：
```json
{
  "rules": {
    "surveys": {
      "$surveyId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

## 第七步：测试同步

1. 在电脑浏览器打开问卷页面
2. 创建问卷并提交几次
3. 在手机浏览器打开 admin.html
4. 应该立即看到电脑提交的数据！
5. 在手机填写问卷
6. 电脑刷新 admin.html 也能看到手机的数据 ✓

## 📝 下一步

1. 按上述步骤创建 Firebase 项目
2. 将 `firebaseConfig` 提供给我
3. 我会修改代码并完成集成
4. 测试跨设备同步

**预计时间**：30 分钟内完成

---

**有问题吗？** 查看官方文档：  
https://firebase.google.com/docs/database/web/start
