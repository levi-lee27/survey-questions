/**
 * 诊断 admin.js 数据加载问题
 *
 * 使用说明：
 * 1. 在浏览器打开 admin.html?surveyId=你的问卷ID
 * 2. 打开控制台 (F12)
 * 3. 复制本文件全部内容粘贴到控制台
 * 4. 查看输出结果，定位问题
 */

console.log('\n' + '='.repeat(70));
console.log('🔍 admin.html 数据加载诊断');
console.log('='.repeat(70));

// 收集环境信息
const env = {
  surveyId: typeof currentSurveyId !== 'undefined' ? currentSurveyId : null,
  supabaseClient: typeof supabaseClient !== 'undefined' ? !!supabaseClient : false,
  supabaseLoadSubmissions: typeof supabaseLoadSubmissions !== 'undefined',
  supabaseLoadSurveyMeta: typeof supabaseLoadSurveyMeta !== 'undefined',
  supabaseUnsubscribe: typeof supabaseUnsubscribe !== 'undefined' ? !!supabaseUnsubscribe : false,
  allRecordsCount: typeof allRecords !== 'undefined' ? allRecords.length : -1,
  localStorage: typeof localStorage !== 'undefined'
};

console.log('\n[环境检查]');
Object.entries(env).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}`);
});

// 检查 URL 参数
console.log('\n[URL 参数]');
if (env.surveyId) {
  console.log(`  ✅ surveyId: ${env.surveyId}`);

  // 检查 localStorage 中的 meta
  if (env.localStorage) {
    const metaKey = 'survey_meta_' + env.surveyId;
    const metaRaw = localStorage.getItem(metaKey);
    if (metaRaw) {
      const meta = JSON.parse(metaRaw);
      console.log(`  ✅ localStorage meta 存在:`);
      console.log(`     标题: ${meta.title}`);
      console.log(`     密码: ${meta.password || '(空)'}`);
      console.log(`     提交数: ${meta.submissionCount}`);
      console.log(`     最后提交: ${meta.lastSubmission || '无'}`);
    } else {
      console.log(`  ❌ localStorage meta 不存在 (${metaKey})`);
    }

    // 检查 localStorage 中的 submissions
    const resultsKey = 'survey_results_' + env.surveyId;
    const resultsRaw = localStorage.getItem(resultsKey);
    if (resultsRaw) {
      const results = JSON.parse(resultsRaw);
      console.log(`  ✅ localStorage submissions 存在: ${results.length} 条记录`);
      results.forEach((r, i) => {
        console.log(`     #${i+1}: ID=${r.id}, 总分=${r.totalScore?.toFixed(2) || 'N/A'}`);
      });
    } else {
      console.log(`  ❌ localStorage submissions 不存在 (${resultsKey})`);
    }
  }
} else {
  console.log('  ❌ surveyId 未定义，无法继续诊断');
}

// 检查 Supabase 状态
if (env.supabaseClient) {
  console.log('\n[Supabase 状态]');
  console.log('  ✅ Supabase 客户端已初始化');

  if (typeof supabaseConfig !== 'undefined') {
    console.log(`  URL: ${supabaseConfig.url}`);
    console.log(`  Anon Key: ${supabaseConfig.anonKey ? '已配置' : '未配置'}`);
  }

  // 尝试直接查询（如果 supabase 客户端可访问）
  if (env.surveyId && typeof supabase !== 'undefined') {
    console.log('\n[Supabase 直接查询测试]');

    // 检查 surveys 表
    (async () => {
      try {
        const { data: survey, error: surveyError } = await supabaseClient
          .from('surveys')
          .select('*')
          .eq('id', env.surveyId)
          .single();

        if (surveyError) {
          console.log(`  查询 surveys 表: ❌ ${surveyError.message}`);
          if (surveyError.code === '42501') {
            console.log('    ⚠️ RLS 策略拒绝访问！需要启用 "Allow all" 策略');
          }
        } else if (survey) {
          console.log(`  ✅ surveys 表查询成功:`);
          console.log(`     标题: ${survey.title}`);
          console.log(`     提交数: ${survey.submission_count}`);
        } else {
          console.log('  ⚠️ surveys 表无此问卷记录');
        }

        // 检查 submissions 表
        const { data: submissions, error: subError } = await supabaseClient
          .from('submissions')
          .select('*')
          .eq('survey_id', env.surveyId);

        if (subError) {
          console.log(`  查询 submissions 表: ❌ ${subError.message}`);
        } else if (submissions && submissions.length > 0) {
          console.log(`  ✅ submissions 表查询成功: ${submissions.length} 条记录`);
          submissions.forEach((s, i) => {
            const score = s.total_score?.toFixed(2) || 'N/A';
            console.log(`     #${i+1}: ${s.submission_id}, ${score}分`);
          });
        } else {
          console.log('  ⚠️ submissions 表无记录');
        }
      } catch (e) {
        console.log(`  ❌ 查询异常: ${e.message}`);
      }

      console.log('\n' + '='.repeat(70));
      console.log('💡 诊断建议:');
      console.log('1. 如果 localStorage meta 存在但 Supabase 无数据');
      console.log('   → 手机端提交可能失败（检查手机控制台）');
      console.log('2. 如果 Supabase 拒绝访问 (42501)');
      console.log('   → 需要修改 Supabase RLS 策略为 "Allow all"');
      console.log('3. 如果 Supabase 有数据但 admin 不显示');
      console.log('   → loadData() 可能未正确处理空数据，需检查代码逻辑');
      console.log('='.repeat(70));
    })();
  }
} else {
  console.log('\n[Supabase 状态]');
  console.log('  ⚠️ Supabase 未配置或未初始化');
  console.log('  当前使用 localStorage 模式（仅限同设备）');
  console.log('  跨设备需要配置 Supabase');
}

// 检查当前 allRecords 内容
console.log('\n[当前页面状态]');
if (typeof allRecords !== 'undefined') {
  console.log(`  allRecords: ${allRecords.length} 条记录`);
  if (allRecords.length > 0) {
    console.log('  记录 IDs:', allRecords.map(r => r.id).join(', '));
    console.log('  总分分布:', allRecords.map(r => r.totalScore.toFixed(2)).join(', '));
  }
} else {
  console.log('  allRecords: 未定义');
}

if (typeof filteredRecords !== 'undefined') {
  console.log(`  filteredRecords: ${filteredRecords.length} 条记录`);
}

console.log('\n' + '='.repeat(70));
