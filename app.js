// 问卷配置（可自定义）
const CONFIG = {
  title: '评审满意度调查',
  questions: [
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
}

// DOM 元素
const surveyTitle = document.getElementById('surveyTitle')
const surveyForm = document.getElementById('surveyForm')
const suggestion = document.getElementById('suggestion')
const charCount = document.getElementById('charCount')
const submitBtn = document.getElementById('submitBtn')
const successModal = document.getElementById('successModal')

// 初始化
function init() {
  // 从 URL 参数获取自定义标题
  const urlParams = new URLSearchParams(window.location.search)
  const customTitle = urlParams.get('title')
  if (customTitle) {
    CONFIG.title = decodeURIComponent(customTitle)
    surveyTitle.textContent = CONFIG.title
  }

  // 计算初始按钮状态
  updateSubmitButton()

  // 事件监听
  surveyForm.addEventListener('change', updateSubmitButton)
  surveyForm.addEventListener('submit', handleSubmit)
  suggestion.addEventListener('input', updateCharCount)
}

// 更新字符计数
function updateCharCount() {
  const len = suggestion.value.length
  charCount.textContent = `${len}/500`
}

// 更新提交按钮状态
function updateSubmitButton() {
  const formData = new FormData(surveyForm)
  const q1 = formData.get('q1')
  const q2 = formData.get('q2')
  const q3 = formData.get('q3')

  submitBtn.disabled = !(q1 && q2 && q3)
}

// 计算加权分数
function calculateScore(answers) {
  let total = 0
  const questionScores = {}

  CONFIG.questions.forEach(q => {
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

// 保存数据
function saveSurvey(data) {
  try {
    const stored = localStorage.getItem('survey_results')
    const results = stored ? JSON.parse(stored) : []
    results.push(data)
    localStorage.setItem('survey_results', JSON.stringify(results))
    return true
  } catch (e) {
    console.error('保存失败:', e)
    return false
  }
}

// 处理提交
function handleSubmit(e) {
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

  // 保存
  if (!saveSurvey(surveyData)) {
    alert('保存失败，请重试')
    return
  }

  // 显示成功页面
  showSuccessModal(scoreResult)

  // 重置表单
  setTimeout(() => {
    surveyForm.reset()
    suggestion.value = ''
    updateCharCount()
    updateSubmitButton()
  }, 500)
}

// 显示成功模态框
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

// 点击模态框关闭
successModal.addEventListener('click', () => {
  successModal.classList.remove('show')
})

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init)

// 如果页面已经加载完成（script 在底部），立即执行
if (document.readyState !== 'loading') {
  init()
}