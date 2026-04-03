// 测试 meta 密码同步逻辑

const localStorage = {};

// 模拟 app.js 的 saveSurvey 函数（简化版）
function saveSurvey(surveyId, title, passwordFromManager, answers, suggestion) {
  const resultsKey = 'survey_results_' + surveyId
  const metaKey = 'survey_meta_' + surveyId
  
  // 加载或创建 meta
  let meta = localStorage[metaKey] ? JSON.parse(localStorage[metaKey]) : {
    surveyId: surveyId,
    title: title,
    password: '',
    createdAt: new Date().toISOString(),
    submissionCount: 0
  }
  
  // 如果密码为空，尝试从 survey_manager_list 获取
  if (!meta.password) {
    const managerList = localStorage['survey_manager_list'] ? JSON.parse(localStorage['survey_manager_list']) : []
    const survey = managerList.find(s => s.surveyId === surveyId)
    if (survey && survey.password) {
      meta.password = survey.password
      console.log(`  [SYNC] Password synced from manager_list: "${survey.password}"`)
    } else {
      console.log(`  [SYNC] No password found in manager_list (survey.password = ${survey ? survey.password : 'N/A'})`)
    }
  }
  
  // 保存提交数据
  const results = localStorage[resultsKey] ? JSON.parse(localStorage[resultsKey]) : []
  results.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    answers: answers,
    suggestion: suggestion || '',
    totalScore: calculateScore(answers)
  })
  localStorage[resultsKey] = JSON.stringify(results)
  
  // 更新 meta
  meta.submissionCount = results.length
  meta.lastSubmission = new Date().toISOString()
  localStorage[metaKey] = JSON.stringify(meta)
  
  return { meta, results }
}

function calculateScore(answers) {
  const questions = [
    { id: 1, weight: 0.4 },
    { id: 2, weight: 0.4 },
    { id: 3, weight: 0.2 }
  ]
  return questions.reduce((sum, q) => sum + (answers[q.id] * q.weight), 0)
}

// 测试用例 1: 有密码的问卷
console.log('='*60)
console.log('[Test 1] 问卷有密码')
console.log('='*60)

localStorage['survey_manager_list'] = JSON.stringify([
  {
    surveyId: 'survey_test1',
    title: '有密码问卷',
    password: 'secret123',
    createdAt: new Date().toISOString(),
    submissionCount: 0
  }
])

const result1 = saveSurvey('survey_test1', '有密码问卷', 'secret123', {1:5,2:5,3:5}, '测试')
console.log('  Meta password:', result1.meta.password)
console.log('  Submission count:', result1.meta.submissionCount)
console.log('  Results count:', result1.results.length)

if (result1.meta.password === 'secret123') {
  console.log('  ✅ Password correctly synced')
} else {
  console.log('  ❌ Password sync FAILED')
}

// 测试用例 2: 无密码的问卷
console.log('\n' + '='*60)
console.log('[Test 2] 问卷无密码')
console.log('='*60)

localStorage['survey_manager_list'] = JSON.stringify([
  {
    surveyId: 'survey_test2',
    title: '无密码问卷',
    password: '',
    createdAt: new Date().toISOString(),
    submissionCount: 0
  }
])

const result2 = saveSurvey('survey_test2', '无密码问卷', '', {1:3,2:3,3:3}, '无密码测试')
console.log('  Meta password:', result2.meta.password)
console.log('  Submission count:', result2.meta.submissionCount)

if (result2.meta.password === '') {
  console.log('  ✅ Meta password correctly empty')
} else {
  console.log('  ❌ Meta password should be empty but got:', result2.meta.password)
}

// 测试用例 3: 再次提交，检查密码是否保持不变
console.log('\n' + '='*60)
console.log('[Test 3] 再次提交（密码保持不变）')
console.log('='*60)

const result3 = saveSurvey('survey_test1', '有密码问卷', 'secret123', {1:4,2:4,3:4}, '第二次')
console.log('  Meta password after 2nd submit:', result3.meta.password)
console.log('  Submission count:', result3.meta.submissionCount)

if (result3.meta.password === 'secret123') {
  console.log('  ✅ Password preserved')
} else {
  console.log('  ❌ Password changed or lost')
}

console.log('\n' + '='*60)
console.log('[SUMMARY]')
console.log('='*60)
console.log('If all tests passed, meta password sync logic is correct.')
console.log('If admin.html still cannot show data, check:')
console.log('1. Are you accessing admin.html with the correct surveyId?')
console.log('2. Is the password correct?')
console.log('3. Is localStorage from the same origin?')
console.log('4. Did you actually submit any responses?')
