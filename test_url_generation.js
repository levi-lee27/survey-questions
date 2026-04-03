// 模拟 GitHub Pages 环境
const testCases = [
  {
    name: "GitHub Pages root",
    protocol: "https:",
    hostname: "levi-lee27.github.io",
    pathname: "/survey-questions/generate.html",
    expected: "https://levi-lee27.github.io/survey-questions/"
  },
  {
    name: "GitHub Pages index.html",
    protocol: "https:",
    hostname: "levi-lee27.github.io",
    pathname: "/survey-questions/index.html",
    expected: "https://levi-lee27.github.io/survey-questions/"
  },
  {
    name: "Localhost with port",
    protocol: "http:",
    hostname: "localhost:8080",
    pathname: "/generate.html",
    expected: "http://localhost:8080/"
  },
  {
    name: "Localhost with subdir",
    protocol: "http:",
    hostname: "localhost:8080",
    pathname: "/survey-web/generate.html",
    expected: "http://localhost:8080/survey-web/"
  }
];

function getBaseUrl(customUrl, protocol, hostname, pathname) {
  // 优先使用用户自定义的部署地址
  if (customUrl) {
    return customUrl.trim().endsWith('/') ? customUrl.trim() : customUrl.trim() + '/';
  }

  // 对于 file:// 协议，返回空字符串（相对路径）
  if (protocol === 'file:') {
    return '';
  }

  const origin = protocol + '//' + hostname;
  const parts = pathname.split('/').filter(p => p);

  // 如果只有文件名（如 /generate.html），返回根路径
  if (parts.length <= 1) {
    return origin + '/';
  }

  // 返回子目录路径
  const subPath = parts.slice(0, -1).join('/');
  return `${origin}/${subPath}/`;
}

console.log("=== URL 生成测试 ===\n");
let passed = 0, failed = 0;

testCases.forEach(tc => {
  const result = getBaseUrl('', tc.protocol, tc.hostname, tc.pathname);
  const ok = result === tc.expected;
  console.log(`${ok ? "[PASS]" : "[FAIL]"} ${tc.name}`);
  console.log(`   期望: ${tc.expected}`);
  console.log(`   实际: ${result}\n`);
  if (ok) passed++; else failed++;
});

console.log(`\n总计: ${passed} 通过, ${failed} 失败`);
