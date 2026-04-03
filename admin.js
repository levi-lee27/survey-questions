// 问卷配置（固定）
const QUESTIONS = [
  { id: 1, number: '①', text: '业务场景(正常、异常)覆盖完整全面', weight: 0.4 },
  { id: 2, number: '②', text: '大纲覆盖需求规则逻辑、账务全面准确', weight: 0.4 },
  { id: 3, number: '③', text: '大纲编写不冗余，描述精炼、准确', weight: 0.2 }
]

// 全局状态
let currentSurveyId = ''
let currentToken = ''
let allRecords = []
let filteredRecords = []
let currentPage = 1
const pageSize = 10

// 获取 URL 参数
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

// 显示面板
function showPanel(panel) {
  document.getElementById('authPanel').style.display = panel === 'auth' ? 'block' : 'none'
  document.getElementById('statsPanel').style.display = panel === 'stats' ? 'block' : 'none'
}

// 验证 Token
function verifyToken() {
  const token = document.getElementById('adminToken').value.trim()
  const surveyId = getUrlParam('surveyId')

  if (!surveyId) {
    showError('缺少 surveyId 参数')
    return
  }

  // 检查 meta 中的密码
  const metaKey = 'survey_meta_' + surveyId
  const metaRaw = localStorage.getItem(metaKey)
  if (!metaRaw) {
    showError('问卷不存在或尚未创建\n\n请先填写问卷，然后才能查看统计')
    return
  }

  const meta = JSON.parse(metaRaw)

  // 如果问卷没有设置密码，直接进入（不需要 token）
  if (!meta.password) {
    currentSurveyId = surveyId
    currentToken = ''
    document.getElementById('surveyTitleDisplay').textContent = meta.title || '未命名问卷'
    document.getElementById('surveyIdDisplay').textContent = surveyId
    showPanel('stats')
    loadData()
    return
  }

  // 有密码保护，必须提供 token
  if (!token) {
    showError('请输入管理员密码')
    return
  }

  // 验证密码是否匹配
  if (meta.password !== token) {
    showError('密码错误\n\n请检查 generate.html 中设置的密码')
    return
  }

  // 验证通过
  currentSurveyId = surveyId
  currentToken = token

  // 保存 meta 信息
  document.getElementById('surveyTitleDisplay').textContent = meta.title || '未命名问卷'
  document.getElementById('surveyIdDisplay').textContent = surveyId

  showPanel('stats')
  loadData()
}

// 显示错误
function showError(msg) {
  const el = document.getElementById('authError')
  if (el) {
    el.textContent = msg
    el.style.display = 'block'
  } else {
    alert(msg)
  }
}

// 加载数据
function loadData() {
  try {
    const key = 'survey_results_' + currentSurveyId
    const stored = localStorage.getItem(key)
    allRecords = stored ? JSON.parse(stored) : []
    filteredRecords = [...allRecords]
    renderAll()
  } catch (e) {
    console.error('加载数据失败:', e)
    allRecords = []
    filteredRecords = []
    renderAll()
  }
}

// 监听筛选事件
document.addEventListener('DOMContentLoaded', () => {
  const surveyId = getUrlParam('surveyId')
  if (!surveyId) {
    showPanel('auth')
    return
  }

  // 如果有 token 参数，直接验证
  const token = getUrlParam('token')
  if (token) {
    document.getElementById('adminToken').value = token
    setTimeout(() => verifyToken(), 100)
  } else {
    showPanel('auth')
  }

  // 绑定筛选事件
  document.getElementById('searchInput')?.addEventListener('input', debounce(handleFilter, 300))
  document.getElementById('sortSelect')?.addEventListener('change', handleFilter)
})

// 防抖
function debounce(fn, delay) {
  let timer = null
  return function () {
    if (timer) clearTimeout(timer)
    timer = setTimeout(fn, delay)
  }
}

// 处理筛选
function handleFilter() {
  const searchText = document.getElementById('searchInput')?.value.toLowerCase() || ''
  const sortBy = document.getElementById('sortSelect')?.value || 'time-desc'

  filteredRecords = allRecords.filter(record => {
    if (!searchText) return true
    const suggestion = record.suggestion || ''
    return suggestion.toLowerCase().includes(searchText)
  })

  filteredRecords.sort((a, b) => {
    switch (sortBy) {
      case 'time-desc':
        return new Date(b.timestamp) - new Date(a.timestamp)
      case 'time-asc':
        return new Date(a.timestamp) - new Date(b.timestamp)
      case 'score-desc':
        return b.totalScore - a.totalScore
      case 'score-asc':
        return a.totalScore - b.totalScore
      default:
        return 0
    }
  })

  currentPage = 1
  renderAll()
}

// 渲染所有内容
function renderAll() {
  renderStats()
  renderQuestionStats()
  renderRecords()
}

// 渲染统计数据
function renderStats() {
  const totalCount = allRecords.length

  let sumScore = 0
  let maxScore = 0

  allRecords.forEach(record => {
    sumScore += record.totalScore
    maxScore = Math.max(maxScore, record.totalScore)
  })

  const averageScore = totalCount > 0 ? sumScore / totalCount : 0

  document.getElementById('totalCount').textContent = totalCount
  document.getElementById('averageScore').textContent = averageScore.toFixed(2)
  document.getElementById('maxScore').textContent = maxScore.toFixed(2)
}

// 渲染各题平均分
function renderQuestionStats() {
  const container = document.getElementById('questionStats')

  if (allRecords.length === 0) {
    container.innerHTML = '<div class="no-data-message">暂无数据</div>'
    return
  }

  const stats = QUESTIONS.map(q => {
    let sum = 0
    allRecords.forEach(record => {
      if (record.answers[q.id] !== undefined) {
        sum += record.answers[q.id] * q.weight
      }
    })
    const avg = sum / allRecords.length
    return {
      id: q.id,
      number: q.number,
      text: q.text,
      weight: q.weight,
      average: avg
    }
  })

  container.innerHTML = stats.map(stat => `
    <div class="question-stat-item">
      <div class="question-stat-number">${stat.number}</div>
      <div class="question-stat-content">
        <div class="question-stat-text">${stat.text}</div>
        <div class="question-stat-bar">
          <div class="question-stat-progress" style="width: ${(stat.average / 5) * 100}%"></div>
        </div>
      </div>
      <div class="question-stat-score">${stat.average.toFixed(2)} 分</div>
    </div>
  `).join('')
}

// 渲染记录列表
function renderRecords() {
  const container = document.getElementById('recordsList')
  const recordCount = document.getElementById('recordCount')

  recordCount.textContent = `(${filteredRecords.length})`

  if (filteredRecords.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <div class="no-data-icon">📭</div>
        <p>暂无提交记录</p>
      </div>
    `
    document.getElementById('pagination').style.display = 'none'
    return
  }

  const totalPages = Math.ceil(filteredRecords.length / pageSize)
  const start = (currentPage - 1) * pageSize
  const end = Math.min(start + pageSize, filteredRecords.length)
  const pageRecords = filteredRecords.slice(start, end)

  container.innerHTML = pageRecords.map(record => `
    <div class="record-card">
      <div class="record-header">
        <span class="record-id">#${record.id}</span>
        <span class="record-time">${formatDateTime(record.timestamp)}</span>
      </div>
      <div class="record-answers">
        <div class="record-answer-item">
          <span class="record-answer-label">业务场景 (权重40%)</span>
          <span class="record-answer-value">${record.answers[1] || '-'} 分 (${(record.answers[1] * 0.4 || 0).toFixed(2)})</span>
        </div>
        <div class="record-answer-item">
          <span class="record-answer-label">大纲覆盖 (权重40%)</span>
          <span class="record-answer-value">${record.answers[2] || '-'} 分 (${(record.answers[2] * 0.4 || 0).toFixed(2)})</span>
        </div>
        <div class="record-answer-item">
          <span class="record-answer-label">大纲精炼 (权重20%)</span>
          <span class="record-answer-value">${record.answers[3] || '-'} 分 (${(record.answers[3] * 0.2 || 0).toFixed(2)})</span>
        </div>
      </div>
      <div class="record-score-header">
        <strong>综合得分：</strong>
        <span style="font-size: 20px; font-weight: 700; color: #667eea;">${record.totalScore.toFixed(2)}</span>
      </div>
      ${record.suggestion ? `<div class="record-suggestion">${escapeHtml(record.suggestion)}</div>` : ''}
    </div>
  `).join('')

  renderPagination(totalPages)
}

// 渲染分页
function renderPagination(totalPages) {
  const pagination = document.getElementById('pagination')

  if (totalPages <= 1) {
    pagination.style.display = 'none'
    return
  }

  pagination.style.display = 'flex'

  let html = ''

  html += `<button class="page-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>首页</button>`
  html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`

  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, currentPage + 2)

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`
  }

  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`
  html += `<button class="page-btn" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>`

  pagination.innerHTML = html
}

// 跳转页面
function goToPage(page) {
  const totalPages = Math.ceil(filteredRecords.length / pageSize)
  page = Math.max(1, Math.min(page, totalPages))
  currentPage = page
  renderRecords()
}

// 格式化时间
function formatDateTime(isoString) {
  const date = new Date(isoString)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 导出 CSV
function exportCSV() {
  if (allRecords.length === 0) {
    alert('暂无数据可导出')
    return
  }

  const headers = ['ID', '提交时间', '总分']
  QUESTIONS.forEach(q => {
    headers.push(`问题${q.number}原始分`)
    headers.push(`问题${q.number}加权分`)
  })
  headers.push('建议')

  const rows = allRecords.map(record => {
    const row = [
      record.id,
      record.timestamp,
      record.totalScore.toFixed(2)
    ]

    QUESTIONS.forEach(q => {
      const raw = record.answers[q.id] || ''
      const weighted = raw ? (raw * q.weight).toFixed(2) : ''
      row.push(raw, weighted)
    })

    row.push(record.suggestion || '')
    return row
  })

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `问卷数据_${currentSurveyId}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()

  // 延迟释放 URL,确保下载已开始
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 100)
}

// 清空数据
function clearAllData() {
  showModal('确认清空', '确定要清空当前问卷的所有数据吗？此操作不可恢复。', () => {
    const key = 'survey_results_' + currentSurveyId
    localStorage.removeItem(key)

    // 更新 meta
    const metaKey = 'survey_meta_' + currentSurveyId
    const metaRaw = localStorage.getItem(metaKey) || '{}'
    const meta = JSON.parse(metaRaw)
    meta.submissionCount = 0
    meta.lastSubmission = null
    localStorage.setItem(metaKey, JSON.stringify(meta))

    loadData()
    alert('数据已清空')
  })
}

// 模态框
function showModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal')
  document.getElementById('modalTitle').textContent = title
  document.getElementById('modalMessage').textContent = message

  const confirmBtn = document.getElementById('modalConfirm')
  const handler = () => {
    onConfirm()
    closeModal()
  }
  confirmBtn.onclick = handler
  modal.classList.add('show')
}

function closeModal() {
  document.getElementById('confirmModal').classList.remove('show')
}

// 全局方法（供 HTML 调用）
window.goToPage = goToPage
window.exportCSV = exportCSV
window.clearAllData = clearAllData
window.closeModal = closeModal