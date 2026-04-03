/**
 * ════════════════════════════════════════════════════════════════
 *  Firebase 配置文件 - 请务必填写！
 * ════════════════════════════════════════════════════════════════
 *
 *  这个文件必须包含完整的 Firebase 配置，跨设备同步才能工作。
 *  如果没有配置，系统将退回到本地 localStorage 模式。
 *
 *  📌 如何获取配置（3分钟）：
 *  1. 访问 https://console.firebase.google.com/
 *  2. 创建项目或选择已有项目
 *  3. Project settings → Your apps → Web app → 复制 firebaseConfig
 *  4. 粘贴到这里
 *
 *  详细步骤请查看：FIREBASE_CONFIG_HELPER.md
 * ════════════════════════════════════════════════════════════════
 */

const firebaseConfig = {
  // 【必填】从 Firebase Console 复制的 apiKey（以 AIzaSy 开头）
  apiKey: "PASTE_YOUR_API_KEY_HERE",

  // 【必填】例如：survey-questions.firebaseapp.com
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",

  // 【必填】例如：https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app
  databaseURL: "PASTE_YOUR_DATABASE_URL_HERE",

  // 【必填】项目 ID
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",

  // 【必填】例如：survey-questions.appspot.com
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",

  // 【必填】发送者 ID（11位数字）
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",

  // 【必填】应用 ID（格式：1:xxxxx:web:xxxxx）
  appId: "PASTE_YOUR_APP_ID_HERE"
};

// ════════════════════════════════════════════════════════════════
//  下方代码请勿修改 ⬇️
// ════════════════════════════════════════════════════════════════

if (typeof firebase !== 'undefined') {
  // 检查是否已配置
  const isConfigured = firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'PASTE_YOUR_API_KEY_HERE' &&
    firebaseConfig.databaseURL &&
    firebaseConfig.databaseURL !== 'PASTE_YOUR_DATABASE_URL_HERE';

  if (isConfigured) {
    try {
      firebase.initializeApp(firebaseConfig);
      window.database = firebase.database();
      console.log('%c✅ [Firebase] 配置成功，云端同步已启用', 'color: #52c41a; font-weight: bold;');
      console.log('   数据库:', firebaseConfig.databaseURL);
    } catch (error) {
      console.error('❌ [Firebase] 初始化失败:', error);
    }
  } else {
    console.warn('%c⚠️  [Firebase] 未配置或配置不完整', 'color: #fa8c16; font-weight: bold;');
    console.warn('   请编辑此文件，填入你的 Firebase 配置');
    console.warn('   获取配置：https://console.firebase.google.com/');
    console.warn('   参考文档：FIREBASE_CONFIG_HELPER.md');
  }
} else {
  console.error('❌ Firebase SDK 未加载，请确保引入了 firebase-app-compat.js 和 firebase-database-compat.js');
}
