// 模拟跨设备场景：电脑创建 → 手机提交 → 电脑查看

console.log('='*60);
console.log('[跨设备场景测试]');
console.log('='*60);

// 模拟 localStorage
class LocalStorage {
  constructor() {
    this.store = {}
  }
  getItem(key) {
    return this.store[key] || null
  }
  setItem(key, value) {
    this.store[key] = value
  }
}

// ========== 设备 1：生成问卷（电脑）= ==========
console.log('\n[设备1 - 电脑] 执行 generate.html');
const localStorage_pc = new LocalStorage();

function generateId() {
  return 'survey_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function saveSurveyList(surveys) {
  localStorage_pc.setItem('survey_manager_list', JSON.stringify(surveys));
}

// 创建问卷（模拟 createSurvey）
const surveyId = generateId();
const title = '测试问卷';
const password = 'test123';

// 保存到 manager_list
const survey = {
  surveyId: surveyId,
  title: title,
  password: password,
  createdAt: new Date().toISOString(),
  submissionCount: 0
};
const surveys = [survey];
saveSurveyList(surveys);

// 【修复后】同时创建 meta
const metaKey = 'survey_meta_' + surveyId;
const meta = {
  surveyId: surveyId,
  title: title,
  password: password,
  createdAt: new Date().toISOString(),
  submissionCount: 0
};
localStorage_pc.setItem(metaKey, JSON.stringify(meta));

console.log(`  创建问卷: ${title}`);
console.log(`  Survey ID: ${surveyId}`);
console.log(`  Meta created: ${localStorage_pc.getItem(metaKey) ? '✅' : '❌'}`);

// ========== 设备 2：手机提交问卷 = ==========
console.log('\n[设备2 - 手机] 执行 app.js 提交');
const localStorage_phone = new LocalStorage();

// 手机保存问卷结果（submitSurvey）
const resultsKey = 'survey_results_' + surveyId;
const submission = {
  id: Date.now(),
  timestamp: new Date().toISOString(),
  answers: { 1: 5, 2: 3, 3: 1 },
  suggestion: '很好',
  totalScore: 4.2
};
localStorage_phone.setItem(resultsKey, JSON.stringify([submission]));

console.log(`  ✅ 手机提交成功 (surveyId: ${surveyId})`);
console.log(`  手机 localStorage 中的 meta: ${localStorage_phone.getItem(metaKey) || '不存在'}`);

// ========== 设备 3：电脑查看 admin = ==========
console.log('\n[设备3 - 电脑] 访问 admin.html (使用电脑 localStorage)');

// admin.js 的 verifyToken 逻辑
function verifyToken(surveyId, token, localStorage) {
  if (!surveyId) {
    return { ok: false, error: '缺少 surveyId 参数' };
  }

  const metaKey = 'survey_meta_' + surveyId;
  const metaRaw = localStorage.getItem(metaKey);
  if (!metaRaw) {
    return { ok: false, error: '问卷不存在或尚未创建' };
  }

  const meta = JSON.parse(metaRaw);

  if (!meta.password) {
    return { ok: true, meta, needsPassword: false };
  }

  if (!token) {
    return { ok: false, error: '请输入管理员密码' };
  }

  if (meta.password !== token) {
    return { ok: false, error: '密码错误' };
  }

  return { ok: true, meta, needsPassword: true };
}

// 场景 A：电脑尝试访问 admin（meta 在电脑上已存在）
console.log('\n场景 A: 电脑 admin (meta 已预创建)');
let result = verifyToken(surveyId, 'test123', localStorage_pc);
console.log(`  Result: ${result.ok ? '✅ 成功进入' : '❌ ' + result.error}`);

// 场景 B：如果电脑 meta 不存在（旧版本没有创建 meta）
console.log('\n场景 B: 电脑 admin (meta 不存在 - 假设旧版本)');
localStorage_pc.store[metaKey] = null; // 删除 meta
result = verifyToken(surveyId, 'test123', localStorage_pc);
console.log(`  Result: ${result.ok ? '✅ 成功进入' : '❌ ' + result.error}`);

// 检查原因
if (!result.ok) {
  const metaFromPhone = localStorage_phone.getItem(metaKey);
  console.log(`  手机有 meta? ${metaFromPhone ? '✅' : '❌'}`);
  console.log('  问题: 设备间 localStorage 不共享');
}

console.log('\n' + '='*60);
console.log('[结论]');
console.log('='*60);
console.log('✅ 如果 generate.html 创建了 meta，则电脑可直接访问 admin');
console.log('❌ 如果 meta 只在手机存在，电脑无法访问（设备隔离）');
console.log('💡 用户必须在同一设备/浏览器完成创建和查看，或使用后端存储');
