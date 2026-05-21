/**
 * Auth utilities — Đăng nhập/đăng xuất qua localStorage
 * Learning state: streak, XP, SRS scheduling, daily goal, auto-cert
 */

const KEYS = { USER: 'starlent_user', LEARNING: 'starlent_learning', ONBOARDED: 'starlent_onboarded' };
const APP_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function loginUser(user) {
  const { password, ...safe } = user;
  localStorage.setItem(KEYS.USER, JSON.stringify(safe));
  return safe;
}
export function logoutUser() { localStorage.removeItem(KEYS.USER); }
export function getCurrentUser() {
  try { const d = localStorage.getItem(KEYS.USER); return d ? JSON.parse(d) : null; }
  catch { return null; }
}
export function isAuthenticated() { return getCurrentUser() !== null; }
export function getUserRole() { const u = getCurrentUser(); return u ? u.role : null; }

/* --- Learning State --- */
const DEFAULT_DAILY_GOAL = 3;

function defaultState() { return {
  completedItems:[], completedModules:[], completedCourses:[],
  reviewedCards:{}, quizAttempts:{}, xpEarnedForItems:[],
  xp:0, streak:0, lastStudyDate:null, unlockedBadges:[], offlineDownloads:[],
  dailyGoal: DEFAULT_DAILY_GOAL,
  dailyProgress: {},
  studyDates: [],
  localCerts: [],
};}

export function getLearningState() {
  try {
    const d = localStorage.getItem(KEYS.LEARNING);
    const s = d ? JSON.parse(d) : defaultState();
    if (typeof s.dailyGoal !== 'number') s.dailyGoal = DEFAULT_DAILY_GOAL;
    if (!s.dailyProgress) s.dailyProgress = {};
    if (!Array.isArray(s.studyDates)) s.studyDates = [];
    if (!Array.isArray(s.localCerts)) s.localCerts = [];
    return s;
  } catch { return defaultState(); }
}
export function saveLearningState(s) { localStorage.setItem(KEYS.LEARNING, JSON.stringify(s)); }
export function updateLearningState(updates) { const s = { ...getLearningState(), ...updates }; saveLearningState(s); return s; }
export function isItemCompleted(id) { return getLearningState().completedItems.includes(id); }

function todayISO() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const yyyy = parts.find((p) => p.type === 'year')?.value || '1970';
  const mm = parts.find((p) => p.type === 'month')?.value || '01';
  const dd = parts.find((p) => p.type === 'day')?.value || '01';
  return `${yyyy}-${mm}-${dd}`;
}
function addDays(dateISO, days) {
  const [y, m, d] = String(dateISO).split('-').map((x) => Number(x));
  const utcNoon = new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1, 12, 0, 0));
  utcNoon.setUTCDate(utcNoon.getUTCDate() + Number(days || 0));
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(utcNoon);
  const yyyy = parts.find((p) => p.type === 'year')?.value || '1970';
  const mm = parts.find((p) => p.type === 'month')?.value || '01';
  const dd = parts.find((p) => p.type === 'day')?.value || '01';
  return `${yyyy}-${mm}-${dd}`;
}

export function completeItem(itemId, xpAmount = 10) {
  const s = getLearningState();
  if (!s.completedItems.includes(itemId)) s.completedItems.push(itemId);
  if (!s.xpEarnedForItems.includes(itemId)) { s.xpEarnedForItems.push(itemId); s.xp = (s.xp||0)+xpAmount; }
  const today = todayISO();
  if (s.lastStudyDate !== today) {
    const yest = addDays(today, -1);
    s.streak = (s.lastStudyDate===yest) ? (s.streak||0)+1 : 1;
    s.lastStudyDate = today;
  }
  if (!s.studyDates.includes(today)) s.studyDates = [...s.studyDates, today].slice(-30);
  s.dailyProgress = { ...s.dailyProgress, [today]: (s.dailyProgress[today] || 0) + 1 };
  saveLearningState(s); return s;
}

export function completeModule(id) { const s=getLearningState(); if(!s.completedModules.includes(id)){s.completedModules.push(id);saveLearningState(s);} return s; }

export function completeCourse(courseId, meta = {}) {
  const s = getLearningState();
  if (!s.completedCourses.includes(courseId)) s.completedCourses.push(courseId);
  const existing = s.localCerts.find(c => c.courseId === courseId);
  if (!existing) {
    const user = getCurrentUser();
    const seq = String(s.localCerts.length + 1).padStart(4, '0');
    s.localCerts.push({
      id: `cert_local_${courseId}_${Date.now()}`,
      userId: user?.id || 'u_local',
      courseId,
      courseName: meta.courseName || 'Khoá học',
      userName: user?.name || 'Học viên',
      completionDate: todayISO(),
      score: meta.score || 85,
      duration: meta.duration || 60,
      verificationCode: `SL-CERT-${new Date().getFullYear()}-L${seq}`,
    });
  }
  saveLearningState(s);
  return s;
}

const SRS_INTERVAL_DAYS = { forgot: 1, hard: 3, ok: 7, easy: 14 };
export function saveCardReview(cardId, rating) {
  const s = getLearningState();
  const today = todayISO();
  const interval = SRS_INTERVAL_DAYS[rating] ?? 3;
  s.reviewedCards = {
    ...s.reviewedCards,
    [cardId]: { rating, lastReviewedAt: today, nextReviewAt: addDays(today, interval) },
  };
  saveLearningState(s);
  return s;
}

export function getDueCards(allCards) {
  const { reviewedCards = {} } = getLearningState();
  const today = todayISO();
  return allCards.filter(c => {
    const r = reviewedCards[c.id];
    if (!r) return true;
    if (typeof r === 'string') return r === 'forgot' || r === 'hard';
    return !r.nextReviewAt || r.nextReviewAt <= today;
  });
}

export function saveQuizAttempt(qid, score, total) {
  const s=getLearningState(); const passed=(score/total)>=0.7;
  if(!s.quizAttempts[qid]) s.quizAttempts[qid]={attempts:0,bestScore:0,passed:false};
  s.quizAttempts[qid].attempts+=1; s.quizAttempts[qid].bestScore=Math.max(s.quizAttempts[qid].bestScore,score);
  s.quizAttempts[qid].passed=s.quizAttempts[qid].passed||passed;
  saveLearningState(s); return s;
}

export function setDailyGoal(n) {
  const s = getLearningState();
  s.dailyGoal = Math.max(1, Math.min(20, Number(n) || DEFAULT_DAILY_GOAL));
  saveLearningState(s);
  return s;
}
export function getDailyProgress() {
  const s = getLearningState();
  return { done: s.dailyProgress?.[todayISO()] || 0, goal: s.dailyGoal };
}

export function getLast7DaysStreak() {
  const { studyDates = [] } = getLearningState();
  const set = new Set(studyDates);
  const today = todayISO();
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, -(6 - i));
    return { date: d, studied: set.has(d) };
  });
}

export function setOnboarded() { localStorage.setItem(KEYS.ONBOARDED, 'true'); }
export function isOnboarded() { return localStorage.getItem(KEYS.ONBOARDED)==='true'; }
