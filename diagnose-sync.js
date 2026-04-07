/**
 * 跨设备同步诊断脚本
 *
 * 在手机端填写问卷后，将此脚本复制到浏览器控制台
 * 检查数据是否成功写入 Supabase
 */

console.log('='.repeat(70));
console.log('🔍 跨设备同步诊断 - 手机端检查');
console.log('='.repeat(70));

// 1. 检查 Supabase 配置
console.log('\n[1] Supabase 配置检查');
if (typeof supabaseConfig !== 'undefined') {
  console.log('  ✅ supabaseConfig 存在');
  console.log('     URL:', supabaseConfig.url);
  console.log('     anonKey:', supabaseConfig.anonKey ? '已配置' : '未配置');
} else {
  console.log('  ❌ supabaseConfig 未定义');
}

if (typeof supabaseClient !== 'undefined' && supabaseClient) {
  console.log('  ✅ supabaseClient 已初始化');
} else {
  console.log('  ❌ supabaseClient 未初始化');
}

// 2. 获取当前 surveyId
console.log('\n[2] 当前问卷信息');
const urlParams = new URLSearchParams(window.location.search);
const surveyId = urlParams.get('surveyId');
if (surveyId) {
  console.log('  ✅ Survey ID:', surveyId);
} else {
  console.log('  ❌ 未找到 surveyId 参数');
  console.log('  提示: 确保通过问卷链接访问，URL 应包含 ?surveyId=xxx');
}

// 3. 检查本地存储
console.log('\n[3] localStorage 状态');
if (typeof localStorage !== 'undefined') {
  if (surveyId) {
    const metaKey = 'survey_meta_' + surveyId;
    const metaRaw = localStorage.getItem(metaKey);
    if (metaRaw) {
      const meta = JSON.parse(metaRaw);
      console.log('  ✅ meta 存在:', meta.title);
      console.log('     提交数:', meta.submissionCount);
      console.log('     最后提交:', meta.lastSubmission);
    } else {
      console.log('  ❌ meta 不存在:', metaKey);
    }

    const resultsKey = 'survey_results_' + surveyId;
    const resultsRaw = localStorage.getItem(resultsKey);
    if (resultsRaw) {
      const results = JSON.parse(resultsRaw);
      console.log('  ✅ submissions 存在:', results.length, '条记录');
      results.forEach((r, i) => {
        console.log(`     #${i+1}: ID=${r.id}, 总分=${r.totalScore?.toFixed(2)}, 时间=${r.timestamp}`);
      });
    } else {
      console.log('  ❌ submissions 不存在:', resultsKey);
    }
  }
} else {
  console.log('  ❌ localStorage 不可用');
}

// 4. 检查 Supabase 写入（如果已提交）
console.log('\n[4] Supabase 写入检查');
if (surveyId && typeof supabaseClient !== 'undefined' && supabaseClient) {
  (async () => {
    try {
      // 查询 surveys 表
      console.log('  查询 surveys 表...');
      const { data: survey, error: surveyError } = await supabaseClient
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (surveyError) {
        console.log('  ❌ surveys 查询失败:', surveyError.message);
        if (surveyError.code === '42501') {
          console.log('     ⚠️ RLS 策略拒绝访问！需要 "Allow all"');
        } else if (surveyError.code === 'PGRST116') {
          console.log('     ⚠️ surveys 表无此记录（这是问题！）');
        }
      } else if (survey) {
        console.log('  ✅ surveys 记录存在:');
        console.log('     标题:', survey.title);
        console.log('     提交数:', survey.submission_count);
        console.log('     最后提交:', survey.last_submission);
      }

      // 查询 submissions 表
      console.log('  查询 submissions 表...');
      const { data: submissions, error: subError } = await supabaseClient
        .from('submissions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('timestamp', { ascending: false });

      if (subError) {
        console.log('  ❌ submissions 查询失败:', subError.message);
      } else if (submissions && submissions.length > 0) {
        console.log('  ✅ submissions 记录:', submissions.length, '条');
        submissions.forEach((s, i) => {
          console.log(`     #${i+1}: submission_id=${s.submission_id}, 总分=${s.total_score}`);
        });
      } else {
        console.log('  ⚠️ submissions 表无记录（数据未同步到 Supabase）');
      }

    } catch (e) {
      console.log('  ❌ 查询异常:', e.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 诊断结果:');
    console.log('='.repeat(70));

    // 综合判断
    const metaExists = localStorage.getItem('survey_meta_' + surveyId);
    const resultsExist = localStorage.getItem('survey_results_' + surveyId);

    if (metaExists && resultsExist) {
      console.log('✅ 本地数据已保存');
    } else {
      console.log('❌ 本地数据缺失');
    }

    // 检查 Supabase
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      console.log('🔍 需要手动检查 Supabase Dashboard:');
      console.log('   1. 登录 https://supabase.com/dashboard');
      console.log('   2. 打开项目:', supabaseConfig.url);
      console.log('   3. 查看 Table Editor:');
      console.log('      - surveys 表是否有记录 (id=', surveyId, ')');
      console.log('      - submissions 表是否有记录 (survey_id=', surveyId, ')');
      console.log('');
      console.log('💡 如果 surveys 表无记录，说明首次提交失败（surveys 未创建）');
      console.log('💡 如果 submissions 表无记录，说明写入失败或 RLS 拒绝');
    }

    console.log('\n' + '='.repeat(70));
  })();
} else {
  console.log('  ⚠️ Supabase 未配置，跳过远程检查');
}

// 5. 测试实时订阅
console.log('\n[5] 实时订阅检查');
if (typeof supabaseSubscribeToSurvey === 'function') {
  console.log('  ✅ supabaseSubscribeToSurvey 函数存在');
  console.log('  提示: 提交新数据后，admin 页面应自动刷新');
} else {
  console.log('  ❌ supabaseSubscribeToSurvey 函数不存在');
}

console.log('\n' + '='.repeat(70));
console.log('诊断完成！');
console.log('='.repeat(70));
console.log('\n🔧 下一步:');
console.log('1. 如果在手机上看到 submissions 表无记录');
console.log('   → 打开浏览器控制台，查看提交时的错误日志');
console.log('   → 检查 localStorage 中是否有提交数据');
console.log('\n2. 如果 surveys 表无记录');
console.log('   → 说明 supabaseSaveSubmission 首次提交失败');
console.log('   → 检查代码中是否捕获了 PGRST116 异常');
console.log('\n3. 如果 RLS 拒绝访问');
console.log('   → 在 Supabase Dashboard 关闭 RLS 或添加 "Allow all" 策略');
console.log('='.repeat(70));
