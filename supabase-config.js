/**
 * Supabase 配置文件
 * ⚠️ 重要：请在此处填入你的 Supabase 项目配置
 *
 * 获取配置步骤：
 * 1. 访问 https://supabase.com/
 * 2. 创建项目
 * 3. Settings → API 复制 URL 和 anon key
 *
 * 更多信息请查看 SUPABASE_SETUP_GUIDE.md
 */

// Supabase 项目的配置对象（必须替换成你自己的！）
const supabaseConfig = {
  // ⬇️ 必填：从 Supabase Dashboard → Settings → API 复制的 URL
  url: "https://your-project.supabase.co",

  // ⬇️ 必填：匿名访问密钥（anon key）
  anonKey: "eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
};

// 如果配置不完整，提示用户
if (!supabaseConfig || !supabaseConfig.url || supabaseConfig.url === 'https://your-project.supabase.co') {
  console.warn('%c⚠️ Supabase 未配置', 'color: orange; font-weight: bold;');
  console.warn('请在 supabase-config.js 中填写你的 Supabase 配置');
  console.warn('获取配置指南: SUPABASE_SETUP_GUIDE.md');
} else {
  console.log('%c✅ Supabase 已配置', 'color: #52c41a; font-weight: bold;');
  console.log('   URL:', supabaseConfig.url);
}
