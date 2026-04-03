# 评审满意度调查 - 网页版

一个轻量级的网页问卷系统，无需注册登录，开箱即用。

## ✨ 功能特性

- ✅ **响应式设计** - 完美适配手机、平板、电脑
- ✅ **可配置标题** - 自定义问卷名称
- ✅ **权重评分** - 三个维度（40%、40%、20%）
- ✅ **实时统计** - 自动计算加权总分
- ✅ **数据导出** - 支持 CSV 格式导出
- ✅ **二维码生成** - 一键生成可分享的二维码
- ✅ **本地存储** - 数据保存在浏览器（无需后端）
- ✅ **跨设备同步** - 可选 Firebase 实时数据库同步（手机/电脑数据互通）
- ✅ **搜索筛选** - 支持按建议内容搜索
- ✅ **排序功能** - 按时间、分数排序

## 📁 项目结构

```
survey-web/
├── index.html          # 问卷填写页面
├── styles.css          # 问卷样式
├── app.js              # 问卷逻辑
├── admin.html          # 统计后台页面
├── admin-styles.css    # 管理后台样式
├── admin.js            # 管理后台逻辑
├── generate.html       # 二维码生成器
└── README.md           # 说明文档
```

## 🚀 快速开始

### 方法一：直接打开（测试用）

直接双击 `index.html` 在浏览器中打开即可使用。

⚠️ 注意：这种方式生成的 URL 使用 `file://` 协议，某些浏览器可能有存储限制。

### 方法二：使用本地服务器（推荐）

1. **使用 Python**（如果已安装）

```bash
cd survey-web
python -m http.server 8080
# 访问 http://localhost:8080
```

2. **使用 Node.js**

```bash
npx serve survey-web
# 或
npx http-server survey-web -p 8080
```

3. **使用 VS Code 插件**
   - 安装 "Live Server" 插件
   - 右键 `index.html` → "Open with Live Server"

### 方法三：部署到云端（正式使用）

#### GitHub Pages

1. 上传到 GitHub 仓库
2. 设置 → Pages → 选择 `survey-web` 文件夹
3. 访问 `https://yourusername.github.io/repo-name/`

#### Vercel / Netlify

拖拽 `survey-web` 文件夹到平台即可自动部署。

## 📱 使用步骤

### 1. 配置问卷标题

打开 `app.js`，修改第 3 行：

```javascript
const CONFIG = {
  title: '你的问卷标题',  // 这里修改
  questions: [...]
}
```

或在部署后通过 URL 参数动态设置：
```
http://your-domain.com/index.html?title=自定义标题
```

### 2. 生成二维码

1. 打开 `generate.html`
2. 输入问卷标题
3. 输入部署地址（如：`https://your-domain.com`）
4. 点击「生成二维码」
5. 保存或打印二维码

### 3. 访问后台统计

访问：
```
http://your-domain.com/admin.html
```

或从问卷页点击右下角的「📊 统计后台」按钮。

## 📊 数据存储

- **存储位置**：浏览器 localStorage
- **数据结构**：JSON 数组
- **键名**：`survey_results`
- **导出格式**：CSV（Excel 可打开）

### 示例数据

```json
{
  "id": 1712025600000,
  "timestamp": "2025-04-02T08:00:00.000Z",
  "answers": {
    "1": 5,
    "2": 3,
    "3": 5
  },
  "suggestion": "建议增加更多选项",
  "totalScore": 4.2
}
```

## 🎨 自定义样式

### 修改配色

编辑 `styles.css` 中的渐变色：

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

替换为你喜欢的颜色（例如：`#ff6b6b` 到 `#ff8e53`）。

### 自定义问题

编辑 `app.js` 中的 `CONFIG.questions`：

```javascript
questions: [
  {
    id: 1,
    number: '①',
    text: '你的问题文本',
    weight: 0.4,  // 权重（建议三个总和为 1）
    options: [
      { label: '优秀', value: 5, emoji: '⭐' },
      { label: '良好', value: 3, emoji: '👍' },
      { label: '较差', value: 1, emoji: '⚠️' }
    ]
  },
  // ... 更多问题
]
```

对应的评分逻辑（加权计算）会自动更新。

## 📤 数据导出

在管理后台点击「导出数据」即可下载 CSV 文件，包含：
- 提交 ID
- 提交时间
- 每题原始分和加权分
- 综合总分
- 用户建议

## 🔧 生产环境建议

### 1. HTTPS 部署

微信内打开必须使用 HTTPS（localhost 除外）。

### 2. 数据持久化（可选）

如需长期保存或跨设备同步，可对接后端 API：

- 修改 `app.js` 的 `saveSurvey()` 函数，使用 `fetch()` 发送数据
- 修改 `admin.js` 的 `loadData()`，从 API 获取数据

### 3. 防止重复提交

- 添加邮箱/手机验证
- 使用 IP 限制
- 增加防刷机制

### 4. SEO 优化（可选）

- 添加 `manifest.json`
- 配置 `robots.txt`
- 优化 meta tags

## 🔐 安全性说明

- 本项目无后端，数据仅存储在用户本地
- 无用户认证，适合内部使用场景
- 如需生产环境，建议添加后端验证和 CSP 保护

## 🐛 已知限制

- 支持主流浏览器（Chrome、Safari、Firefox、Edge）
- 手机微信内访问需 HTTPS
- 清空数据操作不可恢复

## 📮 反馈

如有问题或建议，欢迎提交 Issue。

---

**开发完成时间：2025-04-02**
**版本：1.0.0**