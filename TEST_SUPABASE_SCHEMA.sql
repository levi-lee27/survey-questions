-- Supabase 表结构定义
-- 请确保在 Supabase Dashboard → SQL Editor 中执行

-- 1. surveys 表（问卷元数据）
CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,                    -- surveyId
  title TEXT NOT NULL,                    -- 问卷标题
  password TEXT DEFAULT '',               -- 访问密码（可选）
  created_at TIMESTAMPTZ DEFAULT NOW(),  -- 创建时间
  submission_count INTEGER DEFAULT 0,     -- 提交计数
  last_submission TIMESTAMPTZ NULL        -- 最后提交时间
);

-- 2. submissions 表（问卷提交记录）
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,                  -- 自增ID（本地用）
  survey_id TEXT NOT NULL,                -- 关联的 surveyId
  submission_id BIGINT NOT NULL,          -- 提交ID（时间戳）
  timestamp TIMESTAMPTZ NOT NULL,        -- 提交时间
  answers JSONB NOT NULL,                 -- 答案 {1:5, 2:3, 3:5}
  suggestion TEXT DEFAULT '',            -- 建议
  total_score DECIMAL(5,2) NOT NULL,      -- 总分
  UNIQUE(survey_id, submission_id)        -- 防止重复提交
);

-- 3. 索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_submissions_survey_id
  ON submissions(survey_id);
CREATE INDEX IF NOT EXISTS idx_submissions_timestamp
  ON submissions(timestamp DESC);

-- 4. Row Level Security 策略（开发模式：允许所有）
-- 注意：生产环境应启用更严格的策略！

-- 允许所有用户读取 surveys
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read on surveys" ON surveys
  FOR SELECT USING (true);
CREATE POLICY "Allow all insert on surveys" ON surveys
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on surveys" ON surveys
  FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on surveys" ON surveys
  FOR DELETE USING (true);

-- 允许所有用户读取 submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read on submissions" ON submissions
  FOR SELECT USING (true);
CREATE POLICY "Allow all insert on submissions" ON submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on submissions" ON submissions
  FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on submissions" ON submissions
  FOR DELETE USING (true);

-- 5. Realtime 订阅（启用变更推送）
ALTER PUBLICATION supabase_realtime ADD TABLE surveys;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;

COMMIT;

-- 验证语句：
-- SELECT * FROM surveys;
-- SELECT * FROM submissions;
-- \d surveys
-- \d submissions
