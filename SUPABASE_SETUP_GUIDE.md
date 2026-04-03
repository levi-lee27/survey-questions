# 🗄️ Supabase 集成指南 - 跨设备数据同步

## 为什么选择 Supabase？

- ✅ **完全免费**：500MB 数据库 + 2GB 月流量（足够问卷系统）
- ✅ **PostgreSQL 数据库**：功能强大，支持复杂查询
- ✅ **实时订阅**：数据变更自动推送（类似 Firebase）
- ✅ **REST API**：直接调用，无需复杂 SDK 初始化
- ✅ **中国大陆访问**：通常比 Firebase 更稳定
- ✅ **开源可自托管**：未来可迁移到自己的服务器

## 第一步：创建 Supabase 项目

1. 访问：https://supabase.com/
2. 点击 **"Start your project"** 或 **"Sign up"**
3. 注册账号（可使用 GitHub 或邮箱）
4. 登录后，点击 **"New project"**

**项目配置**：
- **Name**: `survey-questions`（任意）
- **Database Password**: 设置一个强密码（记住！）
- **Region**: 选择离你最近的区域（如 `Asia Pacific (Singapore)`）
- **Pricing plan**: **Free**（免费版）

点击 **"Create new project"**
⚠️ 等待 2-3 分钟创建完成（首次可能需要更长时间）

## 第二步：创建数据库表

项目创建后，进入 SQL Editor：

1. 左侧菜单 → **"SQL Editor"**
2. 点击 **"New query"**
3. 粘贴以下 SQL 建表语句：

```sql
-- 创建 surveys 表（存储问卷元数据）
CREATE TABLE surveys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  password TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submission_count INTEGER DEFAULT 0,
  last_submission TIMESTAMPTZ
);

-- 创建 submissions 表（存储提交数据）
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

-- 创建索引（提高查询性能）
CREATE INDEX idx_submissions_survey_id ON submissions(survey_id);
CREATE INDEX idx_submissions_timestamp ON submissions(timestamp);

-- 启用 Row Level Security（RLS）
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 设置测试阶段安全规则（允许所有读写）
CREATE POLICY "Allow all operations" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON submissions FOR ALL USING (true);
```

4. 点击 **"Run"** 执行
5. 应该看到 "Success" 提示

## 第三步：获取 Supabase 配置

1. 左侧菜单 → **"Settings"**（齿轮图标）→ **"API"**
2. 你会看到几个关键信息：

**复制以下内容**：

```
URL: https://your-project.supabase.co
Anon key: eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**记下这两个值**，后续需要。

## 第四步：测试数据库连接

在 SQL Editor 中运行：

```sql
SELECT * FROM surveys;
SELECT * FROM submissions;
```

应该返回空结果（还没数据），这说明表已创建且可访问。

## 第五步：填入配置

打开配置文件：
```
C:\Users\levi_\openclaw\survey-web\supabase-config.js
```

填入你的配置：

```javascript
const supabaseConfig = {
  // Supabase 项目 URL
  url: "https://your-project.supabase.co",

  // Anon key（公开的匿名访问密钥）
  anonKey: "eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
};
```

保存文件。

---

## 🔧 安全规则设置（重要）

默认的 Row Level Security (RLS) 已启用，我们需要允许公开读写（测试阶段）。

在 SQL Editor 中运行以下命令确保策略正确：

```sql
-- 查看现有策略
SELECT * FROM pg_policies WHERE tablename IN ('surveys', 'submissions');

-- 如果策略不存在或需要更新，运行：
DROP POLICY IF EXISTS "Allow all operations" ON surveys;
DROP POLICY IF EXISTS "Allow all operations" ON submissions;

CREATE POLICY "Allow all operations" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON submissions FOR ALL USING (true);
```

---

## 🧪 验证配置

1. 启动本地服务器：
```bash
cd C:\Users\levi_\openclaw\survey-web
python -m http.server 8080
```

2. 访问：http://localhost:8080/generate.html
3. 打开控制台（F12）
4. 应该看到：
   ```
   [Supabase] 配置成功
   URL: https://your-project.supabase.co
   ```

5. 创建问卷并提交
6. 访问 admin.html，应该看到数据 ✅

---

## 📊 数据表结构

```
surveys 表：
  id            TEXT (PRIMARY KEY)  - surveyId
  title         TEXT                - 问卷标题
  password      TEXT                - 管理员密码（可选）
  created_at    TIMESTAMPTZ         - 创建时间
  submission_count INTEGER          - 提交总数
  last_submission TIMESTAMPTZ       - 最后提交时间

submissions 表：
  id            BIGSERIAL (PK)      - 自增 ID
  survey_id     TEXT                - 关联 surveyId
  submission_id BIGINT              - 提交时的时间戳 ID
  timestamp     TIMESTAMPTZ         - 提交时间
  answers       JSONB               - 答案 {1:5, 2:3, 3:5}
  suggestion    TEXT                - 建议内容
  total_score   DECIMAL(3,2)        - 总分
```

---

## 🔄 工作流程

### 提交问卷（app.js）
1. 保存到 localStorage（本地缓存）
2. 同时插入到 Supabase `submissions` 表
3. 更新 `surveys` 表的 `submission_count` 和 `last_submission`

### 查看统计（admin.js）
1. 从 `submissions` 表查询该 surveyId 的所有记录
2. JOIN `surveys` 表获取元数据
3. 实时订阅 `submissions` 表的变更（INSERT/UPDATE/DELETE）

### 清空数据
1. 删除 `submissions` 表中该 surveyId 的所有记录
2. 更新 `surveys` 表的统计字段

---

## 🐛 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 无法连接 Supabase | URL 或 anonKey 错误 | 检查 supabase-config.js |
| 权限拒绝 | RLS 策略限制 | 确保策略是 `USING (true)` |
| 实时订阅不工作 | 未启用 Realtime | 在 Supabase Dashboard → Replication 启用 |
| 网络超时 | 跨域或网络问题 | 检查浏览器控制台 CORS 错误 |

---

## 🎯 完成测试

1. ✅ 电脑创建问卷，提交 2-3 次
2. ✅ 手机扫码，提交 1-2 次
3. ✅ 电脑 admin.html 看到手机数据
4. ✅ 右上角显示"云端同步"
5. ✅ 提交新数据时自动刷新

---

## 📝 下一步

1. 访问 https://supabase.com/ 创建项目
2. 按步骤执行 SQL 建表
3. 复制 URL 和 anonKey 到 supabase-config.js
4. 测试同步功能

**预计时间**：15-20 分钟

如果遇到问题，把错误信息发给我，我会帮你解决！🚀

---

参考：https://supabase.com/docs/guides/database
