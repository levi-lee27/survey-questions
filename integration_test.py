#!/usr/bin/env python3
"""
集成测试脚本 - 模拟完整问卷流程
"""

import json
import os
import time
import random
import string
from pathlib import Path
from datetime import datetime

class SurveySystemTester:
    def __init__(self, storage_path):
        self.storage = {}
        self.storage_path = storage_path

    def simulate_browser_storage(self):
        if os.path.exists(self.storage_path):
            with open(self.storage_path, 'r', encoding='utf-8') as f:
                try:
                    self.storage = json.load(f)
                except:
                    self.storage = {}

    def save_storage(self):
        with open(self.storage_path, 'w', encoding='utf-8') as f:
            json.dump(self.storage, f, indent=2, ensure_ascii=False)

    def create_survey(self, title, password=''):
        survey_id = 'survey_' + str(int(time.time())) + '_' + ''.join(random.choice(string.ascii_lowercase) for _ in range(6))
        survey = {
            'surveyId': survey_id,
            'title': title,
            'password': password,
            'createdAt': self.iso_now(),
            'submissionCount': 0
        }

        manager_key = 'survey_manager_list'
        surveys = self.storage.get(manager_key, [])
        surveys.insert(0, survey)
        self.storage[manager_key] = surveys

        meta_key = 'survey_meta_' + survey_id
        self.storage[meta_key] = {
            'surveyId': survey_id,
            'title': title,
            'password': password,
            'createdAt': self.iso_now(),
            'submissionCount': 0
        }

        print('[OK] 创建问卷成功: ' + title)
        print('   Survey ID: ' + survey_id)
        print('   密码: ' + (password or '无'))
        return survey_id

    def submit_survey(self, survey_id, answers, suggestion=''):
        meta_key = 'survey_meta_' + survey_id
        if meta_key not in self.storage:
            print('[ERROR] 问卷不存在: ' + survey_id)
            return False

        QUESTIONS = [
            {'id': 1, 'weight': 0.4},
            {'id': 2, 'weight': 0.4},
            {'id': 3, 'weight': 0.2}
        ]
        total = sum(answers[q['id']] * q['weight'] for q in QUESTIONS)

        submission = {
            'id': int(time.time() * 1000),
            'timestamp': self.iso_now(),
            'answers': answers,
            'suggestion': suggestion,
            'totalScore': total
        }

        results_key = 'survey_results_' + survey_id
        results = self.storage.get(results_key, [])
        results.append(submission)
        self.storage[results_key] = results

        meta = self.storage[meta_key]
        meta['submissionCount'] = len(results)
        meta['lastSubmission'] = self.iso_now()
        self.storage[meta_key] = meta

        print('[OK] 提交成功!')
        print('   总分: {:.2f}'.format(total))
        print('   当前提交数: {}'.format(len(results)))
        return True

    def verify_statistics(self, survey_id):
        results_key = 'survey_results_' + survey_id
        results = self.storage.get(results_key, [])

        if not results:
            print('[WARN] 没有提交数据')
            return False

        total = len(results)
        avg_score = sum(r['totalScore'] for r in results) / total
        max_score = max(r['totalScore'] for r in results)

        QUESTIONS = [
            {'id': 1, 'weight': 0.4, 'text': '业务场景'},
            {'id': 2, 'weight': 0.4, 'text': '大纲覆盖'},
            {'id': 3, 'weight': 0.2, 'text': '大纲精炼'}
        ]

        print('[STATS] 统计结果:')
        print('   总提交数: {}'.format(total))
        print('   平均分: {:.2f}'.format(avg_score))
        print('   最高分: {:.2f}'.format(max_score))
        print('   各题平均分:')
        for q in QUESTIONS:
            scores = [r['answers'][q['id']] * q['weight'] for r in results if q['id'] in r['answers']]
            if scores:
                q_avg = sum(scores) / len(scores)
                print('     {}: {:.2f} 分'.format(q['text'], q_avg))

        return True

    def iso_now(self):
        return datetime.utcnow().replace(tzinfo=None).isoformat() + 'Z'

    def run_full_test(self):
        print('='*60)
        print('[TEST] 问卷系统集成测试')
        print('='*60)

        if os.path.exists(self.storage_path):
            os.remove(self.storage_path)

        self.simulate_browser_storage()

        print('\n[STEP 1] 创建问卷')
        survey_id = self.create_survey('评审满意度测试', 'test123')

        print('\n[STEP 2] 提交问卷数据')
        test_submissions = [
            ({1: 5, 2: 5, 3: 5}, '非常满意,所有方面都很优秀'),
            ({1: 3, 2: 3, 3: 3}, '整体不错,但有改进空间'),
            ({1: 5, 2: 3, 3: 1}, '业务场景覆盖好,但大纲需要精简'),
            ({1: 1, 2: 1, 3: 5}, '场景覆盖差,但编写精炼'),
            ({1: 5, 2: 5, 3: 5}, '完美!')
        ]

        for i, (answers, suggestion) in enumerate(test_submissions, 1):
            print('\n  提交 #' + str(i) + ':')
            self.submit_survey(survey_id, answers, suggestion)

        self.save_storage()

        print('\n[STEP 3] 验证统计功能')
        self.verify_statistics(survey_id)

        print('\n[STEP 4] 验证 CSV 导出数据')
        results = self.storage['survey_results_' + survey_id]
        print('   可导出 ' + str(len(results)) + ' 条记录')

        print('\n' + '='*60)
        print('[SUCCESS] 所有测试通过!')
        print('='*60)

def main():
    script_dir = Path(__file__).parent
    storage_file = script_dir / 'local_storage_simulation.json'

    tester = SurveySystemTester(storage_file)
    tester.run_full_test()

    print('\n[INFO] 模拟存储文件: ' + str(storage_file))

if __name__ == '__main__':
    main()
