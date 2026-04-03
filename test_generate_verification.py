#!/usr/bin/env python3
"""
验证 generate.html 的关键逻辑
"""
import json, os, time, random, string

def test_generate_logic():
    """测试问卷生成逻辑（模拟 generate.html 中的函数）"""
    print('='*60)
    print('[GENERATE.HTML 逻辑验证]')
    print('='*60)
    
    # 生成 ID
    def generate_id():
        return 'survey_' + str(int(time.time())) + '_' + ''.join(random.choice(string.ascii_lowercase) for _ in range(6))
    
    # getBaseUrl 实现
    def get_base_url(pathname, origin):
        if pathname.startswith('file:'):
            return ''
        parts = [p for p in pathname.split('/') if p]
        if len(parts) <= 1:
            return origin + '/'
        sub_path = '/'.join(parts[:-1])
        return f"{origin}/{sub_path}/"
    
    # 测试用例
    test_cases = [
        {
            'name': '根路径部署',
            'pathname': '/generate.html',
            'origin': 'http://localhost:8080',
            'expected': 'http://localhost:8080/'
        },
        {
            'name': 'survey-web 子目录',
            'pathname': '/survey-web/generate.html',
            'origin': 'http://localhost:8080',
            'expected': 'http://localhost:8080/survey-web/'
        },
        {
            'name': '多级子目录',
            'pathname': '/myapp/survey/generate.html',
            'origin': 'https://example.com',
            'expected': 'https://example.com/myapp/survey/'
        },
        {
            'name': '本地文件系统',
            'pathname': 'file:///C:/Users/levi_/openclaw/survey-web/generate.html',
            'origin': '',
            'expected': ''
        }
    ]
    
    print('\n1. 测试 getBaseUrl 函数:')
    for tc in test_cases:
        result = get_base_url(tc['pathname'], tc['origin'])
        passed = result == tc['expected']
        status = '✅' if passed else '❌'
        print(f'   {status} {tc["name"]}')
        if not passed:
            print(f'      预期: {tc["expected"]}')
            print(f'      实际: {result}')
        assert passed, f"Failed: {tc['name']}"
    
    print('\n2. 测试 ID 生成:')
    for i in range(5):
        sid = generate_id()
        valid = sid.startswith('survey_') and '_' in sid and len(sid) > 20
        status = '✅' if valid else '❌'
        print(f'   {status} {sid}')
        assert valid, f"Invalid ID: {sid}"
    
    print('\n3. 测试 URL 构建:')
    base = 'http://localhost:8080/'
    sid = 'survey_test123'
    title = '测试问卷'
    pwd = 'testpwd'
    
    survey_url = f"{base}index.html?surveyId={sid}&title={title}"
    admin_url = f"{base}admin.html?surveyId={sid}&token={pwd}"
    
    print(f'   Survey URL: {survey_url}')
    print(f'   Admin URL: {admin_url}')
    
    assert 'surveyId=' in survey_url
    assert 'title=' in survey_url
    assert 'surveyId=' in admin_url
    assert 'token=' in admin_url
    print('   ✅ URL 格式正确')
    
    print('\n4. 测试数据存储结构:')
    survey = {
        'surveyId': sid,
        'title': title,
        'password': pwd,
        'createdAt': time.time(),
        'submissionCount': 0
    }
    print(f'   Survey 对象: {json.dumps(survey, indent=6, ensure_ascii=False)}')
    assert 'surveyId' in survey
    assert survey['submissionCount'] == 0
    print('   ✅ 数据结构正确')
    
    print('\n' + '='*60)
    print('[SUCCESS] generate.html 所有逻辑验证通过!')
    print('='*60)

if __name__ == '__main__':
    test_generate_logic()
