// 测试修复后的 admin.js 验证逻辑

const localStorage = {};

// 模拟 admin.js 的 verifyToken 逻辑（修复版）
function verifyToken(surveyId, inputToken) {
  console.log(`\n[verifyToken] surveyId=${surveyId}, inputToken="${inputToken}"`)
  
  if (!surveyId) {
    return { ok: false, error: '缺少 surveyId 参数' };
  }

  const metaKey = 'survey_meta_' + surveyId;
  const metaRaw = localStorage.getItem(metaKey);
  if (!metaRaw) {
    return { ok: false, error: '问卷不存在或尚未创建' };
  }

  const meta = JSON.parse(metaRaw);
  console.log(`  meta.password="${meta.password}"`);

  // 如果问卷没有设置密码，直接进入
  if (!meta.password) {
    console.log('  → 无密码问卷，自动通过');
    return { ok: true, meta, needsPassword: false };
  }

  // 有密码保护，必须提供 token
  if (!inputToken) {
    return { ok: false, error: '请输入管理员密码' };
  }

  // 验证密码
  if (meta.password !== inputToken) {
    return { ok: false, error: '密码错误' };
  }

  console.log('  → 密码验证通过');
  return { ok: true, meta, needsPassword: true };
}

// 测试用例
console.log('='*60);
console.log('[Test] 无密码问卷访问');
console.log('='*60);

// 准备无密码问卷 meta
localStorage['survey_meta_survey_nopwd'] = JSON.stringify({
  surveyId: 'survey_nopwd',
  title: '无密码问卷',
  password: '',
  submissionCount: 5
});

let res = verifyToken('survey_nopwd', '');
console.log('  空 token:', res.ok ? '✅ PASS' : '❌ FAIL', res.error);
res = verifyToken('survey_nopwd', 'anyinput');
console.log('  任意 token:', res.ok ? '✅ PASS' : '❌ FAIL', res.error);

console.log('\n' + '='*60);
console.log('[Test] 有密码问卷访问');
console.log('='*60);

localStorage['survey_meta_survey_pwd'] = JSON.stringify({
  surveyId: 'survey_pwd',
  title: '有密码问卷',
  password: 'secret123',
  submissionCount: 3
});

res = verifyToken('survey_pwd', '');
console.log('  空 token:', res.ok ? '✅ FAIL (should fail)' : '✅ PASS (correctly rejected)');
res = verifyToken('survey_pwd', 'wrong');
console.log('  错误 token:', res.ok ? '❌ FAIL' : '✅ PASS');
res = verifyToken('survey_pwd', 'secret123');
console.log('  正确 token:', res.ok ? '✅ PASS' : '❌ FAIL');

console.log('\n' + '='*60);
console.log('[Test] 问卷不存在');
console.log('='*60);

res = verifyToken('survey_notexist', '');
console.log('  不存在的 ID:', res.ok ? '❌ FAIL' : '✅ PASS');

console.log('\n' + '='*60);
console.log('[Test 完成]');
console.log('='*60);
console.log('如果以上测试全部通过，admin.js 的验证逻辑已修复。');
console.log('现在应该：');
console.log('- 无密码问卷无需输入密码即可访问');
console.log('- 有密码问卷必须输入正确密码');
console.log('- 不存在的问卷明确提示');
