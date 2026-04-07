/**
 * Supabase 客户端封装
 * 提供统一的数据库操作接口
 */

// 全局变量
let supabaseClient = null;

/**
 * 初始化 Supabase 客户端
 */
function initSupabase() {
  if (typeof supabaseConfig === 'undefined' || !supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn('[Supabase] 未配置，跳过初始化');
    return null;
  }

  try {
    // 动态加载 @supabase/supabase-js
    if (typeof supabase === 'undefined') {
      console.warn('[Supabase] Supabase SDK 未加载，跳过初始化');
      return null;
    }

    supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
    console.log('[Supabase] 客户端初始化成功');
    return supabaseClient;
  } catch (error) {
    console.error('[Supabase] 初始化失败:', error);
    return null;
  }
}

/**
 * 保存提交到 Supabase
 * @param {string} surveyId - 问卷 ID
 * @param {object} submission - 提交数据 {id, timestamp, answers, suggestion, totalScore}
 * @returns {object} {data, error}
 */
async function supabaseSaveSubmission(surveyId, submission) {
  if (!supabaseClient) {
    console.warn('[Supabase] 客户端未初始化，跳过保存');
    return { error: 'Not configured' };
  }

  try {
    // 1. 插入提交记录
    const { data: submissionData, error: submissionError } = await supabaseClient
      .from('submissions')
      .upsert({
        survey_id: surveyId,
        submission_id: submission.id,
        timestamp: submission.timestamp,
        answers: submission.answers,
        suggestion: submission.suggestion || '',
        total_score: submission.totalScore
      }, {
        onConflict: 'survey_id, submission_id'
      });

    if (submissionError) {
      console.error('[Supabase] 保存提交失败:', submissionError);
      return { error: submissionError.message };
    }

    // 2. 更新 meta 统计（增加提交计数）
    // 尝试获取当前计数，如果不存在则创建新记录
    let currentCount = 0;
    let metaError = null;

    // 2.1 查询当前计数（处理首次提交）
    try {
      const { data: currentMeta } = await supabaseClient
        .from('surveys')
        .select('submission_count')
        .eq('id', surveyId)
        .single();

      currentCount = currentMeta?.submission_count || 0;
      console.log('[Supabase] 当前提交数:', currentCount);
    } catch (e) {
      // 如果记录不存在 (PGRST116)，这是首次提交，正常情况
      if (e.code === 'PGRST116') {
        console.log('[Supabase] surveys 表无记录（首次提交），将创建');
      } else {
        console.warn('[Supabase] 查询 meta 失败:', e.message);
        metaError = e.message;
      }
      // 继续处理，currentCount 保持为 0
    }

    // 2.2 创建/更新 surveys 记录
    const newCount = currentCount + 1;

    const { error: updateError } = await supabaseClient
      .from('surveys')
      .upsert({
        id: surveyId,
        title: submission.suggestion ? 'Survey with feedback' : 'Survey', // 提供基本标题
        submission_count: newCount,
        last_submission: submission.timestamp
      }, {
        // 确保即使部分字段缺失也能插入
        onConflict: 'id'
      });

    if (updateError) {
      console.error('[Supabase] 更新 meta 失败:', updateError);
      metaError = updateError.message;
      // 不中断，submissions 已保存成功
    } else {
      console.log('[Supabase] 提交已保存，计数更新为:', newCount);
    }

    // 3. 返回结果（submissions 成功即表示整体成功）
    // metaError 仅记录，不影响主要功能
    if (metaError) {
      console.warn('[Supabase] Meta 保存有误，但提交记录正常');
    }
    return { data: submissionData, error: null };
  } catch (error) {
    console.error('[Supabase] 保存异常:', error);
    return { error: error.message };
  }
}

/**
 * 保存问卷元数据（在 createSurvey 时调用）
 */
async function supabaseSaveSurveyMeta(surveyId, meta) {
  if (!supabaseClient) {
    console.warn('[Supabase] 客户端未初始化');
    return { error: 'Not configured' };
  }

  try {
    const { error } = await supabaseClient
      .from('surveys')
      .upsert({
        id: surveyId,
        title: meta.title || '未命名问卷',
        password: meta.password || '',
        created_at: meta.createdAt || new Date().toISOString(),
        submission_count: meta.submissionCount || 0,
        last_submission: meta.lastSubmission || null
      });

    if (error) {
      console.error('[Supabase] 保存 meta 失败:', error);
      return { error: error.message };
    }

    console.log('[Supabase] Meta 已保存:', meta.title);
    return { error: null };
  } catch (error) {
    console.error('[Supabase] 保存 meta 异常:', error);
    return { error: error.message };
  }
}

/**
 * 从 Supabase 加载问卷数据
 */
async function supabaseLoadSubmissions(surveyId) {
  if (!supabaseClient) {
    console.warn('[Supabase] 客户端未初始化');
    return { data: [], error: 'Not configured' };
  }

  try {
    const { data, error } = await supabaseClient
      .from('submissions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[Supabase] 加载失败:', error);
      return { data: [], error: error.message };
    }

    // 字段名归一化：将下划线风格转换为驼峰风格，与 app.js 保存的格式一致
    const normalizedData = (data || []).map(item => ({
      id: item.id,  // 自增ID
      submission_id: item.submission_id,
      timestamp: item.timestamp,
      answers: item.answers,
      suggestion: item.suggestion || '',
      totalScore: parseFloat(item.total_score) || 0, // 转换 total_score → totalScore
      // 保留原始字段以便调试
      survey_id: item.survey_id,
      total_score: item.total_score
    }));

    console.log('[Supabase] 加载了', normalizedData.length, '条记录（已归一化字段名）');
    return { data: normalizedData, error: null };
  } catch (error) {
    console.error('[Supabase] 加载异常:', error);
    return { data: [], error: error.message };
  }
}

/**
 * 从 Supabase 加载问卷元数据
 */
async function supabaseLoadSurveyMeta(surveyId) {
  if (!supabaseClient) {
    console.warn('[Supabase] 客户端未初始化');
    return { data: null, error: 'Not configured' };
  }

  try {
    const { data, error } = await supabaseClient
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录不存在
        return { data: null, error: null };
      }
      console.error('[Supabase] 加载 meta 失败:', error);
      return { data: null, error: error.message };
    }

    console.log('[Supabase] Meta 已加载:', data.title);
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] 加载 meta 异常:', error);
    return { data: null, error: error.message };
  }
}

/**
 * 清空 Supabase 中的问卷数据
 */
async function supabaseClearSurvey(surveyId) {
  if (!supabaseClient) {
    console.warn('[Supabase] 客户端未初始化');
    return { error: 'Not configured' };
  }

  try {
    // 1. 删除所有提交记录
    const { error: deleteError } = await supabaseClient
      .from('submissions')
      .delete()
      .eq('survey_id', surveyId);

    if (deleteError) {
      console.error('[Supabase] 删除记录失败:', deleteError);
      return { error: deleteError.message };
    }

    // 2. 重置 meta 统计
    const { error: updateError } = await supabaseClient
      .from('surveys')
      .update({
        submission_count: 0,
        last_submission: null
      })
      .eq('id', surveyId);

    if (updateError) {
      console.error('[Supabase] 更新 meta 失败:', updateError);
    }

    console.log('[Supabase] 数据已清空:', surveyId);
    return { error: null };
  } catch (error) {
    console.error('[Supabase] 清空异常:', error);
    return { error: error.message };
  }
}

/**
 * 订阅问卷数据变更（实时）
 * @param {string} surveyId - 问卷 ID
 * @param {function} callback - 回调函数，当数据变更时调用
 * @returns {Function} 取消订阅函数
 */
function supabaseSubscribeToSurvey(surveyId, callback) {
  if (!supabaseClient) {
    console.warn('[Supabase] 客户端未初始化，无法订阅');
    return () => {};
  }

  console.log('[Supabase] 订阅数据变更:', surveyId);

  const subscription = supabaseClient
    .channel(`submissions-${surveyId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'submissions',
        filter: `survey_id=eq.${surveyId}`
      },
      (payload) => {
        console.log('[Supabase] 收到数据变更:', payload.eventType, payload.new?.submission_id);
        callback(payload);
      }
    )
    .subscribe();

  // 返回取消订阅函数
  return () => {
    console.log('[Supabase] 取消订阅:', surveyId);
    supabaseClient.removeChannel(subscription);
  };
}

// 页面加载时自动初始化
if (document.readyState !== 'loading') {
  initSupabase();
} else {
  document.addEventListener('DOMContentLoaded', initSupabase);
}
