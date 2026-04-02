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

  updateSubmitButton()
}

// 更新提交按钮状态
function updateSubmitButton() {
  const formData = new FormData(surveyForm)
  const q1 = formData.get('q1')
  const q2 = formData.get('q2')
  const q3 = formData.get('q3')
  submitBtn.disabled = !(q1 && q2 && q3)
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

// 保存数据（按 surveyId 分隔）
function saveSurvey(surveyId, data) {
  try {
    const key = 'survey_results_' + surveyId
    const stored = localStorage.getItem(key)
    const results = stored ? JSON.parse(stored) : []
    results.push(data)
    localStorage.setItem(key, JSON.stringify(results))

    // 更新提交计数
    const metaKey = 'survey_meta_' + surveyId
    const metaRaw = localStorage.getItem(metaKey) || '{}'
    const meta = JSON.parse(metaRaw)
    meta.submissionCount = results.length
    meta.lastSubmission = new Date().toISOString()
    localStorage.setItem(metaKey, JSON.stringify(meta))

    return true
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
  if (!saveSurvey(currentSurveyId, surveyData)) {
    alert('保存失败，请重试')
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