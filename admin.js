// 问卷配置（固定）
const QUESTIONS = [
  { id: 1, number: '①', text: '业务场景(正常、异常)覆盖完整全面', weight: 0.4 },
  { id: 2, number: '②', text: '大纲覆盖需求规则逻辑、账务全面准确', weight: 0.4 },
  { id: 3, number: '③', text: '大纲编写不冗余，描述精炼、准确', weight: 0.2 }
]

// 全局状态
let currentSurveyId = ''
let allRecords = []
let filteredRecords = []
let currentPage = 1
const pageSize = 10
let supabaseUnsubscribe = null  // 取消订阅函数

// 获取 URL 参数
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

// 直接加载并显示统计（无需密码验证）
async function loadStatistics() {
  const surveyId = getUrlParam('surveyId');

  if (!surveyId) {
    alert('缺少 surveyId 参数，请通过问卷生成的链接访问');
    window.location.href = 'generate.html';
    return;
  }

  currentSurveyId = surveyId;

  // 1. 尝试从 Supabase 加载 meta
  let meta = null;
  if (typeof supabaseLoadSurveyMeta === 'function') {
    const result = await supabaseLoadSurveyMeta(surveyId);
    if (!result.error && result.data) {
      meta = result.data;
      console.log('[Supabase] Meta loaded:', meta);
    }
  }

  // 2. 如果 Supabase 没有，尝试从 localStorage 加载
  if (!meta) {
    const metaKey = 'survey_meta_' + surveyId;
    const metaRaw = localStorage.getItem(metaKey);
    if (metaRaw) {
      meta = JSON.parse(metaRaw);
      console.log('[localStorage] Meta loaded:', meta);
    }
  }

  if (!meta) {
    // meta 不存在
    document.getElementById('surveyTitleDisplay').textContent = '问卷不存在';
    document.getElementById('surveyIdDisplay').textContent = surveyId;
    document.getElementById('totalCount').textContent = '-';
    document.getElementById('averageScore').textContent = '-';
    document.getElementById('maxScore').textContent = '-';
    document.getElementById('questionStats').innerHTML = '<div class="no-data-message">⚠️ 问卷不存在或尚未创建<br><br>请先访问 generate.html 创建问卷，然后填写提交。<br>注意：如果已经创建，请确保在同一浏览器中访问。</div>';
    document.getElementById('recordsList').innerHTML = '';
    return;
  }

  document.getElementById('surveyTitleDisplay').textContent = meta.title || '未命名问卷';
  document.getElementById('surveyIdDisplay').textContent = surveyId;

  // 显示统计面板
  document.getElementById('statsPanel').style.display = 'block';

  // 显示连接状态
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    showConnectionStatus('connected', '实时同步已启用');
  } else {
    showConnectionStatus('local', '仅本地数据（无云端同步）');
  }

  // 加载数据（支持 Supabase 实时订阅）
  await loadData();
}



// 加载数据 - 支持 Supabase 实时订阅
async function loadData() {
  // 如果 Supabase 可用，优先从 Supabase 加载
  if (typeof supabaseLoadSubmissions === 'function') {
    try {
      console.log('[Supabase] 开始加载数据...');

      // 设置实时订阅（只设置一次）
      if (!supabaseUnsubscribe) {
        supabaseUnsubscribe = supabaseSubscribeToSurvey(currentSurveyId, (payload) => {
          console.log('[Supabase] 数据变更:', payload.eventType);
          loadData(false);
          showNotification('新提交已同步');
        });
      }

      // 加载所有数据
      const result = await supabaseLoadSubmissions(currentSurveyId);
      if (!result.error && result.data) {
        allRecords = result.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log('[Supabase] 加载了', allRecords.length, '条记录');
      } else {
        allRecords = [];
        console.log('[Supabase] 暂无数据或加载失败:', result.error);
      }

      filteredRecords = [...allRecords];
      renderAll();

    } catch (error) {
      console.error('[Supabase] 加载失败，降级到 localStorage:', error);
      loadLocalData();
    }
  } else {
    // Supabase 未配置，使用 localStorage
    loadLocalData();
  }
}

// 重新加载（不重复订阅）
async function reloadData() {
  if (typeof supabaseLoadSubmissions === 'function') {
    try {
      const result = await supabaseLoadSubmissions(currentSurveyId);
      if (!result.error && result.data) {
        allRecords = result.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else {
        allRecords = [];
      }
      filteredRecords = [...allRecords];
      renderAll();
    } catch (error) {
      console.error('[Supabase] 重新加载失败:', error);
    }
  } else {
    loadLocalData();
  }
}

// 从 localStorage 加载数据（降级方案）
function loadLocalData() {
  try {
    const key = 'survey_results_' + currentSurveyId;
    const stored = localStorage.getItem(key);
    allRecords = stored ? JSON.parse(stored) : [];
    filteredRecords = [...allRecords];
    renderAll();
    console.log('[localStorage] 加载了', allRecords.length, '条记录');
  } catch (e) {
    console.error('加载数据失败:', e);
    allRecords = [];
    filteredRecords = [];
    renderAll();
  }
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
    let count = 0
    allRecords.forEach(record => {
      if (record.answers[q.id] !== undefined) {
        sum += record.answers[q.id] * q.weight
        count++
      }
    })
    const avg = count > 0 ? sum / count : 0
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
async function clearAllData() {
  showModal('确认清空', '确定要清空当前问卷的所有数据吗？此操作不可恢复。', async () => {
    // 1. 清空 localStorage
    const key = 'survey_results_' + currentSurveyId
    localStorage.removeItem(key)

    // 更新 meta
    const metaKey = 'survey_meta_' + currentSurveyId
    const metaRaw = localStorage.getItem(metaKey) || '{}'
    const meta = JSON.parse(metaRaw)
    meta.submissionCount = 0
    meta.lastSubmission = null
    localStorage.setItem(metaKey, JSON.stringify(meta))

    // 2. 如果 Supabase 可用，同时清空云端数据
    if (typeof supabaseClearSurvey === 'function') {
      try {
        await supabaseClearSurvey(currentSurveyId);
        console.log('[Supabase] 数据已清空');
      } catch (supabaseError) {
        console.warn('[Supabase] 清空失败:', supabaseError);
      }
    }

    loadData();
    alert('数据已清空');
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

// 显示连接状态
function showConnectionStatus(status, message) {
  const el = document.getElementById('connectionStatus');
  if (!el) return;

  el.className = 'connection-status ' + status;
  el.innerHTML = status === 'connected' ? '● 云端同步' :
                 status === 'local' ? '● 本地模式' :
                 status === 'error' ? '● 同步失败' : message;
  el.style.display = 'flex';
}

// 显示同步通知
function showNotification(message) {
  const el = document.getElementById('syncNotification');
  if (!el) return;

  el.querySelector('.sync-text').textContent = message;
  el.style.display = 'flex';

  // 3秒后自动隐藏
  setTimeout(() => {
    el.classList.add('hiding');
    setTimeout(() => {
      el.style.display = 'none';
      el.classList.remove('hiding');
    }, 300);
  }, 3000);
}

// 全局方法（供 HTML 调用）
window.goToPage = goToPage;
window.exportCSV = exportCSV;
window.clearAllData = clearAllData;
window.closeModal = closeModal;

// 页面加载完成后自动加载统计数据
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadStatistics);
} else {
  loadStatistics();
}

// 页面卸载时取消订阅
window.addEventListener('beforeunload', () => {
  if (supabaseUnsubscribe) {
    supabaseUnsubscribe();
  }
});
