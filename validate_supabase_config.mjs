// Supabase 配置验证脚本
// 检查配置文件是否完整且格式正确

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const configPath = join(process.cwd(), 'supabase-config.js');

try {
  const content = await readFile(configPath, 'utf-8');

  console.log('========================================');
  console.log('  Supabase 配置验证');
  console.log('========================================\n');

  // 1. 检查文件是否存在
  console.log('[1] 文件检查');
  console.log(`   ✅ 文件存在: ${configPath}`);
  console.log(`   📏 文件大小: ${content.length} 字节`);

  // 2. 提取配置值
  console.log('\n[2] 配置值提取');

  const urlMatch = content.match(/url:\s*["']([^"']+)["']/);
  const keyMatch = content.match(/anonKey:\s*["']([^"']+)["']/);

  if (!urlMatch) {
    console.log('   ❌ 未找到 url 配置');
  } else {
    const url = urlMatch[1];
    console.log(`   ✅ URL: ${url}`);

    // 验证 URL 格式
    if (url.startsWith('https://') && url.includes('.supabase.co')) {
      console.log('   ✅ URL 格式正确 (https://*.supabase.co)');
    } else {
      console.log('   ⚠️  URL 可能不正确，预期格式: https://xxx.supabase.co');
    }
  }

  if (!keyMatch) {
    console.log('   ❌ 未找到 anonKey 配置');
  } else {
    const key = keyMatch[1];
    console.log(`   ✅ AnonKey: ${key.substring(0, 20)}... (共 ${key.length} 字符)`);

    // 验证 JWT 格式
    if (key.startsWith('eyJ')) {
      console.log('   ✅ AnonKey 格式正确 (JWT)');
    } else {
      console.log('   ⚠️  AnonKey 可能不正确，预期以 eyJ 开头');
    }
  }

  // 3. 检查占位符
  console.log('\n[3] 占位符检查');

  if (urlMatch && urlMatch[1] === 'https://your-project.supabase.co') {
    console.log('   ❌ 使用默认占位符 URL，请替换成真实项目地址');
  } else if (urlMatch) {
    console.log('   ✅ URL 已配置（不是占位符）');
  }

  if (keyMatch && keyMatch[1].length < 50) {
    console.log('   ⚠️  AnonKey 似乎过短，请确认完整复制');
  } else if (keyMatch) {
    console.log('   ✅ AnonKey 长度正常');
  }

  // 4. 检查代码结构
  console.log('\n[4] 代码结构检查');

  if (content.includes('const supabaseConfig = {')) {
    console.log('   ✅ 使用 const 声明配置对象');
  }

  if (content.includes('export')) {
    console.log('   ℹ️  配置使用 export 导出（ES 模块）');
  } else if (content.includes('module.exports')) {
    console.log('   ℹ️  配置使用 module.exports 导出（CommonJS）');
  } else {
    console.log('   ℹ️  配置未显式导出（作为全局变量）');
  }

  if (content.includes('console.warn')) {
    console.log('   ✅ 包含配置验证警告');
  }

  // 5. 完整性检查
  console.log('\n[5] 完整性总结');

  const checks = {
    '文件存在': true,
    'URL 已配置': !!urlMatch && !urlMatch[1].includes('your-project'),
    'AnonKey 已配置': !!keyMatch && keyMatch[1].length > 100,
    '不是占位符': !(urlMatch && urlMatch[1] === 'https://your-project.supabase.co')
  };

  let allPassed = true;
  for (const [check, passed] of Object.entries(checks)) {
    console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    if (!passed) allPassed = false;
  }

  console.log('\n========================================');
  if (allPassed) {
    console.log('  ✅ 配置验证通过！');
    console.log('  配置文件格式正确，可以进行跨设备测试。');
  } else {
    console.log('  ❌ 配置不完整');
    console.log('  请参考 SUPABASE_SETUP_GUIDE.md 完成配置。');
  }
  console.log('========================================\n');

  // 6. 下一步操作
  console.log('📋 下一步操作:');
  console.log('1. 登录 Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. 确认已创建 surveys 和 submissions 表');
  console.log('3. 确认 RLS 策略为开放模式（允许所有读写）');
  console.log('4. 确认 Replication 已启用（用于实时订阅）');
  console.log('5. 执行跨设备测试（生成问卷 → 手机填写 → 电脑查看）\n');

  process.exit(allPassed ? 0 : 1);

} catch (error) {
  console.error('❌ 读取配置文件失败:', error.message);
  process.exit(1);
}
