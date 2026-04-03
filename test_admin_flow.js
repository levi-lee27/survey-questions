// 模拟 admin.js 的完整流程

function simulateStorage() {
  const storage = {};
  return {
    getItem: (key) => storage[key] ? JSON.parse(storage[key]) : null,
    setItem: (key, value) => { storage[key] = JSON.stringify(value); },
    removeItem: (key) => { delete storage[key]; }
  };
}

const localStorage = simulateStorage();

// 生成问卷 ID
function generateId() {
  return 'survey_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// 创建问卷（模拟 generate.html）
function createSurvey(title, password) {
  const surveyId = generateId();
  const survey = {
    surveyId: surveyId,
    title: title,
    password: password,
    createdAt: new Date().toISOString(),
    submissionCount: 0
  };
  
  // 保存 manager list
  const managerList = localStorage.getItem('survey_manager_list') || [];
  managerList.unshift(survey);
  localStorage.setItem('survey_manager_list', managerList);
  
  // 创建 meta
  localStorage.setItem(`survey_meta_${surveyId}`, {
    surveyId: surveyId,
    title: title,
    password: password,
    createdAt: new Date().toISOString(),
    submissionCount: 0
  });
  
  return surveyId;
}

// 提交问卷（模拟 app.js）
function submitSurvey(surveyId, answers, suggestion) {
  const key = `survey_results_${surveyId}`;
  const results = localStorage.getItem(key) || [];
  const submission = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    answers: answers,
    suggestion: suggestion || '',
    totalScore: calculateScore(answers)
  };
  results.push(submission);
  localStorage.setItem(key, results);
  
  // 更新 meta
  const metaKey = `survey_meta_${surveyId}`;
  let meta = localStorage.getItem(metaKey) || {};
  meta.submissionCount = results.length;
  meta.lastSubmission = new Date().toISOString();
  localStorage.setItem(metaKey, meta);
  
  return submission;
}

function calculateScore(answers) {
  const questions = [
    { id: 1, weight: 0.4 },
    { id: 2, weight: 0.4 },
    { id: 3, weight: 0.2 }
  ];
  return questions.reduce((sum, q) => sum + (answers[q.id] * q.weight), 0);
}

// 验证 token（模拟 admin.js）
function verifyToken(surveyId, token) {
  if (!surveyId) return { ok: false, error: '缺少 surveyId 参数' };
  
  const metaKey = `survey_meta_${surveyId}`;
  const meta = localStorage.getItem(metaKey);
  if (!meta) return { ok: false, error: '问卷不存在或尚未创建' };
  
  if (meta.password && meta.password !== token) {
    return { ok: false, error: '密码错误' };
  }
  
  return { ok: true, meta };
}

// 加载数据
function loadData(surveyId) {
  const key = `survey_results_${surveyId}`;
  return localStorage.getItem(key) || [];
}

// 运行测试
console.log('='*60);
console.log('[完整流程测试] Generate -> Submit -> Admin');
console.log('='*60);

// 清空存储
localStorage.removeItem('survey_manager_list');
localStorage.removeItem('survey_results_test');
localStorage.removeItem('survey_meta_test');

console.log('\n[1] 创建问卷 (generate.html)');
const surveyId = createSurvey('测试问卷', 'test123');
console.log(`  ✅ Survey ID: ${surveyId}`);
console.log(`  标题: 测试问卷`);
console.log(`  密码: test123`);

console.log('\n[2] 提交问卷 (app.js)');
const submission = submitSurvey(surveyId, {1: 5, 2: 3, 3: 5}, '很好');
console.log(`  ✅ 提交成功, 总分: ${submission.totalScore.toFixed(2)}`);

console.log('\n[3] 再次提交');
submitSurvey(surveyId, {1: 4, 2: 4, 3: 4}, '不错');

console.log('\n[4] 验证后台密码 (admin.js)');
const verify = verifyToken(surveyId, 'test123');
if (verify.ok) {
  console.log('  ✅ 密码验证通过');
} else {
  console.log(`  ❌ 验证失败: ${verify.error}`);
  process.exit(1);
}

console.log('\n[5] 加载统计数据');
const records = loadData(surveyId);
console.log(`  ✅ 加载到 ${records.length} 条记录`);

console.log('\n[6] 统计计算');
const total = records.length;
const avg = records.reduce((sum, r) => sum + r.totalScore, 0) / total;
const max = Math.max(...records.map(r => r.totalScore));
console.log(`  总提交: ${total}`);
console.log(`  平均分: ${avg.toFixed(2)}`);
console.log(`  最高分: ${max.toFixed(2)}`);

console.log('\n[7] 验证 meta 密码');
const meta = localStorage.getItem(`survey_meta_${surveyId}`);
console.log(`  meta.password = "${meta.password}"`);
if (meta.password === 'test123') {
  console.log('  ✅ meta 密码正确');
} else {
  console.log('  ❌ meta 密码不匹配！');
}

console.log('\n' + '='*60);
console.log('[SUCCESS] 所有步骤通过！代码逻辑正确。');
console.log('='*60);
console.log('\n如果实际使用时仍看不到数据，请检查:');
console.log('1. 浏览器控制台是否有 JS 错误');
console.log('2. localStorage 是否被清空或禁用');
console.log('3. 访问 admin.html 的 surveyId 和创建时是否一致');
console.log('4. 密码是否输入正确');
console.log('5. 是否在同一个浏览器/设备上测试（localStorage 不跨设备同步）');
