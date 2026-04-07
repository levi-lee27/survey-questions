/**
 * 浏览器验证脚本 - 在 admin.html 控制台运行
 * 用途：快速验证修复是否生效
 */

console.log('='.repeat(60));
console.log('🔍 admin.html 验证脚本');
console.log('='.repeat(60));

// 1. 检查 loadStatistics 是否执行
console.log('\n[1] 检查页面状态');
if (typeof currentSurveyId !== 'undefined') {
  console.log(`  ✅ currentSurveyId = "${currentSurveyId}"`);
} else {
  console.log('  ❌ currentSurveyId 未定义 - loadStatistics() 可能未执行');
  console.log('  提示: 刷新页面或检查 URL 是否有 surveyId 参数');
}

// 2. 检查数据加载
console.log('\n[2] 检查数据状态');
if (typeof allRecords !== 'undefined') {
  console.log(`  ✅ allRecords 已加载: ${allRecords.length} 条记录`);
  if (allRecords.length > 0) {
    console.log(`     最高分: ${Math.max(...allRecords.map(r => r.totalScore)).toFixed(2)}`);
    console.log(`     平均分: ${(allRecords.reduce((s,r) => s+r.totalScore,0)/allRecords.length).toFixed(2)}`);
  }
} else {
  console.log('  ❌ allRecords 未定义');
}

// 3. 检查统计显示
console.log('\n[3] 检查页面元素');
const els = {
  totalCount: document.getElementById('totalCount'),
  averageScore: document.getElementById('averageScore'),
  maxScore: document.getElementById('maxScore'),
  questionStats: document.getElementById('questionStats'),
  recordsList: document.getElementById('recordsList')
};

Object.entries(els).forEach(([name, el]) => {
  if (el) {
    const text = el.textContent || el.innerHTML || '(empty)';
    console.log(`  ✅ #${name}: "${text.substring(0, 40)}${text.length>40?'...':''}"`);
  } else {
    console.log(`  ❌ #${name}: 元素不存在`);
  }
});

// 4. 检查 Supabase 连接
console.log('\n[4] 检查 Supabase 状态');
if (typeof supabaseClient !== 'undefined' && supabaseClient) {
  console.log('  ✅ Supabase 客户端已初始化');
  if (typeof supabaseUnsubscribe !== 'undefined') {
    console.log(`  ✅ 订阅状态: ${supabaseUnsubscribe ? '已订阅' : '未订阅'}`);
  }
} else {
  console.log('  ℹ️ Supabase 未配置（使用 localStorage 模式）');
}

// 5. 验证各题平均分计算
console.log('\n[5] 验证各题平均分计算');
if (typeof allRecords !== 'undefined' && allRecords.length > 0 && typeof QUESTIONS !== 'undefined') {
  QUESTIONS.forEach(q => {
    let sum = 0, count = 0;
    allRecords.forEach(r => {
      if (r.answers[q.id] !== undefined) {
        sum += r.answers[q.id] * q.weight;
        count++;
      }
    });
    const avg = count > 0 ? sum / count : 0;
    console.log(`  问题${q.number}: 加权平均 = ${avg.toFixed(2)} (${count}/${allRecords.length}条记录)`);
  });
}

// 6. 手动触发重新加载
console.log('\n[6] 手动加载测试');
if (typeof loadData === 'function') {
  console.log('  执行 loadData()...');
  loadData().then(() => {
    console.log('  ✅ loadData() 完成');
    setTimeout(() => {
      console.log('\n✅ 验证完成！');
      console.log('='.repeat(60));
    }, 1000);
  }).catch(err => {
    console.error('  ❌ loadData() 失败:', err);
  });
} else {
  console.log('  ❌ loadData() 函数不存在');
}

console.log('\n💡 提示: 如数据未显示，尝试 Ctrl+Shift+R 强制刷新');
console.log('='.repeat(60));
