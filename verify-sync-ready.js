/**
 * ⚡ 快速验证 - 跨设备同步是否就绪
 *
 * 在填写问卷页 (index.html) 运行此脚本
 * 或在控制台粘贴执行
 */

console.log('='.repeat(70));
console.log('⚡ 跨设备同步准备状态检查');
console.log('='.repeat(70));

// 1. 检查配置
console.log('\n📋 1. Supabase 配置');
let configOk = false;
if (typeof supabaseConfig !== 'undefined' && supabaseConfig) {
  console.log('  ✅ supabaseConfig 对象存在');

  if (supabaseConfig.url && supabaseConfig.url.includes('supabase.co')) {
    console.log('  ✅ URL:', supabaseConfig.url);
    configOk = true;
  } else {
    console.log('  ❌ URL 无效或未配置');
  }

  if (supabaseConfig.anonKey && supabaseConfig.anonKey.length > 20) {
    console.log('  ✅ Anon Key: 已配置 (长度:', supabaseConfig.anonKey.length, ')');
  } else {
    console.log('  ❌ Anon Key 无效或未配置');
  }
} else {
  console.log('  ❌ supabaseConfig 未定义');
  console.log('  💡 请在 supabase-config.js 中配置你的 Supabase 项目');
}

// 2. 检查客户端初始化
console.log('\n📋 2. Supabase 客户端');
let clientOk = false;
if (typeof supabaseClient !== 'undefined' && supabaseClient) {
  console.log('  ✅ supabaseClient 已初始化');
  clientOk = true;
} else {
  console.log('  ❌ supabaseClient 未初始化');
  console.log('  💡 检查 supabase-client.js 是否加载');
}

// 3. 检查函数可用性
console.log('\n📋 3. 必要函数');
const requiredFunctions = [
  'supabaseSaveSubmission',
  'supabaseLoadSubmissions',
  'supabaseLoadSurveyMeta',
  'supabaseSubscribeToSurvey'
];

let functionsOk = true;
requiredFunctions.forEach(fn => {
  if (typeof window[fn] === 'function') {
    console.log(`  ✅ ${fn} 存在`);
  } else {
    console.log(`  ❌ ${fn} 不存在`);
    functionsOk = false;
  }
});

// 4. 检查当前 surveyId
console.log('\n📋 4. 问卷状态');
const urlParams = new URLSearchParams(window.location.search);
const surveyId = urlParams.get('surveyId');
if (surveyId) {
  console.log('  ✅ surveyId:', surveyId);
} else {
  console.log('  ❌ 未获取到 surveyId');
  console.log('  💡 确保通过问卷链接访问（URL 包含 ?surveyId=xxx）');
}

// 5. 测试 Supabase 连接（如果有配置）
if (configOk && clientOk && surveyId) {
  console.log('\n🧪 5. 测试 Supabase 连接');
  console.log('  正在测试...');

  (async () => {
    try {
      // 测试查询 surveys 表
      const { data: survey, error: surveyError } = await supabaseClient
        .from('surveys')
        .select('id, title, submission_count')
        .eq('id', surveyId)
        .maybeSingle(); // 使用 maybeSingle 避免异常

      if (surveyError) {
        console.log('  ❌ surveys 查询失败:', surveyError.message);
        if (surveyError.code === '42501') {
          console.log('     🛑 RLS 策略阻止访问！');
          console.log('     🔧 解决: 前往 Supabase Dashboard → Table Editor → surveys → Policies');
          console.log('         删除所有策略 或 添加 "Allow all" 策略');
        } else if (surveyError.code === 'PGRST116') {
          console.log('     ℹ️ surveys 表无此记录（正常，首次提交时会创建）');
        } else {
          console.log('     🔧 错误码:', surveyError.code);
        }
      } else if (survey) {
        console.log('  ✅ surveys 表可访问:');
        console.log('     标题:', survey.title);
        console.log('     提交数:', survey.submission_count);
      } else {
        console.log('  ℹ️ surveys 表无记录（将在首次提交时创建）');
      }

      // 测试查询 submissions 表
      const { data: submissions, error: subError } = await supabaseClient
        .from('submissions')
        .select('count')
        .eq('survey_id', surveyId);

      if (subError) {
        console.log('  ❌ submissions 查询失败:', subError.message);
        if (subError.code === '42501') {
          console.log('     🛑 RLS 策略阻止访问！');
          console.log('     🔧 前往 Supabase Dashboard → submissions → Policies → 删除所有策略');
        }
      } else {
        console.log('  ✅ submissions 表可访问（记录数:', submissions?.length || 0, ')');
      }

    } catch (e) {
      console.log('  ❌ 测试异常:', e.message);
    }

    // 6. 最终状态
    console.log('\n' + '='.repeat(70));
    console.log('📊 诊断结果:');
    console.log('='.repeat(70));

    const allOk = configOk && clientOk && functionsOk;
    if (allOk) {
      console.log('✅ 配置完整，功能就绪');
      console.log('💡 现在可以提交问卷，数据将同步到 Supabase');
      console.log('💡 提交后，在电脑 admin 页面查看跨设备数据');
    } else {
      console.log('❌ 配置不完整，跨设备同步不可用');
      console.log('\n🔧 修复步骤:');
      console.log('1. 检查 supabase-config.js 中的 URL 和 anonKey');
      console.log('2. 确保 supabase-client.js 和 supabase-config.js 已引入');
      console.log('3. 在 Supabase Dashboard 禁用 RLS 策略');
      console.log('4. 创建必需的 surveys 和 submissions 表');
    }

    console.log('\n' + '='.repeat(70));
  })();
} else {
  console.log('\n⚠️ 跳过连接测试（配置不全或无 surveyId）');
}

// 7. 提交后验证提示
console.log('\n💡 提交问卷后的检查:');
console.log('   1. 查看控制台是否看到 "[Supabase] 数据已保存，计数更新为: X"');
console.log('   2. 立即访问 Supabase Dashboard 查看数据');
console.log('   3. 在电脑 admin.html 刷新页面查看结果');
console.log('='.repeat(70));
