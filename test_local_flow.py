#!/usr/bin/env python3
"""本地测试问卷流程"""
import json, os, time, subprocess, sys

storage_file = 'local_storage.json'

# 清理之前的测试数据
if os.path.exists(storage_file):
    os.remove(storage_file)
    print("[清空] 旧的本地存储")

print("\n=== 本地测试流程 ===\n")

# 模拟创建问卷
print("1. 模拟创建问卷")
survey_id = "survey_1775208475_test"
manager_data = [{
    "surveyId": survey_id,
    "title": "评审满意度调查测试",
    "password": "",
    "createdAt": "2025-04-03T00:00:00.000Z",
    "submissionCount": 0
}]
with open(storage_file, 'w', encoding='utf-8') as f:
    json.dump({"survey_manager_list": manager_data}, f, indent=2)
print(f"   问卷 ID: {survey_id}")

# 模拟提交
print("\n2. 模拟用户提交问卷")
answers = {1: 5, 2: 5, 3: 5}
total = answers[1]*0.4 + answers[2]*0.4 + answers[3]*0.2
submission = {
    "id": int(time.time()*1000),
    "timestamp": "2025-04-03T00:00:00.000Z",
    "answers": answers,
    "suggestion": "测试提交",
    "totalScore": total
}
data = {f"survey_results_{survey_id}": [submission], f"survey_meta_{survey_id}": {
    "surveyId": survey_id, "title": "评审满意度调查测试", "password": "",
    "createdAt": "2025-04-03T00:00:00.000Z", "submissionCount": 1, "lastSubmission": "2025-04-03T00:00:00.000Z"
}}
with open(storage_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print(f"   提交总分: {total:.2f}")

# 生成访问链接
base_url = "https://levi-lee27.github.io/survey-questions"
survey_url = f"{base_url}/index.html?surveyId={survey_id}&title=%E5%AE%A1%E6%89%B9%E6%BB%A1%E6%84%8F%E5%BA%A6%E8%B0%83%E6%9F%A5%E6%B5%8B%E8%AF%95"
admin_url = f"{base_url}/admin.html?surveyId={survey_id}"
print("\n3. 测试链接")
print(f"   问卷链接: {survey_url}")
print(f"   管理后台: {admin_url}")

print("\n✅ 本地测试完成！")
print(f"\n请手动访问上述链接在浏览器中验证功能。")
print(f"注意：GitHub Pages 部署后才能真正访问。")
