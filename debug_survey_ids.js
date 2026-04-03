// 调试 surveyId 的生成和存储
// 模拟 localStorage 中可能存在的键

console.log("=== 可能的 localStorage keys ===");
const keys = Object.keys(localStorage).filter(k => k.startsWith('survey_') || k === 'survey_manager_list');
console.log(keys);

console.log("\n=== survey_manager_list 内容 ===");
const managerList = localStorage.getItem('survey_manager_list');
if (managerList) {
  try {
    const surveys = JSON.parse(managerList);
    console.log("问卷数量:", surveys.length);
    surveys.forEach((s, i) => {
      console.log(`\n问卷 #${i+1}:`);
      console.log("  surveyId:", s.surveyId);
      console.log("  标题:", s.title);
      console.log("  创建时间:", s.createdAt);
      console.log("  提交数:", s.submissionCount);
    });
  } catch (e) {
    console.error("解析失败:", e);
  }
} else {
  console.log("（空）");
}

console.log("\n=== 所有 survey_meta_* 键 ===");
Object.keys(localStorage).filter(k => k.startsWith('survey_meta_')).forEach(k => {
  try {
    const meta = JSON.parse(localStorage.getItem(k));
    console.log(`\n${k}:`);
    console.log("  问卷ID:", meta.surveyId);
    console.log("  标题:", meta.title);
    console.log("  提交数:", meta.submissionCount);
  } catch (e) {
    console.error(k, "解析失败:", e);
  }
});
