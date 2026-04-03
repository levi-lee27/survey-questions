# 🚀 快速开始：实现手机电脑数据同步

## 问题：手机扫码填写的问卷在电脑上统计不到？

**原因**：之前数据只存在浏览器本地（localStorage），不同设备之间不共享。

**解决方案**：配置 Firebase 实时数据库，实现跨设备自动同步。

---

## 📋 配置步骤（约 10 分钟）

### 第 1 步：创建 Firebase 项目

1. 访问 https://console.firebase.google.com/
2. 点击 **"Add project"**（添加项目）
3. 输入项目名称：`survey-questions`（或任意名称）
4. 关闭 Google Analytics（可选）
5. 点击 **Create project**（等待 1-2 分钟）

### 第 2 步：启用 Realtime Database

1. 在左侧菜单点击 **"Realtime Database"**
2. 点击 **"Create Database"**
3. **选择位置**：选择离你最近的区域（如 `asia-southeast1`）
4. **安全规则**：选择 **"Start in test mode"**（允许读写）
5. 点击 **Enable**

复制数据库 URL，类似：
```
https://survey-questions-default-rtdb.asia-southeast1.firebasedatabase.app
```

### 第 3 步：获取 Firebase 配置

1. 点击项目名称旁边的 **⚙️ 齿轮图标**（Project settings）
2. 滚动到 **"Your apps"** 部分
3. 点击 **Web 图标** `</>`
4. 注册应用：
   - App nickname: `survey-web`
   - 不要勾选 "Also set up Firebase Hosting?"
5. 点击 **Register app**
6. 复制 `firebaseConfig` 对象的内容！

示例配置：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "survey-questions.firebaseapp.com",
  databaseURL: "https://survey-questions-default-rtdb...",
  projectId: "survey-questions",
  storageBucket: "survey-questions.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:..."
};
```

### 第 4 步：填入配置

1. 在项目文件夹中找到 **`firebase-config.js`**（已存在，但为空）
2. 用记事本打开它
3. 替换成你的配置：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy你的apiKey",
  authDomain: "你的项目.firebaseapp.com",
  databaseURL: "https://你的项目-default-rtdb.firebaseio.com",
  projectId: "你的项目",
  storageBucket: "你的项目.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

4. 保存文件

### 第 5 步：推送代码到 GitHub（已完成）

✅ 所有代码已经包含 Firebase 支持，无需额外修改！

### 第 6 步：测试同步

1. **在电脑上**：
   - 访问 `https://levi-lee27.github.io/survey-questions/generate.html`
   - 创建问卷，记住 surveyId
   - 提交 2-3 次测试数据

2. **在手机上**：
   - 用微信扫码或访问问卷链接
   - 填写并提交 1 次

3. **回到电脑**：
   - 访问 `https://levi-lee27.github.io/survey-questions/admin.html?surveyId=你的surveyId`
   - 应该看到**手机提交的数据**！✅
   - 右上角显示 "● 云端同步"

4. **实时更新测试**（可选）：
   - 电脑和手机同时打开 admin.html
   - 用手机提交新问卷
   - 电脑应该**自动刷新**显示新数据，右下角弹出通知

---

## 📱 使用说明

### 创建问卷
访问 `generate.html`，操作和以前一样，只是现在数据会同步到云端。

### 填写问卷
扫描二维码或点击链接，填写后数据会立即保存到 Firebase。

### 查看统计
访问 `admin.html?surveyId=xxx`：
- ✅ 看到所有设备提交的数据
- ✅ 右上角显示连接状态：`云端同步` 或 `本地模式`
- ✅ 新数据会自动刷新并显示通知

### 导出数据
CSV 导出的数据包含所有设备提交的记录。

---

## 🔧 故障排除

### 问题：提示 "Firebase 未配置" 或显示 "本地模式"
- 确认 `firebase-config.js` 已填入配置
- 检查 Firebase SDK 是否成功加载（控制台无 404）
- 刷新页面重试

### 问题：看不到手机提交的数据
- 确认手机和电脑访问的是**同一个 surveyId**
- 检查 Firebase 控制台的 Realtime Database 是否有数据
- 打开浏览器控制台查看错误信息

### 问题：Firebase 控制台有数据，但 admin.html 看不到
- 检查安全规则是否允许 `read`
- 测试阶段规则应如下：
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
- 在 Firebase Console → Realtime Database → Rules 中编辑
- 点击 **Publish**

### 问题：重复数据
正常现象：如果两个设备同时提交，后写入的会覆盖先写入的（按时间戳排序，不影响统计）

---

## 📊 数据存储位置

| 场景 | 存储位置 |
|------|---------|
| Firebase 配置正确 | 云端 + 本地缓存 |
| Firebase 配置缺失/无网络 | 本地 localStorage |
| 清空数据 | 清除本地 + 云端（如果可用） |

**推荐**：始终使用 Firebase，获得真正的跨设备同步。

---

## 🎯 生产环境建议

1. **限制安全规则**（防止恶意写入）：
```json
{
  "rules": {
    "surveys": {
      ".read": true,
      ".write": "auth != null"  // 需要用户认证
    }
  }
}
```

2. **备份数据**：定期从 Firebase Console 导出 JSON

3. **监控用量**：Firebase Console → Usage 查看读写次数

---

## 📝 文件说明

- `firebase-config.js` - 你的配置（需要手动填入）
- `firebase-config.example.js` - 配置示例模板
- `FIREBASE_INTEGRATION.md` - 详细集成文档
- `FIREBASE_SETUP_GUIDE.md` - Firebase 配置步骤

---

**完成！现在你的问卷系统支持真正的跨设备数据同步了。** 🎉

如有问题，查看 `FIREBASE_INTEGRATION.md` 或提交 Issue。
