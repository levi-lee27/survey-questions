# 🗄️ Supabase 跨设备同步 - 快速配置指南

## 📌 问题解决

**问题**：手机扫码填写的问卷在电脑统计后台看不到  
**原因**：之前数据只存浏览器本地，不同设备不共享  
**解决**：配置 Supabase 实时数据库，实现云端同步

---

## 🚀 配置步骤（15 分钟）

### 步骤 1：创建 Supabase 项目

1. 访问：https://supabase.com/
2. 点击 **"Start your project"**
3. 注册（可用 GitHub 或邮箱）
4. 登录后 → **"New project"**

**项目配置**：
- **Name**: `survey-questions`（任意）
- **Database Password**: 设置一个强密码（记住！）
- **Region**: 选择最近区域（如 `Singapore`）
- **Pricing plan**: **Free**
- 点击 **"Create new project"**

⚠️ 等待 2-3 分钟创建完成

---

### 步骤 2：创建数据库表

项目创建后：

1. 左侧菜单 → **"SQL Editor"**
2. 点击 **"New query"**
3. 粘贴以下 SQL：

```sql
-- 创建 surveys 表（问卷元数据）
CREATE TABLE surveys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  password TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submission_count INTEGER DEFAULT 0,
  last_submission TIMESTAMPTZ
);

-- 创建 submissions 表（提交数据）
CREATE TABLE submissions (
  id BIGSERIAL PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  submission_id BIGINT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB NOT NULL,
  suggestion TEXT,
  total_score DECIMAL(3,2) NOT NULL,
  UNIQUE(survey_id, submission_id)
);

-- 创建索引
CREATE INDEX idx_submissions_survey_id ON submissions(survey_id);
CREATE INDEX idx_submissions_timestamp ON submissions(timestamp);

-- 启用 Row Level Security
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 设置测试规则（允许所有读写）
CREATE POLICY "Allow all operations" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON submissions FOR ALL USING (true);
```

4. 点击 **"Run"**
5. 显示 "Success" ✅

---

### 步骤 3：获取配置信息

1. 左侧菜单 → **"Settings"**（齿轮图标）→ **"API"**
2. 复制以下信息：

```
URL: https://your-project.supabase.co
Anon key: eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**记下这两个值**

---

### 步骤 4：填入配置

打开文件：
```
C:\Users\levi_\openclaw\survey-web\supabase-config.js
```

填入你的配置：

```javascript
const supabaseConfig = {
  // Supabase 项目 URL
  url: "https://your-project.supabase.co",

  // Anon key
  anonKey: "eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
};
```

保存文件。

---

### 步骤 5：验证配置

1. 启动本地服务器：
```bash
cd C:\Users\levi_\openclaw\survey-web
python -m http.server 8080
```

2. 访问：http://localhost:8080/generate.html
3. 按 F12 打开控制台
4. 应该看到：
   ```
   ✅ Supabase 已配置
   URL: https://your-project.supabase.co
   ```

5. 创建问卷并提交
6. 访问 admin.html，数据应该正常显示 ✅

---

## 🧪 测试跨设备同步

1. **电脑**：访问 generate.html → 创建问卷 → 提交 2-3 次
2. **手机**：扫描二维码 → 提交 1-2 次
3. **电脑**：刷新 admin.html
   - ✅ 看到手机提交的数据
   - ✅ 右上角显示"● 云端同步"（绿色）
   - ✅ 提交新数据时右下角弹出通知

---

## 📊 数据表结构

**surveys 表**：
```
id          TEXT (surveyId)
title       TEXT
password    TEXT
created_at  TIMESTAMPTZ
submission_count INTEGER
last_submission  TIMESTAMPTZ
```

**submissions 表**：
```
id              BIGSERIAL (自增)
survey_id       TEXT
submission_id   BIGINT (时间戳)
timestamp       TIMESTAMPTZ
answers         JSONB ({1:5, 2:3, 3:5})
suggestion      TEXT
total_score     DECIMAL(3,2)
```

---

## 🔐 安全规则（生产环境）

当前为测试模式（允许公开读写）。

生产环境建议添加认证：
```sql
-- 在 SQL Editor 中运行
DROP POLICY IF EXISTS "Allow all operations" ON surveys;
DROP POLICY IF EXISTS "Allow all operations" ON submissions;

-- 只允许已认证用户读写
CREATE POLICY "Authenticated users only" ON surveys 
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users only" ON submissions 
  FOR ALL USING (auth.role() = 'authenticated');
```

注意：需要启用 Supabase Auth。

---

## 🐛 故障排除

| 问题 | 解决 |
|------|------|
| 控制台显示 "Supabase 未配置" | 检查 supabase-config.js 是否填完 |
| 权限错误 | 确保 RLS 策略是 `USING (true)` |
| 无法写入 | 检查表是否已创建 |
| 实时订阅不工作 | 在 Supabase → Replication 启用 |

---

## 📝 配置清单

- [ ] 创建 Supabase 项目
- [ ] 执行 SQL 建表
- [ ] 复制 URL 和 anonKey
- [ ] 填入 supabase-config.js
- [ ] 本地测试通过
- [ ] 测试手机+电脑同步

---

## 🎯 完成！

配置完成后，你的问卷系统将支持：
- ✅ 跨设备数据同步
- ✅ 实时更新推送
- ✅ 云端持久化存储
- ✅ 自动降级到本地（无网络时）

**预计时间**：15-20 分钟

如果遇到问题，查看 `SUPABASE_INTEGRATION.md` 或告诉我错误信息！
