/**
 * Firebase 配置文件
 * ⚠️ 重要：请在此处填入你的 Firebase 项目配置
 *
 * 获取配置步骤：
 * 1. 访问 https://console.firebase.google.com/
 * 2. 创建项目或选择现有项目
 * 3. Project settings → Your apps → Web app
 * 4. 复制 firebaseConfig 对象的内容
 *
 * 更多信息请查看 FIREBASE_SETUP_GUIDE.md
 */

// Firebase 项目的配置对象（必须替换成你自己的！）
const firebaseConfig = {
  // apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  // authDomain: "your-project.firebaseapp.com",
  // databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  // projectId: "your-project",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "1234567890",
  // appId: "1:1234567890:web:abcdef123456"
};

// 如果配置不完整，提示用户
if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
  console.warn('%c⚠️ Firebase 未配置', 'color: orange; font-weight: bold;');
  console.warn('请在 firebase-config.js 中填写你的 Firebase 配置');
  console.warn('获取配置指南: FIREBASE_SETUP_GUIDE.md');
} else if (typeof firebase !== 'undefined') {
  // 初始化 Firebase
  try {
    firebase.initializeApp(firebaseConfig);
    window.database = firebase.database();
    console.log('[Firebase] 初始化成功');
    console.log('[Firebase] Database URL:', firebaseConfig.databaseURL);
  } catch (error) {
    console.error('[Firebase] 初始化失败:', error);
  }
}
