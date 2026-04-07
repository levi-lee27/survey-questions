# 🔍 跨设备同步失败排查指南

**问题**: 手机扫码填写问卷后，电脑 admin.html 仍无数据，只有本地填写的问卷被统计

**诊断日期**: 2026-04-07
**状态**: 🔧 正在深度排查

---

## 📋 系统架构

```
问卷填写流程:
  手机填写 (app.js)
    ↓
  保存到 localStorage (手机)
    ↓
  保存到 Supabase submissions 表 ⬅️ 跨设备关键
    ↓
  更新 Supabase surveys meta 表
    ↓
  电脑 admin (admin.html)
    ↓
  从 Supabase 加载数据 ⬅️ 核心依赖
    ↓
  显示统计数据
```

**关键依赖**: 必须确保数据写入 Supabase，且 admin 能从 Supabase 读取。

---

## 🎯 可能原因

### 原因 1: Supabase RLS 策略阻止读写（最常见）

**症状**:
- ✅ localStorage 保存成功（手机控制台看到日志）
- ❌ Supabase 写入失败（控制台有错误）
- 电脑 admin 只能看到本地数据（如果使用同一浏览器），看不到手机数据

**检查方法**:
1. 在手机填写问卷时打开控制台（Chrome → 远程调试）
2. 查看是否有 RLS 相关错误：
   ```
   Error: inserts on table "submissions" violate row level security policy
   Error: row level security policy violation
   ```

**修复**: https://supabase.com/dashboard → 项目 → Authentication → Policies
- 对 `submissions` 表: 删除所有策略 或 设置为 "Allow all"
- 对 `surveys` 表: 删除所有策略 或 设置为 "Allow all"

---

### 原因 2: Supabase 表结构不完整

**症状**: 提交时表格不存在或字段不匹配

**检查方法**:
1. 访问 https://supabase.com/dashboard → Table Editor
2. 确认存在以下表和字段:

**surveys 表**:
```sql
id (text, primary key)
title (text)
password (text, default '')
created_at (timestamptz)
submission_count (integer, default 0)
last_submission (timestamptz, nullable)
```

**submissions 表**:
```sql
id (serial, primary key)
survey_id (text)
submission_id (bigint)
timestamp (timestamptz)
answers (jsonb)
suggestion (text)
total_score (decimal)
-- 唯一约束: UNIQUE(survey_id, submission_id)
```

**修复**: 执行 `TEST_SUPABASE_SCHEMA.sql` 中的建表语句

---

### 原因 3: 首次提交时 meta 创建失败（已修复）

**症状**: 手机提交后，`surveys` 表无记录

**已修复**: 代码中已捕获 PGRST116 异常并自动创建

**验证**: 在手机控制台运行 `diagnose-sync.js`

---

### 原因 4: 网络问题导致写入失败

**症状**: 手机端控制台看到网络错误

**检查方法**:
```javascript
// 在填写页控制台运行
console.log('supabaseClient:', supabaseClient);
// 查看是否有网络错误
```

**常见错误**:
- `Network error` - 设备无法连接 Supabase
- `CORS` - Supabase 域名配置问题

**修复**: 确保设备能正常访问 `https://ffzrmdygvnvcvokgooov.supabase.co`

---

### 原因 5: 电脑 admin 只读 localStorage，未正确降级

**症状**:
- 手机提交成功（localStorage）
- 电脑 admin 显示"问卷不存在"

**原因**: admin.js 的 loadStatistics() 首先从 Supabase 加载 meta，失败后才降级到 localStorage。如果手机和电脑的 localStorage 不共享，电脑的 localStorage 没有该问卷的 meta，就会显示"问卷不存在"。

**当前逻辑**:
```javascript
// admin.js:34-52
// 1. 优先从 Supabase 加载 meta ✅
// 2. 如果失败，从 localStorage 加载 （只在当前设备有数据时才有效）
```

**预期行为**:
- ✅ 如果 Supabase 有 meta → admin 显示数据（跨设备）
- ✅ 如果 Supabase 无 meta 但本地有 meta → admin 显示本地数据（同一设备）
- ❌ 如果 Supabase 无 meta 且本地无 meta → 显示"问卷不存在"

**你的场景**: Supabase 应该有 meta（如果 createSurvey 成功），所以应该从 Supabase 加载。

---

## 🔧 诊断步骤

### 步骤 1: 手机端诊断（提交后）

在手机填写问卷并提交后：

1. 打开浏览器控制台（通过 remote debugging 或注入）
2. 复制 `diagnose-sync.js` 全部内容粘贴运行
3. 截图结果

**关键指标**:
- ✅ localStorage 有 `survey_meta_xxx` 和 `survey_results_xxx`
- ✅ Supabase surveys 表有记录
- ✅ Supabase submissions 表有记录
- ❌ 任何错误信息

---

### 步骤 2: Supabase Dashboard 检查

登录 https://supabase.com/dashboard → 你的项目

**surveys 表**:
- 应该看到问卷记录（id = surveyId）
- 字段: `title`, `submission_count`, `last_submission`

**submissions 表**:
- 应该看到提交记录，`survey_id` 等于你的 surveyId
- 字段: `survey_id`, `submission_id`, `timestamp`, `answers`, `total_score`

**如果没有数据**:
- 说明手机端写入失败
- 检查手机控制台错误日志
- 检查 RLS 策略

---

### 步骤 3: 电脑 admin 端诊断

访问 admin.html?surveyId=xxx

1. 打开控制台（F12）
2. 运行 `browser-verify.js` 或 `admin-diagnose-detailed.js`
3. 检查:
   - `currentSurveyId` 是否正确
   - `allRecords.length` 为多少
   - Supabase 是否加载成功

**预期日志**:
```
[Supabase] Meta loaded: {...}
[Supabase] 开始加载数据...
[Supabase] 加载了 1 条记录
```

**如果日志显示"暂无数据"**:
- Supabase submissions 表确实无记录
- 或 Supabase 查询失败（错误码）

---

## 🛠️ 快速修复检查清单

### ✅ 检查 1: RLS 策略

1. 访问 Supabase Dashboard
2. 左侧 → Table Editor → `submissions` 表
3. 点击 "Policies" 标签
4. 查看是否有策略阻止读取/写入
5. **临时解决方案**: 删除所有策略（开发环境）

---

### ✅ 检查 2: 表结构

执行 `TEST_SUPABASE_SCHEMA.sql` 中的 SQL 语句（通过 SQL Editor）：

```sql
-- 检查表是否存在
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('surveys', 'submissions');

-- 检查字段
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'submissions';

-- 查看数据
SELECT * FROM surveys WHERE id = '你的surveyId';
SELECT * FROM submissions WHERE survey_id = '你的surveyId';
```

---

### ✅ 检查 3: 实时订阅

**realtime** 功能需要在 Supabase Dashboard 启用:

1. Database → Replication
2. 确认 "Realtime" 已启用
3. 确认 `submissions` 和 `surveys` 表已添加到 publication

执行:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE surveys;
```

---

### ✅ 检查 4: 手机端控制台

在手机填写并提交时，观察控制台:

```
✅ 应该看到:
[Supabase] 数据已保存，计数更新为: 1

❌ 如果看到:
[Supabase] 保存提交失败: ...
[Supabase] 保存异常: ...
```

如果有错误，截图提供。

---

## 📊 常见错误和解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| `row level security policy violation` | RLS 阻止 | 禁用 RLS 或添加 "Allow all" 策略 |
| `relation "surveys" does not exist` | 表不存在 | 执行建表 SQL |
| `column "xxx" does not exist` | 字段不匹配 | 检查表结构，添加缺失字段 |
| `Network error` | 网络问题 | 检查设备能否访问 Supabase |
| `PGRST116` | 记录不存在（正常） | 忽略（已处理） |
| `duplicate key value violates unique constraint` | 重复提交 | 忽略（upsert 会处理） |

---

## 🧪 验证修复

### 手动测试流程

1. **清除所有数据**（admin.html → 清空数据 + 本地清除 + Supabase 清空）

2. **创建问卷** (电脑)
   - 访问 generate.html
   - 记录 surveyId

3. **手机提交** (手机)
   - 扫码打开问卷
   - 填写并提交
   - 提交后立即检查手机控制台日志

4. **立即检查 Supabase Dashboard**
   - 刷新 surveys 表 → 应该看到记录
   - 刷新 submissions 表 → 应该看到提交

5. **电脑查看 admin** (电脑)
   - 访问 admin.html?surveyId=xxx
   - **预期**: 立即显示手机提交的数据

---

## 📞 需要的信息

如果修复后仍不成功，请提供:

1. **手机端控制台日志**（提交时的所有日志）
2. **Supabase Dashboard 截图**（surveys 和 submissions 表的内容）
3. **电脑 admin 控制台日志**（`browser-verify.js` 运行结果）
4. **surveyId** 和问卷标题
5. **提交时间**（大概）

---

## 🔧 立即行动

1. **导出诊断**: 在手机和电脑分别运行诊断脚本
2. **检查 Supabase**: 登录 Dashboard 查看表数据
3. **确认 RLS**: 确保策略允许读写
4. **提供日志**: 将控制台日志和错误信息截图

**我将根据你的诊断结果提供精准修复方案。**

---

**注意**: 该指南适用于当前版本（commit 9b58015）。如果代码有更新，请先拉取最新版本。
