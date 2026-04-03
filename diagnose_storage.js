// 诊断 localStorage 状态
console.log('LocalStorage Diagnostics');
console.log('=======================');
console.log('Origin:', window.location.origin);
console.log('Path:', window.location.pathname);

// 列出所有 survey 相关的键
const keys = Object.keys(localStorage).filter(k => k.startsWith('survey_') || k.includes('survey'));
console.log('\nSurvey-related keys:');
keys.forEach(k => {
  try {
    const val = localStorage.getItem(k);
    const type = val.startsWith('{') ? 'object' : 'string/number';
    const size = val.length > 50 ? val.substring(0, 50) + '...' : val;
    console.log(`  ${k} (${type}): ${size}`);
  } catch(e) {
    console.log(`  ${k}: (error reading)`);
  }
});

// 检查 meta
const manager = localStorage.getItem('survey_manager_list');
if (manager) {
  const surveys = JSON.parse(manager);
  console.log(`\nManager list has ${surveys.length} surveys:`);
  surveys.forEach(s => {
    console.log(`  - ${s.surveyId}: ${s.title} (password: ${s.password ? '***' : 'none'})`);
  });
}

// 当前 URL 的 surveyId
const params = new URLSearchParams(window.location.search);
const surveyId = params.get('surveyId');
console.log(`\nCurrent surveyId from URL: ${surveyId || 'none'}`);

if (surveyId) {
  const metaKey = 'survey_meta_' + surveyId;
  const metaRaw = localStorage.getItem(metaKey);
  console.log(`Meta for ${surveyId}: ${metaRaw ? 'exists' : 'MISSING'}`);
  if (metaRaw) {
    const meta = JSON.parse(metaRaw);
    console.log('  Title:', meta.title);
    console.log('  Password:', meta.password || '(none)');
    console.log('  Submissions:', meta.submissionCount);
  }
}
