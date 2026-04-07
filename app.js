// 问卷配置（固定，与 surveyId 无关）
const QUESTIONS = [
  {
    id: 1,
    number: '①',
    text: '业务场景(正常、异常)覆盖完整全面',
    weight: 0.4,
    options: [
      { label: '优秀', value: 5, emoji: '⭐' },
      { label: '良好', value: 3, emoji: '👍' },
      { label: '较差', value: 1, emoji: '⚠️' }
    ]
  },
  {
    id: 2,
    number: '②',
    text: '大纲覆盖需求规则逻辑、账务全面准确',
    weight: 0.4,
    options: [
      { label: '优秀', value: 5, emoji: '⭐' },
      { label: '良好', value: 3, emoji: '👍' },
      { label: '较差', value: 1, emoji: '⚠️' }
    ]
  },
  {
    id: 3,
    number: '③',
    text: '大纲编写不冗余，描述精炼、准确',
    weight: 0.2,
    options: [
      { label: '优秀', value: 5, emoji: '⭐' },
      { label: '良好', value: 3, emoji: '👍' },
      { label: '较差', value: 1, emoji: '⚠️' }
    ]
  }
]

// DOM 元素
const surveyTitle = document.getElementById('surveyTitle')
const surveyForm = document.getElementById('surveyForm')
const suggestion = document.getElementById('suggestion')
const charCount = document.getElementById('charCount')
const submitBtn = document.getElementById('submitBtn')
const successModal = document.getElementById('successModal')

// 当前 surveyId（从 URL 获取）
let currentSurveyId = ''

// 获取 URL 参数
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

// 初始化
function init() {
  // 获取 surveyId 和 title
  currentSurveyId = getUrlParam('surveyId')
  const title = getUrlParam('title')

  if (!currentSurveyId) {
    alert('缺少 surveyId 参数，请通过二维码或管理员链接访问')
    window.history.back()
    return
  }

  if (title) {
    surveyTitle.textContent = decodeURIComponent(title)
  }

  // 绑定事件
  surveyForm.addEventListener('change', updateSubmitButton)
  surveyForm.addEventListener('submit', handleSubmit)
  suggestion.addEventListener('input', () => {
    charCount.textContent = `${suggestion.value.length}/500`
  })

  // 为每个 radio 单独绑定 change 事件（更可靠）
  const radioInputs = surveyForm.querySelectorAll('input[type="radio"]')
  radioInputs.forEach(radio => {
    radio.addEventListener('change', updateSubmitButton)
  })

  // 初始化时检查
  setTimeout(updateSubmitButton, 100)
}

// 更新提交按钮状态
function updateSubmitButton() {
  const formData = new FormData(surveyForm)
  const q1 = formData.get('q1')
  const q2 = formData.get('q2')
  const q3 = formData.get('q3')
  const allSelected = q1 && q2 && q3
  submitBtn.disabled = !allSelected

  // 调试信息
  console.log('提交按钮状态:', { q1, q2, q3, allSelected, disabled: submitBtn.disabled })
}

// 计算分数
function calculateScore(answers) {
  let total = 0
  const questionScores = {}

  QUESTIONS.forEach(q => {
    const value = answers[q.id]
    const score = value * q.weight
    total += score
    questionScores[q.id] = {
      raw: value,
      weighted: score,
      label: q.options.find(opt => opt.value === value)?.label || '-'
    }
  })

  return {
    total: total,
    maxTotal: 5,
    questions: questionScores
  }
}

// 保存数据（按 surveyId 分隔）- 支持本地 + Firebase
async function saveSurvey(surveyId, data) {
  try {
    // 1. 保存到 localStorage（本地缓存）
    const key = 'survey_results_' + surveyId
    const stored = localStorage.getItem(key)
    const results = stored ? JSON.parse(stored) : []
    results.push(data)
    localStorage.setItem(key, JSON.stringify(results))

    // 更新提交计数和元数据
    const metaKey = 'survey_meta_' + surveyId
    const metaRaw = localStorage.getItem(metaKey)
    let meta = metaRaw ? JSON.parse(metaRaw) : {
      surveyId: surveyId,
      title: document.getElementById('surveyTitle')?.textContent || '未命名问卷',
      password: '',  // 将从 survey_manager_list 获取
      createdAt: new Date().toISOString(),
      submissionCount: 0
    }

    // 如果密码为空,尝试从 survey_manager_list 获取
    if (!meta.password) {
      const managerList = localStorage.getItem('survey_manager_list')
      if (managerList) {
        const surveys = JSON.parse(managerList)
        const survey = surveys.find(s => s.surveyId === surveyId)
        if (survey && survey.password) {
          meta.password = survey.password
        }
      }
    }

    meta.submissionCount = results.length
    meta.lastSubmission = new Date().toISOString()
    meta.title = meta.title || document.getElementById('surveyTitle')?.textContent || '未命名问卷'

    localStorage.setItem(metaKey, JSON.stringify(meta))

    console.log('[localStorage] 数据已保存:', { surveyId, total: results.length });

    // 2. 同步到 Supabase（如果已配置）
    if (typeof supabaseSaveSubmission === 'function') {
      try {
        // 调用 Supabase 保存，它会自动更新计数
        const result = await supabaseSaveSubmission(surveyId, data);
        if (result.error) {
          console.warn('[Supabase] 同步失败，仅保存在本地:', result.error);
        } else {
          console.log('[Supabase] 数据已同步到云端');
        }
      } catch (supabaseError) {
        console.warn('[Supabase] 同步异常，仅保存在本地:', supabaseError.message);
      }
    }

    return true;
  } catch (e) {
    console.error('保存失败:', e)
    return false
  }
}

// 处理提交
async function handleSubmit(e) {
  e.preventDefault()

  if (submitBtn.disabled) return

  const formData = new FormData(surveyForm)
  const answers = {
    1: parseInt(formData.get('q1')),
    2: parseInt(formData.get('q2')),
    3: parseInt(formData.get('q3'))
  }

  const scoreResult = calculateScore(answers)

  const surveyData = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    answers: answers,
    suggestion: suggestion.value.trim(),
    totalScore: scoreResult.total
  }

  // 保存到当前 surveyId 的数据
  // 显示保存状态（用户反馈）
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">保存中...</span>';

  const saveSuccess = await saveSurvey(currentSurveyId, surveyData);

  // 恢复按钮状态
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span class="btn-icon">📤</span><span class="btn-text">提交评价</span>';

  if (!saveSuccess) {
    alert('保存失败，请检查网络连接或联系管理员')
    return
  }

  // 显示成功
  showSuccessModal(scoreResult)

  // 重置表单
  setTimeout(() => {
    surveyForm.reset()
    suggestion.value = ''
    charCount.textContent = '0/500'
    updateSubmitButton()
  }, 500)
}

// 显示成功弹窗
function showSuccessModal(scoreResult) {
  document.getElementById('score1').textContent = `${scoreResult.questions[1].weighted.toFixed(2)} 分`
  document.getElementById('score2').textContent = `${scoreResult.questions[2].weighted.toFixed(2)} 分`
  document.getElementById('score3').textContent = `${scoreResult.questions[3].weighted.toFixed(2)} 分`
  document.getElementById('totalScore').textContent = scoreResult.total.toFixed(2)

  successModal.classList.add('show')

  setTimeout(() => {
    successModal.classList.remove('show')
  }, 3000)
}

// 点击弹窗关闭
successModal.addEventListener('click', () => {
  successModal.classList.remove('show')
})

// 页面加载完成后初始化
if (document.readyState !== 'loading') {
  init()
} else {
  document.addEventListener('DOMContentLoaded', init)
}