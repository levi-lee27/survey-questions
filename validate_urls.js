// 模拟 generate.html 的 URL 生成逻辑

function getBaseUrl(customUrlInput, protocol, pathname) {
  // 优先使用用户自定义的部署地址
  const customUrl = (customUrlInput || '').trim()
  if (customUrl) {
    return customUrl.endsWith('/') ? customUrl : customUrl + '/'
  }

  // 如果没有自定义，使用当前页面的 origin
  if (protocol === 'file:') {
    return ''
  }

  // 模拟 window.location.origin
  const origin = protocol === 'http:' ? 'http://localhost:8080' : 
                 protocol === 'https:' ? 'https://example.com' : ''

  const parts = pathname.split('/').filter(p => p)

  if (parts.length <= 1) {
    return origin + '/'
  }

  const subPath = parts.slice(0, -1).join('/')
  return `${origin}/${subPath}/`
}

function generateSurveyUrl(baseUrl, surveyId, title) {
  return `${baseUrl}index.html?surveyId=${surveyId}&title=${encodeURIComponent(title)}`
}

function generateAdminUrl(baseUrl, surveyId, password) {
  let url = `${baseUrl}admin.html?surveyId=${surveyId}`
  if (password) {
    url += '&token=' + encodeURIComponent(password)
  }
  return url
}

// 测试用例
console.log('='*60)
console.log('[URL 生成验证]')
console.log('='*60)

const testCases = [
  {
    name: 'HTTP 本地服务器, 无自定义 URL, 根路径',
    protocol: 'http:',
    pathname: '/generate.html',
    customUrl: '',
    expectedBase: 'http://localhost:8080/',
    mustBeHttps: false
  },
  {
    name: 'HTTP 本地服务器, 子目录',
    protocol: 'http:',
    pathname: '/survey-web/generate.html',
    customUrl: '',
    expectedBase: 'http://localhost:8080/survey-web/',
    mustBeHttps: false
  },
  {
    name: 'HTTPS 生产环境, 自定义 URL',
    protocol: 'https:',
    pathname: '/generate.html',
    customUrl: 'https://myapp.example.com',
    expectedBase: 'https://myapp.example.com/',
    mustBeHttps: true
  },
  {
    name: 'file:// 协议, 必须提供自定义 URL',
    protocol: 'file:',
    pathname: 'file:///C:/survey-web/generate.html',
    customUrl: '',
    expectedBase: '',
    mustBeHttps: false
  },
  {
    name: '自定义 URL (无尾部斜杠)',
    protocol: 'https:',
    pathname: '/generate.html',
    customUrl: 'https://deploy.example.com/app',
    expectedBase: 'https://deploy.example.com/app/',
    mustBeHttps: true
  }
]

let passed = 0, failed = 0

testCases.forEach((tc, idx) => {
  const base = getBaseUrl(tc.customUrl, tc.protocol, tc.pathname)
  
  console.log(`\nTest ${idx+1}: ${tc.name}`)
  console.log(`  Expected base: ${tc.expectedBase}`)
  console.log(`  Got base:      ${base}`)
  
  const baseOk = base === tc.expectedBase
  if (!baseOk) {
    console.log(`  ❌ Base URL mismatch`)
    failed++
  } else {
    console.log(`  ✅ Base URL correct`)
    passed++
  }

  // 验证生成的完整 URL
  if (base) {
    const surveyUrl = generateSurveyUrl(base, 'survey_test123', '测试问卷')
    const adminUrl = generateAdminUrl(base, 'survey_test123', 'pwd123')
    
    console.log(`  Survey URL: ${surveyUrl}`)
    console.log(`  Admin URL:  ${adminUrl}`)
    
    // 检查是否有 https 开头（如果要求）
    if (tc.mustBeHttps) {
      const isHttps = surveyUrl.startsWith('https://')
      if (!isHttps) {
        console.log(`  ❌ Should start with https://`)
        failed++
      } else {
        console.log(`  ✅ Uses https://`)
        passed++
      }
    }
    
    // 验证 URL 包含必要参数
    if (!surveyUrl.includes('surveyId=')) {
      console.log(`  ❌ Missing surveyId in URL`)
      failed++
    } else {
      passed++
    }
  } else {
    console.log(`  ⚠️  Base URL is empty (expected for file:// without custom URL)`)
  }
})

console.log('\n' + '='*60)
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('='*60)
