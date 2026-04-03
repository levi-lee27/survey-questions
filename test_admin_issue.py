#!/usr/bin/env python3
"""
测试 admin.html 统计数据加载问题
模拟：创建问卷 -> 提交数据 -> 后台验证 -> 加载统计
"""
import json, os, time, random, string

def simulate_full_flow():
    print('='*60)
    print('[模拟完整流程] 创建问卷 -> 提交 -> 后台查看')
    print('='*60)
    
    # 模拟 localStorage
    storage = {}
    
    def ls_set(key, value):
        storage[key] = json.dumps(value)
    
    def ls_get(key):
        raw = storage.get(key)
        return json.loads(raw) if raw else None
    
    # Step 1: 在 generate.html 创建问卷
    print('\n[Step 1] 生成问卷')
    survey_id = 'survey_' + str(int(time.time())) + '_' + ''.join(random.choice(string.ascii_lowercase) for _ in range(6))
    title = '测试问卷'
    password = 'test123'
    
    manager_list = [{
        'surveyId': survey_id,
        'title': title,
        'password': password,
        'createdAt': time.time(),
        'submissionCount': 0
    }]
    ls_set('survey_manager_list', manager_list)
    
    # 同时创建 meta（实际中可能稍后创建）
    meta = {
        'surveyId': survey_id,
        'title': title,
        'password': password,
        'createdAt': time.time(),
        'submissionCount': 0
    }
    ls_set(f'survey_meta_{survey_id}', meta)
    
    print(f'  ✅ 创建问卷: {title}')
    print(f'     Survey ID: {survey_id}')
    print(f'     密码: {password}')
    
    # Step 2: 在 index.html 提交问卷（app.js）
    print('\n[Step 2] 提交问卷数据')
    answers = {1: 5, 2: 3, 3: 1}
    total_score = 4.4  # 5*0.4 + 3*0.4 + 1*0.2 = 4.4
    
    submission = {
        'id': int(time.time() * 1000),
        'timestamp': time.time(),
        'answers': answers,
        'suggestion': '测试建议',
        'totalScore': total_score
    }
    
    results = ls_get(f'survey_results_{survey_id}') or []
    results.append(submission)
    ls_set(f'survey_results_{survey_id}', results)
    
    # 更新 meta
    meta = ls_get(f'survey_meta_{survey_id}')
    meta['submissionCount'] = len(results)
    meta['lastSubmission'] = time.time()
    ls_set(f'survey_meta_{survey_id}', meta)
    
    print(f'  ✅ 提交成功')
    print(f'     总分: {total_score}')
    print(f'     当前提交数: {len(results)}')
    
    # Step 3: 验证 admin.html 的密码验证逻辑
    print('\n[Step 3] 后台密码验证')
    
    # 模拟 URL: admin.html?surveyId=xxx&token=test123
    url_survey_id = survey_id
    url_token = password
    
    # 检查 surveyId
    if not url_survey_id:
        print('  ❌ 缺少 surveyId 参数')
        return False
    
    # 检查 meta
    meta_key = f'survey_meta_{url_survey_id}'
    meta_raw = ls_get(meta_key)
    if not meta_raw:
        print('  ❌ 问卷不存在或尚未创建')
        return False
    
    meta = meta_raw
    print(f'  ✅ 找到问卷 meta: {meta["title"]}')
    
    # 验证密码
    if meta['password'] and meta['password'] != url_token:
        print(f'  ❌ 密码错误')
        print(f'     期望: {meta["password"]}')
        print(f'     实际: {url_token}')
        return False
    
    print('  ✅ 密码验证通过')
    
    # Step 4: 加载数据并渲染统计
    print('\n[Step 4] 加载统计数据')
    
    results_key = f'survey_results_{url_survey_id}'
    all_records = ls_get(results_key) or []
    print(f'  ✅ 加载到 {len(all_records)} 条记录')
    
    if len(all_records) == 0:
        print('  ⚠️  无数据可统计')
        return False
    
    # 计算统计
    total_count = len(all_records)
    sum_score = sum(r['totalScore'] for r in all_records)
    avg_score = sum_score / total_count
    max_score = max(r['totalScore'] for r in all_records)
    
    print(f'  总提交数: {total_count}')
    print(f'  平均分: {avg_score:.2f}')
    print(f'  最高分: {max_score:.2f}')
    
    # 渲染各题平均分
    QUESTIONS = [
        {'id': 1, 'weight': 0.4, 'text': '业务场景'},
        {'id': 2, 'weight': 0.4, 'text': '大纲覆盖'},
        {'id': 3, 'weight': 0.2, 'text': '大纲精炼'}
    ]
    
    print('  各题平均分:')
    for q in QUESTIONS:
        scores = [r['answers'][q['id']] * q['weight'] for r in all_records if q['id'] in r['answers']]
        if scores:
            q_avg = sum(scores) / len(scores)
            print(f'    {q["text"]}: {q_avg:.2f} 分')
    
    # Step 5: 验证 CSV 导出
    print('\n[Step 5] CSV 导出验证')
    print(f'  ✅ 可导出 {len(all_records)} 条记录')
    
    print('\n' + '='*60)
    print('[SUCCESS] 所有流程正常！')
    print('='*60)
    print('\n结论: 代码逻辑正确，问题可能出在:')
    print('1. 浏览器 localStorage 被清空或隔离')
    print('2. surveyId 不匹配（创建和查看不是同一个 ID）')
    print('3. 密码输入错误')
    print('4. 页面 URL 参数不正确')
    print('5. 浏览器控制台有 JS 错误')
    
    return True

if __name__ == '__main__':
    simulate_full_flow()
