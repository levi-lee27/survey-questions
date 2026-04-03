#!/usr/bin/env python3
import json
import time
import random
import string
from pathlib import Path

# 配置
survey_title = "评审满意度调查"
password = "123456"
survey_id = 'survey_' + str(int(time.time())) + '_' + ''.join(random.choice(string.ascii_lowercase) for _ in range(6))

# 初始化存储
storage = {}
storage_file = Path("local_storage.json")

# 加载现有数据（如果存在）
if storage_file.exists():
    with open(storage_file, 'r', encoding='utf-8') as f:
        try:
            storage = json.load(f)
        except:
            storage = {}

# 创建问卷（模拟 generate.html）
print("Creating survey...")
print(f"Title: {survey_title}")
print(f"Survey ID: {survey_id}")
print(f"Password: {password}")

# 保存 manager list
manager_key = 'survey_manager_list'
storage[manager_key] = [{
    'surveyId': survey_id,
    'title': survey_title,
    'password': password,
    'createdAt': time.time(),
    'submissionCount': 0
}]

# 创建 meta（关键！）
meta_key = f'survey_meta_{survey_id}'
storage[meta_key] = {
    'surveyId': survey_id,
    'title': survey_title,
    'password': password,
    'createdAt': time.time(),
    'submissionCount': 0
}

# 模拟提交5条问卷数据（模拟 app.js 的 saveSurvey）
print("\nSubmitting responses...")
results_key = f'survey_results_{survey_id}'
results = []

submissions = [
    ({1: 5, 2: 4, 3: 5}, "非常满意，各项都很优秀"),
    ({1: 4, 2: 5, 3: 4}, "整体不错，继续保持"),
    ({1: 3, 2: 3, 3: 3}, "一般水平，有待提升"),
    ({1: 5, 2: 3, 3: 2}, "业务场景覆盖好，但大纲需要精简"),
    ({1: 2, 2: 2, 3: 4}, "场景覆盖不足，但编写精炼")
]

for answers, suggestion in submissions:
    total = answers[1]*0.4 + answers[2]*0.4 + answers[3]*0.2
    results.append({
        'id': int(time.time() * 1000),
        'timestamp': time.time(),
        'answers': answers,
        'suggestion': suggestion,
        'totalScore': round(total, 2)
    })

storage[results_key] = results

# 更新 meta
meta = storage[meta_key]
meta['submissionCount'] = len(results)
meta['lastSubmission'] = time.time()
storage[meta_key] = meta

# 保存到文件
with open(storage_file, 'w', encoding='utf-8') as f:
    json.dump(storage, f, indent=2, ensure_ascii=False)

print(f"Saved {len(results)} submissions")

# 生成统计报告
print("\n" + "="*60)
print("STATISTICS")
print("="*60)

total = len(results)
avg = sum(r['totalScore'] for r in results) / total
max_score = max(r['totalScore'] for r in results)

print(f"Total submissions: {total}")
print(f"Average score: {avg:.2f}")
print(f"Max score: {max_score:.2f}")

questions = [
    (1, "业务场景覆盖完整全面", 0.4),
    (2, "大纲覆盖需求规则逻辑、账务全面准确", 0.4),
    (3, "大纲编写不冗余，描述精炼、准确", 0.2)
]

print("\nQuestion averages:")
for qid, text, weight in questions:
    scores = [r['answers'][qid] * weight for r in results if qid in r['answers']]
    if scores:
        q_avg = sum(scores) / len(scores)
        print(f"  Q{qid} ({text[:20]}...): {q_avg:.2f} points")

# 生成链接
deploy_url = "https://levi-lee27.github.io/survey-questions/"
survey_url = f"{deploy_url}index.html?surveyId={survey_id}&title={survey_title}"
admin_url = f"{deploy_url}admin.html?surveyId={survey_id}"

print("\n" + "="*60)
print("ACCESS LINKS")
print("="*60)
print(f"Survey URL: {survey_url}")
print(f"Admin URL:  {admin_url}")
print("\nNOTE: To view stats in browser, you need to:")
print("1. Copy the above admin URL")
print("2. Open in browser")
print("3. Since we're using simulated storage, you'll need to run the demo on the same origin")
print("\nFor local testing, use: http://localhost:8080/admin.html?surveyId=" + survey_id)
print("Storage file:", storage_file)
