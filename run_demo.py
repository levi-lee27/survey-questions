#!/usr/bin/env python3
"""
完整演示：创建问卷 -> 填写提交 -> 查看统计
"""
import json
import os
import time
import random
import string
from pathlib import Path

def main():
    print("="*70)
    print("问卷系统完整演示")
    print("="*70)
    
    # 配置
    survey_title = "评审满意度调查"  # 保持不变
    password = "123456"
    deploy_url = "https://levi-lee27.github.io/survey-questions/"
    
    # 模拟 localStorage（数据存储在文件中）
    storage_file = Path("demo_storage.json")
    storage = {}
    
    if storage_file.exists():
        with open(storage_file, 'r', encoding='utf-8') as f:
            try:
                storage = json.load(f)
            except:
                storage = {}
    
    # 生成唯一问卷 ID
    survey_id = 'survey_' + str(int(time.time())) + '_' + ''.join(random.choice(string.ascii_lowercase) for _ in range(6))
    
    print(f"\n📋 步骤 1: 创建问卷")
    print(f"   标题: {survey_title}")
    print(f"   密码: {password}")
    print(f"   部署地址: {deploy_url}")
    print(f"   Survey ID: {survey_id}")
    
    # 保存到问卷管理器
    manager_key = 'survey_manager_list'
    surveys = storage.get(manager_key, [])
    surveys.insert(0, {
        'surveyId': survey_id,
        'title': survey_title,
        'password': password,
        'createdAt': time.time(),
        'submissionCount': 0
    })
    storage[manager_key] = surveys
    
    # 【关键】同时创建 meta 数据（确保 admin 可访问）
    meta_key = f'survey_meta_{survey_id}'
    storage[meta_key] = {
        'surveyId': survey_id,
        'title': survey_title,
        'password': password,
        'createdAt': time.time(),
        'submissionCount': 0
    }
    
    print("   ✅ 问卷已创建")
    
    # 生成链接
    survey_url = f"{deploy_url}index.html?surveyId={survey_id}&title={survey_title}"
    admin_url = f"{deploy_url}admin.html?surveyId={survey_id}"
    
    print(f"\n🔗 步骤 2: 生成的链接")
    print(f"   问卷链接: {survey_url}")
    print(f"   后台链接: {admin_url}")
    
    # 模拟用户填写问卷（提交多条数据）
    print(f"\n✍️  步骤 3: 模拟用户填写问卷")
    
    test_submissions = [
        ({1: 5, 2: 4, 3: 5}, "非常满意，各项都很优秀"),
        ({1: 4, 2: 5, 3: 4}, "整体不错，继续保持"),
        ({1: 3, 2: 3, 3: 3}, "一般水平，有待提升"),
        ({1: 5, 2: 3, 3: 2}, "业务场景覆盖好，但大纲需要精简"),
        ({1: 2, 2: 2, 3: 4}, "场景覆盖不足，但编写精炼")
    ]
    
    for i, (answers, suggestion) in enumerate(test_submissions, 1):
        # 计算加权分数
        total = answers[1]*0.4 + answers[2]*0.4 + answers[3]*0.2
        
        # 保存提交记录
        results_key = f'survey_results_{survey_id}'
        results = storage.get(results_key, [])
        results.append({
            'id': int(time.time() * 1000) + i,
            'timestamp': time.time(),
            'answers': answers,
            'suggestion': suggestion,
            'totalScore': round(total, 2)
        })
        storage[results_key] = results
        
        # 更新 meta 统计
        meta = storage[meta_key]
        meta['submissionCount'] = len(results)
        meta['lastSubmission'] = time.time()
        storage[meta_key] = meta
        
        print(f"   提交 #{i}: Q1={answers[1]}, Q2={answers[2]}, Q3={answers[3]} → 总分={total:.2f}")
    
    # 保存到文件
    with open(storage_file, 'w', encoding='utf-8') as f:
        json.dump(storage, f, indent=2, ensure_ascii=False)
    
    print(f"   ✅ 共提交 {len(test_submissions)} 条记录")
    
    # 计算统计
    print(f"\n📊 步骤 4: 统计结果")
    results = storage[results_key]
    total_count = len(results)
    avg_score = sum(r['totalScore'] for r in results) / total_count
    max_score = max(r['totalScore'] for r in results)
    
    print(f"   总提交数: {total_count}")
    print(f"   平均分: {avg_score:.2f}")
    print(f"   最高分: {max_score:.2f}")
    
    # 各题平均分
    questions = [
        {'id': 1, 'text': '业务场景覆盖', 'weight': 0.4},
        {'id': 2, 'text': '大纲覆盖需求规则', 'weight': 0.4},
        {'id': 3, 'text': '大纲编写精炼', 'weight': 0.2}
    ]
    
    print(f"\n📈 各题平均分:")
    for q in questions:
        scores = [r['answers'][q['id']] * q['weight'] for r in results if q['id'] in r['answers']]
        if scores:
            q_avg = sum(scores) / len(scores)
            bar = '█' * int(q_avg * 10)
            print(f"   {q['text']:15} {q_avg:5.2f} 分 {bar}")
    
    # 提交记录列表
    print(f"\n📜 提交记录 (前3条):")
    for i, r in enumerate(results[:3], 1):
        print(f"   #{i}: ID={r['id']}, 总分={r['totalScore']:.2f}, 建议=\"{r['suggestion']}\"")
    
    if len(results) > 3:
        print(f"   ... 还有 {len(results)-3} 条记录")
    
    # 检查 admin 访问
    print(f"\n🔍 步骤 5: 验证后台访问")
    meta_check = storage.get(meta_key)
    if meta_check:
        print(f"   ✅ meta 数据存在: {meta_check['title']}")
        print(f"      密码: {meta_check['password']}")
        print(f"      提交数: {meta_check['submissionCount']}")
    else:
        print(f"   ❌ meta 数据不存在")
    
    # Final summary
    print(f"\n{'='*70}")
    print("✅ 演示完成！")
    print(f"{'='*70}")
    print(f"\n📋 后台统计链接（直接访问，无需密码）:")
    print(f"   {admin_url}")
    print(f"\n⚠️  重要提示:")
    print(f"   1. 这是在模拟数据环境中生成的链接")
    print(f"   2. 实际访问时，请确保在同一浏览器中打开，才能看到上述统计数据")
    print(f"   3. localStorage 数据已保存到: {storage_file}")
    print(f"   4. 如果要重置，删除 {storage_file} 即可")
    
    # 提示用户如何查看
    print(f"\n🌐 请在浏览器中打开:")
    print(f"   1. 问卷填写: {survey_url}")
    print(f"   2. 后台统计: {admin_url}")
    print(f"\n或者启动本地服务器:")
    print(f"   cd C:/Users/levi_/openclaw/survey-web")
    print(f"   python -m http.server 8080")
    print(f"   然后访问: http://localhost:8080/generate.html")
    
    return {
        'survey_id': survey_id,
        'survey_url': survey_url,
        'admin_url': admin_url,
        'storage_file': str(storage_file)
    }

if __name__ == '__main__':
    result = main()
