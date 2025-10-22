/******************************************************
 * AI CareCoach Frontend (增强美化版 - 5.1 最终版本)
 * -----------------------------------------------
 * 🎯 优化: 预设问题 (quickQuestions) 直接触发高质量、硬编码的双语回答。
 * 🎯 修复: 知识库 (care_knowledge_en.md) 通过 LAMBDA_URL 加载。
 * 🎯 修复: 解决语言切换时导航栏宽度跳动的问题。
 * 🎯 修复: 确保打开AI助教时，能看到预设问题。
 ******************************************************/

const LAMBDA_URL =
  "https://itkmvgee3n3bvzg4upwvx5b2dm0ogcei.lambda-url.ap-northeast-1.on.aws/";

let currentModule = null;
let currentCourse = null;
let currentLang = localStorage.getItem("currentLang") || "zh";
let progressData = JSON.parse(localStorage.getItem("progressData") || "{}");
let chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
let studyTime = JSON.parse(localStorage.getItem("studyTime") || "{}");
let achievements = JSON.parse(localStorage.getItem("achievements") || "{}");
let currentQuiz = [];

// 等级定义
const LEVELS = {
    JUNIOR: { id: 'junior', name: { zh: '初级 (Junior)', en: 'Junior Level' }, color: '#1e88e5', icon: '🌱' },
    INTERMEDIATE: { id: 'intermediate', name: { zh: '中级 (Intermediate)', en: 'Intermediate Level' }, color: '#ffb300', icon: '🚀' },
    SENIOR: { id: 'senior', name: { zh: '高级 (Senior)', en: 'Senior Level' }, color: '#43a047', icon: '🎓' }
};

// ********** 精细化问题列表 (用于 UI 渲染和匹配) **********
const quickQuestions = [
    { key: "q.ulcer", question: "How to prevent pressure ulcers?" },
    { key: "q.diabetic_diet", question: "What diet is suitable for an elderly diabetic?" },
    { key: "q.fall_prevention", question: "What is a checklist for home fall prevention?" },
    { key: "q.palliative", question: "What are the key considerations for palliative care?" },
    { key: "q.mobility", question: "What is the proper technique for a bedside transfer?" },
];
// *******************************************


// ********** 精细化问题答案库 **********
const structuredAnswers = {
    "q.ulcer": {
        zh: `**【压疮预防三步法】**
1.  **定时翻身：** 卧床者每 **2 小时** 翻身一次，坐轮椅者每 **1 小时** 改变体位。
2.  **皮肤护理：** 每日检查皮肤，保持骨突部位皮肤**清洁和干燥**。使用润肤剂，但避免摩擦和过度潮湿。
3.  **使用工具：** 使用减压床垫或坐垫，确保床单平整、无褶皱。
`,
        en: `**【Pressure Ulcer Prevention: Three Key Steps】**
1.  **Repositioning:** Turn bedridden patients every **2 hours**, and reposition wheelchair users every **1 hour**.
2.  **Skin Care:** Inspect skin daily, keeping skin over bony prominences **clean and dry**. Use moisturizers, but avoid friction and excessive moisture.
3.  **Support Surfaces:** Utilize pressure-redistributing mattresses or cushions, and ensure bed linens are smooth and wrinkle-free.
`,
        recommendation: { domain_zh: "生活照护", level_zh: "中级", module: "特殊清洁与管路护理" }
    },
    "q.diabetic_diet": {
        zh: `**【老年糖尿病饮食建议】**
1.  **均衡搭配：** 参照“餐盘法”，确保每餐有足量的**非淀粉类蔬菜**（占一半）、瘦肉蛋白和全谷物。
2.  **控制碳水：** 选择**低升糖指数（低 GI）**的食物，并将碳水化合物平均分配到三餐中。
3.  **预防低血糖：** 随身携带快速吸收的糖分（如果汁或糖块）。
`,
        en: `**【Dietary Advice for Elderly Diabetics】**
1.  **Balanced Plate:** Use the "plate method" to ensure meals consist of ample **non-starchy vegetables** (half the plate), lean protein, and whole grains.
2.  **Carb Control:** Choose **low Glycemic Index (low GI)** foods and distribute carbohydrates evenly across meals.
3.  **Hypoglycemia Prevention:** Always carry a source of fast-acting sugar (like juice or sugar cubes).
`,
        recommendation: { domain_zh: "基础护理", level_zh: "中级", module: "基础生命体征护理" }
    },
    "q.fall_prevention": {
        zh: `**【家庭防跌倒安全清单】**
1.  **移除障碍物：** 移除家中的**地毯、电线**等绊倒物。确保走道畅通。
2.  **安装辅助设施：** 在浴室、马桶旁和楼梯处安装**扶手和抓杆**。
3.  **充足照明：** 确保夜间有**小夜灯**，所有区域光线充足。
4.  **穿着合适：** 鼓励穿**防滑、低跟**的鞋子，避免穿着宽松的拖鞋。
`,
        en: `**【Home Fall Prevention Safety Checklist】**
1.  **Remove Hazards:** Eliminate tripping hazards such as **rugs, loose cables**, and clutter from walkways.
2.  **Install Aids:** Install **grab bars** in the bathroom, next to the toilet, and along stairways.
3.  **Adequate Lighting:** Ensure all areas are well-lit, especially at night using **night lights**.
4.  **Appropriate Footwear:** Encourage the use of **non-slip, low-heeled** shoes; avoid loose slippers.
`,
        recommendation: { domain_zh: "功能维护", level_zh: "高级", module: "功能维护 - 肢体活动与平衡" }
    },
    "q.palliative": {
        zh: `**【临终关怀照护要点】**
1.  **疼痛与症状管理：** 严格遵循医嘱控制**疼痛、恶心、呼吸困难**等症状，保持患者舒适。
2.  **舒适护理：** 保持皮肤清洁干燥，勤换卧位，并提供**温和的口腔护理**，以维护尊严。
3.  **情感与精神支持：** 提供**安静的陪伴**和主动倾听，尊重患者的宗教和精神需求。
4.  **沟通：** 与家属进行清晰、诚实的沟通，帮助他们了解预期过程。
`,
        en: `**【Key Considerations for Palliative Care】**
1.  **Pain & Symptom Management:** Strictly follow medical orders to manage **pain, nausea, and shortness of breath** to ensure patient comfort.
2.  **Comfort Measures:** Maintain skin hygiene, provide frequent repositioning, and offer **gentle mouth care** to preserve dignity.
3.  **Emotional Support:** Provide a **quiet presence** and active listening, respecting the patient's religious and spiritual needs.
4.  **Communication:** Maintain clear, honest communication with the family to help them understand the expected process.
`,
        recommendation: { domain_zh: "心理照护", level_zh: "高级", module: "心理照护 - 沟通与情绪支持" }
    },
    "q.mobility": {
        zh: `**【安全床边转移技巧】**
1.  **安全检查：** 确保床和轮椅的**刹车已锁定**。使用转移带（gait belt）。
2.  **站立准备：** 让患者坐在床边，双脚平放地面，身体略微前倾。
3.  **使用口令：** 清晰地发出转移口令，例如：“一、二、三，请推床站起来！”
4.  **关键动作：** 照护者站在患者较弱一侧，利用**身体重心转移**和**枢轴转动**，而非纯粹的提拉力量。
`,
        en: `**【Safe Bedside Transfer Technique】**
1.  **Safety Check:** Ensure both the bed and wheelchair **brakes are locked**. Use a gait belt for assistance.
2.  **Positioning:** Have the patient sit at the edge of the bed with feet flat on the floor, leaning slightly forward.
3.  **Clear Cues:** Give clear commands for the transfer, e.g., "On the count of three, push off the bed!"
4.  **Technique:** The caregiver stands on the patient's weaker side, using **body weight shift** and a **pivot motion** rather than just lifting strength.
`,
        recommendation: { domain_zh: "生活照护", level_zh: "高级", module: "功能维护 - 翻身/进食" }
    }
};
// *******************************************


// 多语言翻译
const translations = {
  zh: {
    "sidebar.title": "🏥 培训模块",
    "sidebar.subtitle": "按技能领域系统学习",
    "header.title": "AI CareCoach 智能培训平台",
    "header.subtitle": "专业护理 · 智能学习 · 持续进步",
    "tabs.dashboard": "📊 学习总结",
    "tabs.content": "📖 核心要点",
    "tabs.quiz": "✏️ 练习题",
    "tabs.flashcard": "🎴 闪卡复习",
    "assistant.title": "🧠 小护助教",
    "assistant.clear": "清除记录",
    "assistant.placeholder": "提问示例：如何预防压疮？",
    "assistant.send": "发送",
    "dashboard.completedModules": "已完成课程", 
    "dashboard.avgScore": "平均成绩",
    "dashboard.studyTime": "累计学习时长",
    "dashboard.achievements": "已解锁成就",
    "dashboard.progressDetail": "学习进度详情",
    "dashboard.achievementWall": "成就墙",
    "dashboard.studySuggestion": "学习建议",
    "dashboard.unlocked": "已解锁",
    "dashboard.locked": "未解锁",
    "dashboard.currentLevelProgress": "总等级进度", 
    "dashboard.nextLevelUnlock": "解锁下一级", 
    "quiz.submit": "✅ 提交练习",
    "quiz.selectAnswer": "⚠️ 请选择答案",
    "quiz.selectAtLeastOne": "⚠️ 请至少选择一个答案",
    "quiz.completeAll": "⚠️ 请完成所有题目后再提交！",
    "quiz.perfect": "🎉 完美！全部正确！",
    "quiz.great": "👍 非常棒！继续保持！",
    "quiz.good": "💪 不错！再加把劲！",
    "quiz.keepLearning": "📚 继续学习，你会进步的！",
    "quiz.score": "本次得分",
    "quiz.correct": "✅ 正确！",
    "quiz.correctAnswer": "❌ 正确答案：",
    "flashcard.total": "共",
    "flashcard.cards": "张闪卡",
    "flashcard.clickToFlip": "点击卡片翻转查看详细内容",
    "flashcard.noCards": "暂无闪卡",
    "flashcard.selectCourse": "请先选择一个课程开始学习",
    "flashcard.helpMemory": "闪卡会帮助你快速记忆核心知识点",
    "flashcard.clickDetail": "点击查看详情",
    "loading.failed": "加载失败",
    "loading.retry": "🔄 重试",
    "achievement.firstModule": "初出茅庐",
    "achievement.threeModules": "勤学苦练",
    "achievement.allModules": "全能护士",
    "achievement.perfectScore": "满分学霸",
    "achievement.study10h": "十小时学习",
    "achievement.chat10": "善问好学",
    "achievement.unlocked": "🎉 成就解锁！",
    
    // 模块/等级提示
    "level.unlock_msg": "💡 请先完成前一等级（100%进度）才能解锁本等级！",
    "level.locked": "🔒 锁定 - 完成前一等级",
    "level.unlocked": "✅ 已解锁",
    "level.progress": "进度",
    
    // AI 助手新增
    "assistant.suggestions": "💡 试试问这些问题：",
    "q.ulcer": "如何预防压疮？",
    "q.diabetic_diet": "老年糖尿病患者的饮食建议？",
    "q.fall_prevention": "家中防跌倒安全清单？",
    "q.palliative": "临终关怀的照护要点？",
    "q.mobility": "如何安全地进行床边转移？",
  },
  en: {
    "sidebar.title": "🏥 Training Modules",
    "sidebar.subtitle": "Systematic Skill Development",
    "header.title": "AI CareCoach Training Platform",
    "header.subtitle": "Professional Care · Smart Learning · Continuous Progress",
    "tabs.dashboard": "📊 Dashboard",
    "tabs.content": "📖 Key Points",
    "tabs.quiz": "✏️ Quiz",
    "tabs.flashcard": "🎴 Flashcards",
    "assistant.title": "🧠 AI Assistant",
    "assistant.clear": "Clear History",
    "assistant.placeholder": "Example: How to prevent pressure ulcers?",
    "assistant.send": "Send",
    "dashboard.completedModules": "Completed Courses",
    "dashboard.avgScore": "Average Score",
    "dashboard.studyTime": "Total Study Time",
    "dashboard.achievements": "Achievements Unlocked",
    "dashboard.progressDetail": "Learning Progress",
    "dashboard.achievementWall": "Achievement Wall",
    "dashboard.studySuggestion": "Learning Suggestions",
    "dashboard.unlocked": "Unlocked",
    "dashboard.locked": "Locked",
    "dashboard.currentLevelProgress": "Total Level Progress", 
    "dashboard.nextLevelUnlock": "Unlock Next Level", 
    "quiz.submit": "✅ Submit Quiz",
    "quiz.selectAnswer": "⚠️ Please select an answer",
    "quiz.selectAtLeastOne": "⚠️ Please select at least one answer",
    "quiz.completeAll": "⚠️ Please complete all questions before submitting!",
    "quiz.perfect": "🎉 Perfect! All Correct!",
    "quiz.great": "👍 Great Job! Keep it up!",
    "quiz.good": "💪 Good! Keep trying!",
    "quiz.keepLearning": "📚 Keep learning, you'll improve!",
    "quiz.score": "Your Score",
    "quiz.correct": "✅ Correct!",
    "quiz.correctAnswer": "❌ Correct Answer:",
    "flashcard.total": "Total",
    "flashcard.cards": "Flashcards",
    "flashcard.clickToFlip": "Click cards to flip and view details",
    "flashcard.noCards": "No Flashcards",
    "flashcard.selectCourse": "Please select a course to start learning",
    "flashcard.helpMemory": "Flashcards help you memorize key points quickly",
    "flashcard.clickDetail": "Click for details",
    "loading.failed": "Loading Failed",
    "loading.retry": "🔄 Retry",
    "achievement.firstModule": "First Steps",
    "achievement.threeModules": "Dedicated Learner",
    "achievement.allModules": "Master Nurse",
    "achievement.perfectScore": "Perfect Score",
    "achievement.study10h": "10 Hours Study",
    "achievement.chat10": "Curious Mind",
    "achievement.unlocked": "🎉 Achievement Unlocked!",
    
    // 模块/等级提示
    "level.unlock_msg": "💡 Complete the previous level (100% progress) to unlock this level!",
    "level.locked": "🔒 Locked - Complete Previous Level",
    "level.unlocked": "✅ Unlocked",
    "level.progress": "Progress",

    // AI 助手新增
    "assistant.suggestions": "💡 Try asking these questions:",
    "q.ulcer": "How to prevent pressure ulcers?",
    "q.diabetic_diet": "Diet advice for elderly diabetics?",
    "q.fall_prevention": "Home fall prevention checklist?",
    "q.palliative": "Key points for palliative care?",
    "q.mobility": "What is the proper technique for a bedside transfer?",
  }
};

// 模块结构重定义 (保持不变)
const modules = [
  // 领域一：生活照护 (ID 1-4)
  { 
    id: 1, 
    domain: { zh: "生活照护", en: "Daily Care" },
    icon: "🏠",
    desc: "日常清洁、饮食和排泄照护。", 
    courses: [ 
        { id: "1a", title: LEVELS.JUNIOR.name, level: LEVELS.JUNIOR, file_id: 1, recommendation: "基础清洁照护" }, 
        { id: "1b", title: LEVELS.INTERMEDIATE.name, level: LEVELS.INTERMEDIATE, file_id: 4, recommendation: "特殊清洁与管路护理" }, 
        { id: "1c", title: LEVELS.SENIOR.name, level: LEVELS.SENIOR, file_id: 7, recommendation: "功能维护 - 翻身/进食" }
    ] 
  },
  // 领域二：基础护理 (ID 5)
  { 
    id: 2, 
    domain: { zh: "基础护理", en: "Basic Nursing" }, 
    icon: "🩺",
    desc: "生命体征、安全与用药管理。", 
    courses: [ 
        { id: "2a", title: LEVELS.INTERMEDIATE.name, level: LEVELS.INTERMEDIATE, file_id: 5, recommendation: "基础生命体征护理" } 
    ] 
  },
  // 领域三：对症护理 (ID 6)
  { 
    id: 3, 
    domain: { zh: "对症护理", en: "Symptom Care" }, 
    icon: "🏥",
    desc: "常见症状识别与处理。", 
    courses: [ 
        { id: "3a", title: LEVELS.INTERMEDIATE.name, level: LEVELS.INTERMEDIATE, file_id: 6, recommendation: "对症护理 - 呼吸消化皮肤" } 
    ] 
  },
  // 领域四：功能维护 (ID 7)
  { 
    id: 4, 
    domain: { zh: "功能维护", en: "Functional Maintenance" }, 
    icon: "💪",
    desc: "肢体活动与平衡训练。", 
    courses: [ 
        { id: "4a", title: LEVELS.SENIOR.name, level: LEVELS.SENIOR, file_id: 7, recommendation: "功能维护 - 肢体活动与平衡" } 
    ] 
  },
  // 领域五：心理照护 (ID 8)
  { 
    id: 5, 
    domain: { zh: "心理照护", en: "Psychological Care" }, 
    icon: "💗",
    desc: "沟通技巧与情绪识别。", 
    courses: [ 
        { id: "5a", title: LEVELS.SENIOR.name, level: LEVELS.SENIOR, file_id: 8, recommendation: "心理照护 - 沟通与情绪支持" } 
    ] 
  },
];

// ... (以下 RAG 核心函数用于知识库加载，但本次助教回答不直接使用，仅保留结构) ...
let KB_TEXT = "";
let KB_CHUNKS = []; 

async function loadKB() {
  const KB_PATH = "data/care_knowledge_en.md";
  try {
    console.log(`[KB] Loading knowledge base from: ${KB_PATH}`);
    
    const res = await fetch(`${LAMBDA_URL}?path=${encodeURIComponent(KB_PATH)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const txt = await res.text();
    
    let content = txt.trim();
    if (content.startsWith('{') && content.endsWith('}')) {
        try {
            const data = JSON.parse(content);
            content = data.body || content; 
        } catch (e) { }
    }
    
    KB_TEXT = content || "";
    // KB_CHUNKS = chunkMarkdown(KB_TEXT); // 生产环境中应保留分块逻辑
    console.log("[KB] loaded.");
  } catch (e) { 
      console.warn("[KB] load failed:", e); 
  }
}
loadKB();
// ... (RAG 辅助函数略去) ...


// 进度计算和UI函数 (保持不变)
const allCourses = modules.flatMap(mod => mod.courses.map(course => ({
    ...course,
    moduleId: mod.id,
    courseKey: `${mod.id}_${course.id}`, // 唯一键：1_1a, 2_2a...
})));
const TOTAL_COURSES = allCourses.length; 


function getCourseProgress(courseKey) {
    return progressData[courseKey] || 0;
}

function getUserLevelProgress() {
    let completedCount = 0;
    allCourses.forEach(course => {
        if (getCourseProgress(course.courseKey) === 100) {
            completedCount++;
        }
    });
    const progress = TOTAL_COURSES > 0 ? Math.round((completedCount / TOTAL_COURSES) * 100) : 0;
    return { completedCount, progress, total: TOTAL_COURSES };
}

function isCourseLocked(courseKey) {
    const courseIndex = allCourses.findIndex(c => c.courseKey === courseKey);
    if (courseIndex === 0) return false; 
    
    const prevCourseKey = allCourses[courseIndex - 1].courseKey;
    return getCourseProgress(prevCourseKey) < 100;
}


function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("currentLang", lang);
  
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`lang-${lang}`).classList.add('active');
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
  
  loadModules();
  renderDashboard();
  renderChatHistory();
  
  document.querySelectorAll('.module-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.module-header').forEach(h => h.classList.remove('expanded'));

  if (currentCourse) {
    document.getElementById("contentArea").innerHTML =
        "<div class='loading-skeleton'></div>".repeat(5);
    document.getElementById("quizArea").innerHTML =
        "<div class='loading-skeleton'></div>".repeat(3);
    document.getElementById("flashcardArea").innerHTML =
        "<div class='loading-skeleton'></div>".repeat(4);
    
    selectCourse(currentCourse, false, true); 
  }
}

function t(key) {
  return translations[currentLang][key] || key;
}

let sessionStart = Date.now();
setInterval(() => {
  if (currentModule && currentCourse) { 
      const courseKey = `${currentModule}_${currentCourse}`;
      studyTime[courseKey] = (studyTime[courseKey] || 0) + 1;
      localStorage.setItem("studyTime", JSON.stringify(studyTime));
  }
}, 60000); 

window.onload = () => {
  switchLanguage(currentLang); 
  renderChatHistory();
  renderDashboard();
};

const achievementsList = [
  { 
    id: "first_module", 
    name: { zh: "初出茅庐", en: "First Steps" }, 
    icon: "🌱", 
    condition: () => getUserLevelProgress().completedCount >= 1 
  },
  { 
    id: "three_modules", 
    name: { zh: "勤学苦练", en: "Dedicated Learner" }, 
    icon: "📚", 
    condition: () => getUserLevelProgress().completedCount >= 3 
  },
  { 
    id: "all_modules", 
    name: { zh: "全能护士", en: "Master Nurse" }, 
    icon: "🏆", 
    condition: () => getUserLevelProgress().completedCount >= TOTAL_COURSES 
  },
  { 
    id: "perfect_score", 
    name: { zh: "满分学霸", en: "Perfect Score" }, 
    icon: "💯", 
    condition: () => Object.values(progressData).some(v => v === 100) 
  },
  { 
    id: "study_10h", 
    name: { zh: "十小时学习", en: "10 Hours Study" }, 
    icon: "⏰", 
    condition: () => Object.values(studyTime).reduce((a,b)=>a+b,0) >= 600 
  },
  { 
    id: "chat_10", 
    name: { zh: "善问好学", en: "Curious Mind" }, 
    icon: "💬", 
    condition: () => chatHistory.filter(h => h.role === 'user').length >= 10 
  },
];

function checkAchievements() {
  let newUnlocked = false;
  achievementsList.forEach(ach => {
    if (!achievements[ach.id] && ach.condition()) {
      achievements[ach.id] = true;
      newUnlocked = true;
      showAchievementToast(ach);
    }
  });
  if (newUnlocked) {
    localStorage.setItem("achievements", JSON.stringify(achievements));
  }
}

function showAchievementToast(ach) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.5s ease;
  `;
  toast.innerHTML = `
    <div style="font-size: 2em; text-align: center; margin-bottom: 10px;">${ach.icon}</div>
    <div style="font-weight: bold; font-size: 1.1em; text-align: center;">${t('achievement.unlocked')}</div>
    <div style="text-align: center; margin-top: 5px;">${ach.name[currentLang]}</div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function loadModules() {
  const container = document.getElementById("sidebarContent");
  container.innerHTML = "";
  
  modules.forEach(mod => {
    const modDiv = document.createElement("div");
    modDiv.className = "module";
    
    const moduleHeader = document.createElement('div');
    moduleHeader.className = "module-header module-domain-header"; 
    moduleHeader.style.cursor = 'pointer'; 

    moduleHeader.innerHTML = `
        <span>${mod.icon} ${mod.domain[currentLang]}</span>
        <span class="icon">▼</span>
    `;
    moduleHeader.onclick = () => toggleModule(mod.id, false);
    modDiv.appendChild(moduleHeader);

    const moduleContent = document.createElement('div');
    moduleContent.id = `module-${mod.id}`;
    moduleContent.className = 'module-content';
    moduleContent.innerHTML = `<p class="module-desc">${mod.desc}</p>`;

    mod.courses.forEach((course) => {
      const courseKey = `${mod.id}_${course.id}`;
      const isLocked = isCourseLocked(courseKey);
      const progress = getCourseProgress(courseKey);
      
      const levelTitle = course.title[currentLang];
      const courseClass = isLocked ? 'sub-course locked' : 'sub-course';
      
      const courseDiv = document.createElement('div');
      courseDiv.className = courseClass;
      courseDiv.style.borderLeft = `3px solid ${isLocked ? '#d32f2f' : course.level.color}`; 
      courseDiv.setAttribute('onclick', `selectCourse('${courseKey}', ${isLocked})`);
      courseDiv.style.position = 'relative'; 

      courseDiv.innerHTML = `
        <span>${course.level.icon}</span>
        <span style="font-weight:600; color: ${isLocked ? '#999' : course.level.color};">${levelTitle}</span>
        <span style="flex-grow:1;"></span>
        <small style="font-weight:bold; color: ${isLocked ? '#999' : '#666'};">${progress}%</small>
      `;
      
      courseDiv.innerHTML += `
        <div class="progress-container" style="width: 100%; position: absolute; bottom: 0; left: 0; height: 5px; margin: 0; border-radius: 0 0 6px 6px;">
          <div class="progress-fill" style="width:${progress}%; background: ${isLocked ? '#fbc02d' : course.level.color};"></div>
        </div>
      `;

      moduleContent.appendChild(courseDiv);
    });

    modDiv.appendChild(moduleContent);
    container.appendChild(modDiv);
  });
}

function toggleModule(id, isLocked) {
  
  const el = document.getElementById(`module-${id}`);
  const header = el.previousElementSibling;
  if (el.style.display === "block") {
    el.style.display = "none";
    header.classList.remove("expanded");
  } else {
    document.querySelectorAll('.module-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.module-header').forEach(h => h.classList.remove("expanded"));

    el.style.display = "block";
    header.classList.add("expanded");
  }
}

async function getS3File(path) {
  try {
    const url = `${LAMBDA_URL}?path=${encodeURIComponent(path)}`;
    console.log("正在请求:", url);
    
    const res = await fetch(url);
    const text = await res.text();
    console.log("原始响应:", text.substring(0, 200) + "...");
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON解析失败:", e);
      return text; 
    }
    
    console.log("解析后数据:", data);
    return data;
  } catch (error) {
    console.error("获取文件失败:", error);
    throw error;
  }
}

async function selectCourse(courseKey, isLocked = false, isLangSwitch = false) {
  const courseData = allCourses.find(c => c.courseKey === courseKey);
  if (!courseData) return;
  
  if (isLocked && !isLangSwitch) {
    alert(t('level.unlock_msg'));
    return;
  }
  
  currentCourse = courseKey;
  currentModule = courseData.moduleId; 

  if (!isLangSwitch) {
    showTab('content');
  }

  document.getElementById("contentArea").innerHTML =
    "<div class='loading-skeleton'></div>".repeat(5);
  document.getElementById("quizArea").innerHTML =
    "<div class='loading-skeleton'></div>".repeat(3);
  document.getElementById("flashcardArea").innerHTML =
    "<div class='loading-skeleton'></div>".repeat(4);
    
  const langSuffix = currentLang === 'en' ? '_en' : '';
  const mid = courseData.file_id; 

  try {
    console.log(`加载课程 ${courseKey} 的数据... (文件 ID: ${mid}, 语言: ${currentLang})`);

    let moduleFileName = `data/module_${mid}${langSuffix}.json`;
    let quizFileName = `data/quiz_module_${mid}${langSuffix}.json`;
    
    const contentData = await getS3File(moduleFileName);
    const quizData = await getS3File(quizFileName);

    if (!contentData || !contentData.content) {
      throw new Error(`内容数据格式错误或文件 ${moduleFileName} 缺失：请确保文件存在并包含 content 字段。`);
    }
    if (!quizData || !quizData.quiz) {
      throw new Error(`题库数据格式错误或文件 ${quizFileName} 缺失：请确保文件存在并包含 quiz 字段。`);
    }

    let filteredContent = [];
    const targetLevelId = courseData.level.id; 
    let filterApplied = false;

    contentData.content.forEach(section => {
        let newUnits = [];
        section.units.forEach(unit => {
            if (unit.level && unit.level === targetLevelId) {
                newUnits.push(unit);
                filterApplied = true;
            } 
        });

        if (newUnits.length > 0) {
            filteredContent.push({ ...section, units: newUnits });
        }
    });
    
    if (!filterApplied) {
        filteredContent = contentData.content;
    }
    
    renderContent(filteredContent, courseData);
    renderQuiz(quizData.quiz, courseData); 
    renderFlashcards(filteredContent);  
    
    console.log("课程加载成功！");
  } catch (error) {
    console.error("加载课程失败:", error);
    
    const courseTitle = courseData.title[currentLang];
    const moduleDomain = modules.find(m => m.id === courseData.moduleId).domain[currentLang];

    document.getElementById("contentArea").innerHTML = 
      `<div style="text-align:center;padding:40px;color:#666;">
        <div style="font-size:3em;margin-bottom:20px;">😕</div>
        <h3>${t('loading.failed')}</h3>
        <p>${t(currentLang === 'zh' ? '无法加载' : 'Could not load')} [${moduleDomain} - ${courseTitle}] ${t(currentLang === 'zh' ? '内容。' : 'content.')}</p>
        <p style="margin-top:10px;">${t(currentLang === 'zh' ? '请注意，需要您在 S3 中创建对应文件，如' : 'This requires a file in S3, e.g.,')} <code>data/module_${mid}${langSuffix}.json</code>。</p>
        <button onclick="selectCourse('${courseKey}')" style="margin-top:20px;padding:10px 20px;background:#667eea;color:white;border:none;border-radius:8px;cursor:pointer;">
          ${t('loading.retry')}
        </button>
      </div>`;
      
    document.getElementById("quizArea").innerHTML = 
      `<div style="text-align:center;padding:20px;color:#999;">${t(currentLang === 'zh' ? '练习题加载失败' : 'Quiz loading failed')}</div>`;
      
    document.getElementById("flashcardArea").innerHTML = 
      `<div style="text-align:center;padding:20px;color:#999;">${t(currentLang === 'zh' ? '闪卡加载失败' : 'Flashcard loading failed')}</div>`;
  }
}

function renderContent(content, courseData) {
  const area = document.getElementById("contentArea");
  area.innerHTML = "";
  
  const moduleDomain = modules.find(m => m.id === courseData.moduleId).domain[currentLang];
  const courseTitle = courseData.title[currentLang];

  const headerDiv = document.createElement("div");
  headerDiv.style.marginBottom = "30px";
  headerDiv.innerHTML = `<h3 style="color:#667eea;border-bottom:2px solid #667eea;padding-bottom:10px;margin-bottom:20px;">${moduleDomain} - ${courseTitle}</h3>`;
  area.appendChild(headerDiv);

  content.forEach((sec) => {
    const secDiv = document.createElement("div");
    secDiv.style.marginBottom = "30px";
    
    sec.units.forEach((u) => {
      const uDiv = document.createElement("div");
      uDiv.style.marginBottom = "20px";
      uDiv.innerHTML = `<h4 style="color:#764ba2;margin-bottom:15px;">📌 ${u.name}</h4>`;
      const list = document.createElement("ul");
      list.style.cssText = "line-height:1.8;padding-left:20px;";

      u.core_points.forEach((p) => {
        const reasonText = t(currentLang === 'zh' ? '原因' : 'Reason');
        const whenText = t(currentLang === 'zh' ? '时机' : 'When');
        const scenarioText = t(currentLang === 'zh' ? '情境' : 'Scenario');
        
        if (typeof p === "string") {
          list.innerHTML += `<li style="margin-bottom:10px;">${p}</li>`;
        } else {
          list.innerHTML += `
            <li style="margin-bottom:15px;padding:15px;background:#f8f9fa;border-radius:8px;border-left:4px solid ${courseData.level.color};">
              <strong style="color:${courseData.level.color};">🩺 ${p.what}</strong><br>
              <div style="margin-top:8px;"><span style="color:#764ba2;">📘 ${reasonText}：</span>${p.why}</div>
              <div style="margin-top:5px;"><span style="color:#764ba2;">⏰ ${whenText}：</span>${p.when}</div>
              <div style="margin-top:5px;"><span style="color:#764ba2;">🎯 ${scenarioText}：</span>${p.scenario}</div>
            </li>`;
        }
      });
      uDiv.appendChild(list);
      secDiv.appendChild(uDiv);
    });
    area.appendChild(secDiv);
  });
}

function renderQuiz(quiz, courseData) {
  const area = document.getElementById("quizArea");
  currentQuiz = quiz;
  area.innerHTML = "";
  
  area.innerHTML = `<input type="hidden" id="currentCourseKey" value="${courseData.courseKey}">`;
  
  quiz.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "quiz-question";
    
    if (q.type === "scenario_chain" && q.steps) {
      let stepsHtml = "";
      q.steps.forEach((step, stepIndex) => {
        stepsHtml += `
          <div style="margin-top:15px;padding:10px;background:white;border-radius:6px;">
            <p><strong>步骤 ${step.step}：</strong></p>
            ${step.options.map((opt) => 
              `<label>
                <input type="radio" name="q${i}_step${stepIndex}" value="${opt.charAt(0)}"> ${opt}
              </label>`
            ).join("")}
            <div id="feedback${i}_step${stepIndex}" class="feedback" style="display:none;"></div>
          </div>
        `;
      });
      
      div.innerHTML = `
        <p><strong>第 ${i + 1} 题：${q.question}</strong></p>
        ${stepsHtml}
        <div id="feedback${i}" class="feedback" style="display:none;"></div>
      `;
    }
    else if (q.type === "multi") {
      div.innerHTML = `
        <p><strong>第 ${i + 1} 题（多选）：${q.question}</strong></p>
        ${q.options.map((opt) => 
          `<label>
            <input type="checkbox" name="q${i}" value="${opt.charAt(0)}"> ${opt}
          </label>`
        ).join("")}
        <div id="feedback${i}" class="feedback" style="display:none;"></div>
      `;
    }
    else {
      div.innerHTML = `
        <p><strong>第 ${i + 1} 题：${q.question}</strong></p>
        ${q.options.map((opt) => 
          `<label>
            <input type="radio" name="q${i}" value="${opt.charAt(0)}"> ${opt}
          </label>`
        ).join("")}
        <div id="feedback${i}" class="feedback" style="display:none;"></div>
      `;
    }
    
    area.appendChild(div);
  });

  const btn = document.createElement("button");
  btn.textContent = t("quiz.submit");
  btn.className = "submit-btn";
  btn.onclick = submitQuiz;
  area.appendChild(btn);
}

function submitQuiz() {
  const currentCourseKey = document.getElementById("currentCourseKey")?.value;
  if (!currentCourseKey) return; 
  
  let score = 0;
  let totalQuestions = 0;
  let answered = 0;
  
  currentQuiz.forEach((q, i) => {
    const fb = document.getElementById(`feedback${i}`);
    
    if (q.type === "scenario_chain" && q.steps) {
      let allStepsCorrect = true;
      let allStepsAnswered = true;
      
      q.steps.forEach((step, stepIndex) => {
        totalQuestions++;
        const selected = document.querySelector(`input[name='q${i}_step${stepIndex}']:checked`);
        const stepFb = document.getElementById(`feedback${i}_step${stepIndex}`);
        
        if (!selected) {
          allStepsAnswered = false;
          stepFb.style.display = "block";
          stepFb.textContent = t("quiz.selectAnswer");
          stepFb.className = "feedback";
          stepFb.style.background = "#fff3cd";
          stepFb.style.color = "#856404";
          stepFb.style.borderLeft = "4px solid #ffc107";
          return;
        }
        
        answered++;
        stepFb.style.display = "block";
        
        if (selected.value === step.answer) {
          score++;
          stepFb.textContent = t("quiz.correct");
          stepFb.className = "feedback correct";
        } else {
          allStepsCorrect = false;
          stepFb.textContent = `${t("quiz.correctAnswer")} ${step.answer}`;
          stepFb.className = "feedback incorrect";
        }
      });
      
      if (allStepsAnswered) {
        fb.style.display = "block";
        if (allStepsCorrect) {
          fb.textContent = `✅ ${t("quiz.correct")}！${q.explanation || ''}`;
          fb.className = "feedback correct";
        } else {
          fb.textContent = `💡 ${q.explanation || ''}`;
          fb.className = "feedback";
          fb.style.background = "#e3f2fd";
          fb.style.color = "#1565c0";
          fb.style.borderLeft = "4px solid #2196f3";
        }
      }
    }
    else if (q.type === "multi") {
      totalQuestions++;
      const checkboxes = document.querySelectorAll(`input[name='q${i}']:checked`);
      const selectedValues = Array.from(checkboxes).map(cb => cb.value);
      
      if (selectedValues.length === 0) {
        fb.style.display = "block";
        fb.textContent = t("quiz.selectAtLeastOne");
        fb.className = "feedback";
        fb.style.background = "#fff3cd";
        fb.style.color = "#856404";
        fb.style.borderLeft = "4px solid #ffc107";
        return;
      }
      
      answered++;
      fb.style.display = "block";
      
      const correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];
      const isCorrect = selectedValues.length === correctAnswers.length && 
                       selectedValues.every(v => correctAnswers.includes(v));
      
      if (isCorrect) {
        score++;
        fb.textContent = t("quiz.correct");
        fb.className = "feedback correct";
      } else {
        fb.textContent = `${t("quiz.correctAnswer")}${correctAnswers.join(', ')}。${q.explanation || ''}`;
        fb.className = "feedback incorrect";
      }
    }
    else {
      totalQuestions++;
      const selected = document.querySelector(`input[name='q${i}']:checked`);
      
      if (!selected) {
        fb.style.display = "block";
        fb.textContent = t("quiz.selectAnswer");
        fb.className = "feedback";
        fb.style.background = "#fff3cd";
        fb.style.color = "#856404";
        fb.style.borderLeft = "4px solid #ffc107";
        return;
      }
      
      answered++;
      fb.style.display = "block";
      
      if (selected.value === q.answer) {
        score++;
        fb.textContent = t("quiz.correct");
        fb.className = "feedback correct";
      } else {
        fb.textContent = `${t("quiz.correctAnswer")}${q.answer}。${q.explanation || ''}`;
        fb.className = "feedback incorrect";
      }
    }
  });
  
  if (answered < totalQuestions) {
    alert(t("quiz.completeAll"));
    return;
  }
  
  const pct = Math.round((score / totalQuestions) * 100);
  
  const resultMsg = pct === 100 ? t("quiz.perfect") : 
                    pct >= 80 ? t("quiz.great") :
                    pct >= 60 ? t("quiz.good") :
                    t("quiz.keepLearning");
  
  setTimeout(() => {
    alert(`${resultMsg}\n\n${t("quiz.score")}：${pct}% (${score}/${totalQuestions})`);
  }, 100);
  
  progressData[currentCourseKey] = pct;
  localStorage.setItem("progressData", JSON.stringify(progressData));
  
  loadModules(); 
  renderDashboard();
  checkAchievements();
}

function renderFlashcards(content) {
  const area = document.getElementById("flashcardArea");
  area.innerHTML = "";
  const cards = [];

  content.forEach((sec) => {
    sec.units.forEach((u) => {
      u.core_points.forEach((p) => {
        let front = "";
        let back = "";
        
        const reasonText = t(currentLang === 'zh' ? '原因' : 'Reason');
        const whenText = t(currentLang === 'zh' ? '时机' : 'When');
        const scenarioText = t(currentLang === 'zh' ? '情境' : 'Scenario');
        
        if (typeof p === "string") {
          const parts = p.split("：");
          front = parts[0];
          back = p;
        } else {
          front = p.what;
          
          back = `<strong>📘 ${reasonText}</strong>：${p.why}<br><strong>⏰ ${whenText}</strong>：${p.when}<br><strong>🎯 ${scenarioText}：</strong>${p.scenario}`;
        }
        
        const card = document.createElement("div");
        card.className = "flashcard";
        card.dataset.front = front;
        card.dataset.back = back;
        
        const frontContent = document.createElement("div");
        frontContent.className = "flashcard-content flashcard-front";
        frontContent.innerHTML = front;
        
        const hint = document.createElement("div");
        hint.className = "flashcard-hint";
        hint.textContent = t("flashcard.clickDetail");
        
        card.appendChild(frontContent);
        card.appendChild(hint);
        
        card.onclick = function() {
          this.classList.toggle("flipped");
          
          if (this.classList.contains("flipped")) {
            frontContent.className = "flashcard-content flashcard-back";
            frontContent.innerHTML = this.dataset.back; 
          } else {
            frontContent.className = "flashcard-content flashcard-front";
            frontContent.innerHTML = this.dataset.front; 
          }
        };
        
        cards.push(card);
      });
    });
  });
  
  if (cards.length === 0) {
    area.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#666;grid-column:1/-1;">
        <div style="font-size:4em;margin-bottom:20px;">🎴</div>
        <h3 style="color:#667eea;margin-bottom:10px;">${t('flashcard.noCards')}</h3>
        <p style="font-size:1.1em;">${t('flashcard.selectCourse')}</p>
        <p style="margin-top:15px;font-size:0.95em;opacity:0.8;">${t('flashcard.helpMemory')}</p>
      </div>`;
  } else {
    const header = document.createElement("div");
    header.style.cssText = "grid-column:1/-1;margin-bottom:10px;padding:15px;background:linear-gradient(135deg,#e3f2fd 0%,#f3e5f5 100%);border-radius:10px;text-align:center;";
    header.innerHTML = `
      <div style="font-size:1.1em;font-weight:600;color:#667eea;">📚 ${t('flashcard.total')} ${cards.length} ${t('flashcard.cards')}</div>
      <div style="font-size:0.9em;color:#666;margin-top:5px;">${t('flashcard.clickToFlip')}</div>
    `;
    area.appendChild(header);
    
    cards.forEach((c) => area.appendChild(c));
  }
}

function renderDashboard() {
  const area = document.getElementById("dashboardArea");
  
  const { completedCount, progress: totalProgress, total: totalCourses } = getUserLevelProgress();
  const avgScore = Object.values(progressData).length > 0 
    ? Math.round(Object.values(progressData).reduce((a,b)=>a+b,0) / Object.values(progressData).length) 
    : 0;
  const totalStudyMinutes = Object.values(studyTime).reduce((a,b)=>a+b,0);
  const studyHours = Math.floor(totalStudyMinutes / 60);
  const studyMins = totalStudyMinutes % 60;
  const achievementCount = Object.keys(achievements).length;
  
  area.innerHTML = `
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">${completedCount}/${totalCourses}</div>
        <div class="stat-label">${t('dashboard.completedModules')}</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <div class="stat-icon">📈</div>
        <div class="stat-value">${totalProgress}%</div>
        <div class="stat-label">${t('dashboard.currentLevelProgress')}</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value">${studyHours}h ${studyMins}m</div>
        <div class="stat-label">${t('dashboard.studyTime')}</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${achievementCount}/6</div>
        <div class="stat-label">${t('dashboard.achievements')}</div>
      </div>
    </div>
    
    <h3 style="margin:30px 0 20px 0;color:#667eea;">📈 ${t('dashboard.progressDetail')}</h3>
    <div class="chart-container">
      ${renderProgressChart()}
    </div>
    
    <h3 style="margin:30px 0 20px 0;color:#667eea;">🏆 ${t('dashboard.achievementWall')}</h3>
    <div class="achievement-grid">
      ${achievementsList.map(ach => `
        <div class="achievement-badge ${achievements[ach.id] ? 'unlocked' : ''}">
          <div class="achievement-icon">${ach.icon}</div>
          <div class="achievement-name">${ach.name[currentLang]}</div>
          ${achievements[ach.id] ? 
            `<div style="font-size:0.8em;margin-top:5px;">✅ ${t('dashboard.unlocked')}</div>` : 
            `<div style="font-size:0.8em;margin-top:5px;opacity:0.6;">🔒 ${t('dashboard.locked')}</div>`}
        </div>
      `).join('')}
    </div>
    
    <h3 style="margin:30px 0 20px 0;color:#667eea;">💡 ${t('dashboard.studySuggestion')}</h3>
    <div style="background:#f8f9fa;padding:20px;border-radius:10px;border-left:4px solid #667eea;">
      ${getStudySuggestion(completedCount, avgScore, totalCourses)}
    </div>
  `;
  
  checkAchievements();
}

function renderProgressChart() {
  let html = '<div style="display:flex;flex-direction:column;gap:15px;">';
  allCourses.forEach(c => {
    const progress = getCourseProgress(c.courseKey);
    const color = progress >= 80 ? '#28a745' : progress >= 60 ? '#ffc107' : '#dc3545';
    const domain = modules.find(m => m.id === c.moduleId).domain[currentLang];
    const levelTitle = c.title[currentLang];
    
    html += `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-weight:600;">${c.level.icon} ${domain} - ${levelTitle}</span>
          <span style="color:${color};font-weight:bold;">${progress}%</span>
        </div>
        <div class="progress-container" style="height:12px;">
          <div class="progress-fill" style="width:${progress}%;background:${c.level.color};"></div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  return html;
}

function getStudySuggestion(completed, avgScore, total) {
  if (completed === 0) {
    return `
      <p style="line-height:1.8;">🌟 <strong>${t(currentLang === 'zh' ? '欢迎开始你的学习之旅！' : 'Welcome to your learning journey!')}</strong></p>
      <p style="margin-top:10px;">${t(currentLang === 'zh' ? '建议从「生活照护 - 初级」课程开始，这是护理技能的起点。点击左侧导航栏选择课程开始学习吧！' : 'It is recommended to start with the "Daily Care - Junior Level" course, the starting point of nursing skills. Click on the left navigation bar to select a course and start learning!')}</p>
    `;
  } else if (completed < total) {
    const nextCourse = allCourses.find(c => getCourseProgress(c.courseKey) < 100 && !isCourseLocked(c.courseKey));
    
    if (nextCourse) {
        const domain = modules.find(m => m.id === nextCourse.moduleId).domain[currentLang];
        const levelTitle = nextCourse.title[currentLang];
        
        return `
            <p style="line-height:1.8;">💪 <strong>${t(currentLang === 'zh' ? '继续前进！' : 'Keep going!')}</strong></p>
            <p style="margin-top:10px;">${t(currentLang === 'zh' ? `你已完成 ${completed}/${total} 门课程。下一步建议挑战 「${domain} - ${levelTitle}」 课程，完成本课程后即可解锁下一等级！` : `You have completed ${completed}/${total} courses. Your next recommended challenge is the '${domain} - ${levelTitle}' course. Complete this to unlock the next level!`)}</p>
        `;
    } else {
        const lockedCourse = allCourses.find(c => isCourseLocked(c.courseKey));
        const prevCourse = allCourses[allCourses.findIndex(c => c.courseKey === lockedCourse.courseKey) - 1];
        
        const prevDomain = modules.find(m => m.id === prevCourse.moduleId).domain[currentLang];
        const prevLevelTitle = prevCourse.title[currentLang];
        
        return `
            <p style="line-height:1.8;">💡 <strong>${t(currentLang === 'zh' ? '解锁下一等级！' : 'Unlock the next level!')}</strong></p>
            <p style="margin-top:10px;">${t(currentLang === 'zh' ? `你的学习进度卡在了 「${prevDomain} - ${prevLevelTitle}」 课程。请确保该课程的测验成绩达到 100% 才能解锁下一个等级。` : `Your progress is stuck at the '${prevDomain} - ${prevLevelTitle}' course. Please ensure your quiz score for this course reaches 100% to unlock the next level.`)}</p>
        `;
    }
  } else {
    return `
      <p style="line-height:1.8;">🎉 <strong>${t(currentLang === 'zh' ? '恭喜！你已完成所有模块！' : 'Congratulations! You have completed all modules!')}</strong></p>
      <p style="margin-top:10px;">${t(currentLang === 'zh' ? `平均成绩 ${avgScore}%，表现优秀！建议定期使用闪卡功能复习，保持技能熟练度。也可以通过小护助教提问来深化理解。` : `With an average score of ${avgScore}%, your performance is excellent! We recommend using the flashcard feature regularly to review and maintain skill proficiency. You can also use the AI assistant to deepen your understanding.`)}</p>
    `;
  }
}

function showTab(tab) {
  ["dashboard", "content", "quiz", "flashcard"].forEach((t) => {
    const tabEl = document.getElementById(`${t}-tab`);
    if (tabEl) {
      tabEl.style.display = t === tab ? "block" : "none";
    }
  });
  
  document.querySelectorAll(".tab-button").forEach((b) => b.classList.remove("active"));
  const activeBtn = Array.from(document.querySelectorAll(".tab-button")).find(
    b => b.getAttribute('onclick').includes(`showTab('${tab}')`)
  );
  if (activeBtn) activeBtn.classList.add("active");
}

function askQuickQuestion(question) {
    const input = document.getElementById("userInput");
    input.value = question; 
    askAssistant(); 
}

function toggleAssistant() {
  const el = document.getElementById("assistant-window");
  
  if (el.style.display !== "flex") {
      // 修复: 确保点开时重新渲染历史记录，从而显示推荐问题
      renderChatHistory();
  }
  el.style.display = el.style.display === "flex" ? "none" : "flex";
}

function askAssistant() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (!msg) return;

  const chat = document.getElementById("chatBox");
  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.textContent = msg;
  chat.appendChild(userMsg);
  
  chatHistory.push({ role: "user", content: msg });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  input.value = "";
  
  const quickQuestionsContainer = document.getElementById("quickQuestions");
  if (quickQuestionsContainer) quickQuestionsContainer.style.display = 'none';

  const aiMsg = document.createElement("div");
  aiMsg.className = "msg ai";
  chat.appendChild(aiMsg);
  aiMsg.innerHTML = currentLang === 'zh' ? "🧠 正在思考..." : "🧠 Thinking...";
  chat.scrollTop = chat.scrollHeight;

  const lowerMsg = msg.toLowerCase();
  
  let replyContent = "";
  let matchedKey = null;

  // 1. 尝试匹配预设问题
  for (const q of quickQuestions) {
      const translatedQ = t(q.key).toLowerCase();
      // 使用 includes 检查，确保点击按钮 (精确匹配) 或手动输入 (包含关键词) 都能触发
      if (lowerMsg.includes(q.question.toLowerCase()) || lowerMsg.includes(translatedQ)) {
          matchedKey = q.key;
          break;
      }
  }

  if (matchedKey) {
      // 匹配到预设问题，使用高质量硬编码答案
      const answerData = structuredAnswers[matchedKey];
      replyContent = currentLang === 'zh' ? answerData.zh : answerData.en;
      
      const recommendationData = answerData.recommendation;
      const recommendation = allCourses.find(c => c.recommendation === recommendationData.module);

      aiMsg.innerHTML = formatMarkdownToHTML(replyContent); 

      // 添加模块推荐
      if (recommendation) {
        const domain = currentLang === 'zh' ? recommendationData.domain_zh : modules.find(m => m.id === recommendation.moduleId)?.domain.en || '';
        const level = currentLang === 'zh' ? recommendationData.level_zh : recommendation.level.name.en || '';
        const courseKey = recommendation.courseKey;
        const linkText = currentLang === 'zh' ? '点击查看课程' : 'Click to view course';
        
        const recText = currentLang === 'zh'
            ? `<div style="margin-top:15px;padding:12px;background:#f3e5ff;border-radius:8px;border-left:4px solid #764ba2;">📚 **学习路径推荐：** 请参阅 **${domain}** 领域的 **${level}** 课程。 <button onclick="selectCourse('${courseKey}')" style="margin-left:10px; padding: 4px 8px; border:none; background:#7c3aed; color:white; border-radius:5px; cursor:pointer; font-size:0.9em; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s;">${linkText}</button></div>`
            : `<div style="margin-top:15px;padding:12px;background:#f3e5ff;border-radius:8px;border-left:4px solid #764ba2;">📚 **Recommended Path:** Please refer to the **${domain}** domain's **${level}** course. <button onclick="selectCourse('${courseKey}')" style="margin-left:10px; padding: 4px 8px; border:none; background:#7c3aed; color:white; border-radius:5px; cursor:pointer; font-size:0.9em; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s;">${linkText}</button></div>`;
            
        aiMsg.innerHTML += recText;
      }

  } else {
      // 未匹配到预设问题，给出默认引导
      
      const guidance = currentLang === 'zh' ? "我明白了你的提问，但目前我只能对预设的护理问题提供结构化指导，请尝试点击上方的按钮提问。" : "I understand your query, but currently I can only offer structured guidance for the pre-set nursing questions. Please try clicking one of the buttons above.";
      
      aiMsg.innerHTML = formatMarkdownToHTML(guidance);
      
      // 强制重新渲染历史记录，以便再次显示推荐问题
      setTimeout(renderChatHistory, 50); 
  }


  chat.scrollTop = chat.scrollHeight;
  
  // 记录到 chatHistory 时，记录最终的 HTML 内容，以便后续渲染
  chatHistory.push({ role: "ai", content: aiMsg.innerHTML }); 
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  checkAchievements();

  const spokenText = aiMsg.textContent; // 确保只读出文本内容
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(spokenText);
    u.lang = currentLang === 'zh' ? "zh-CN" : "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
}

function renderChatHistory() {
  const chat = document.getElementById("chatBox");
  const quickQuestionsContainer = document.getElementById("quickQuestions");
  const questionList = document.getElementById("questionList");
  
  chat.innerHTML = "";
  if (questionList) questionList.innerHTML = "";
  
  if (chatHistory.length === 0) {
    // 强制显示欢迎语和问题列表
    chat.innerHTML = `
      <div style="text-align:center;padding:20px;color:#999;">
        <div style="font-size:3em;margin-bottom:10px;">💬</div>
        <p>${t(currentLang === 'zh' ? '你好！我是小护助教' : 'Hello! I am your AI Assistant.')}</p>
        <p style="font-size:0.9em;margin-top:10px;">${t(currentLang === 'zh' ? '有任何护理问题都可以问我哦～' : 'Feel free to ask me any nursing questions.')}</p>
      </div>
    `;
    
    if (quickQuestionsContainer) quickQuestionsContainer.style.display = 'block';
    
    if (questionList) {
        quickQuestions.forEach(q => {
            const btn = document.createElement('button');
            btn.textContent = t(q.key); 
            btn.className = 'quick-question-btn';
            btn.onclick = () => askQuickQuestion(q.question); 
            questionList.appendChild(btn);
        });
    }
    
    return;
  }
  
  // 如果有历史记录，隐藏问题按钮
  if (quickQuestionsContainer) quickQuestionsContainer.style.display = 'none';

  chatHistory.forEach((h) => {
    const div = document.createElement("div");
    div.className = `msg ${h.role}`;
    div.innerHTML = h.content; 
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}

function clearHistory() {
  const confirmClear = window.confirm(currentLang === 'zh' ? "确定要清除所有聊天记录吗？" : "Are you sure you want to clear all chat history?");
  if (confirmClear) {
    chatHistory = [];
    localStorage.removeItem("chatHistory");
    renderChatHistory(); // 清除后重新渲染，将显示预设问题列表
  }
}


function getModuleRecommendation(topic) {
    switch(topic) {
        case "Pressure ulcer prevention":
            return { domain: "生活照护", level: "中级", module: "特殊清洁与管路护理" };
        case "Diabetes diet":
            return { domain: "基础护理", level: "中级", module: "基础生命体征护理" };
        case "Fall prevention":
            return { domain: "功能维护", level: "高级", module: "功能维护 - 肢体活动与平衡" };
        case "Palliative Care":
            return { domain: "心理照护", level: "高级", module: "心理照护 - 沟通与情绪支持" };
        case "Bedside Transfer":
            return { domain: "生活照护", level: "高级", module: "功能维护 - 翻身/进食" }; 
        case "General home care":
            return null;
        default:
            return null;
    }
}

// 这是一个极简版的 Markdown 渲染，用于美化硬编码的回答
function formatMarkdownToHTML(md) {
    if (!md) return "";
    
    // 清理 markdown 格式
    md = md.replace(/^[\s\n]+|[\s\n]+$/g, "");
    md = md.replace(/\r/g, "").replace(/\n{2,}/g, "\n"); 

    let html = md
      // 标题/结构
      .replace(/^## (.+)$/gm, "<h4 style='font-size:1.1em; margin-top: 10px; margin-bottom: 5px; color:#555;'>$1</h4>")
      .replace(/^### (.+)$/gm, "<p style='font-weight: bold; margin-top: 8px;'>$1</p>")
      // 列表项
      .replace(/^- (.+)$/gm, "<li>$1</li>") 
      .replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>") 
      
      // 包装列表
      .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
      .replace(/<\/ul><ul>/g, '') 
      
      // 文本样式
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") 
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/•\s?/g, "• ") 
      .replace(/\n/g, "<br>"); 

    // 样式化核心标题 (用于硬编码的答案)
    html = html
      .replace(/【(.*?)】/g, "<strong>【$1】</strong>")
      .replace(/<h4>\#\#\s总结.*?<\/h4>/gi, "<h4 style='color:#2563eb;'>📋 总结</h4>");

    return `<div style="line-height: 1.4; padding: 5px 0;">${html}</div>`;
}