// Supabase 集成测试（Node.js 环境模拟）
console.log("=== Supabase 集成测试 ===\n");

// 验证配置
const supabaseConfig = require('./supabase-config.js');

if (!supabaseConfig.url || supabaseConfig.url === 'https://your-project.supabase.co') {
  console.log("❌ Supabase 未配置或配置不完整");
  process.exit(1);
}

console.log("✅ Supabase 配置已就绪:");
console.log("   URL:", supabaseConfig.url);
console.log("   AnonKey:", supabaseConfig.anonKey.substring(0, 20) + "...");

// 测试数据
const testSurveyId = 'survey_' + Date.now();
const testSubmission = {
  id: Date.now(),
  timestamp: new Date().toISOString(),
  answers: {1: 5, 2: 4, 3: 3},
  suggestion: "自动测试提交",
  totalScore: 4.4
};

console.log("\n📝 测试数据:");
console.log("  Survey ID:", testSurveyId);
console.log("  Submission:", testSubmission);

console.log("\n✅ 配置验证通过！");
console.log("请在浏览器中完成以下手动测试:");
console.log("1. 访问 https://levi-lee27.github.io/survey-questions/generate.html");
console.log("2. 创建问卷");
console.log("3. 提交几次问卷");
console.log("4. 访问 admin.html 查看统计");
console.log("5. 用手机扫码测试跨设备同步");

