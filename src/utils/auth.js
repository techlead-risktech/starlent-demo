/**
 * Auth utilities — Đăng nhập/đăng xuất qua localStorage
 */

const KEYS = { USER: 'starlent_user', LEARNING: 'starlent_learning', ONBOARDED: 'starlent_onboarded' };

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
function defaultState() { return {
  completedItems:[], completedModules:[], completedCourses:[],
  reviewedCards:{}, quizAttempts:{}, xpEarnedForItems:[],
  xp:0, streak:0, lastStudyDate:null, unlockedBadges:[], offlineDownloads:[],
};}

export function getLearningState() {
  try { const d = localStorage.getItem(KEYS.LEARNING); return d ? JSON.parse(d) : defaultState(); }
  catch { return defaultState(); }
}
export function saveLearningState(s) { localStorage.setItem(KEYS.LEARNING, JSON.stringify(s)); }
export function updateLearningState(updates) { const s = { ...getLearningState(), ...updates }; saveLearningState(s); return s; }
export function isItemCompleted(id) { return getLearningState().completedItems.includes(id); }

/** Đánh dấu item hoàn thành — KHÔNG thêm XP trùng lặp */
export function completeItem(itemId, xpAmount = 10) {
  const s = getLearningState();
  if (!s.completedItems.includes(itemId)) s.completedItems.push(itemId);
  if (!s.xpEarnedForItems.includes(itemId)) { s.xpEarnedForItems.push(itemId); s.xp = (s.xp||0)+xpAmount; }
  const today = new Date().toISOString().split('T')[0];
  if (s.lastStudyDate !== today) {
    const yest = new Date(Date.now()-86400000).toISOString().split('T')[0];
    s.streak = (s.lastStudyDate===yest) ? (s.streak||0)+1 : 1;
    s.lastStudyDate = today;
  }
  saveLearningState(s); return s;
}
export function completeModule(id) { const s=getLearningState(); if(!s.completedModules.includes(id)){s.completedModules.push(id);saveLearningState(s);} return s; }
export function completeCourse(id) { const s=getLearningState(); if(!s.completedCourses.includes(id)){s.completedCourses.push(id);saveLearningState(s);} return s; }
export function saveCardReview(cardId, rating) { const s=getLearningState(); s.reviewedCards[cardId]=rating; saveLearningState(s); return s; }
export function saveQuizAttempt(qid, score, total) {
  const s=getLearningState(); const passed=(score/total)>=0.7;
  if(!s.quizAttempts[qid]) s.quizAttempts[qid]={attempts:0,bestScore:0,passed:false};
  s.quizAttempts[qid].attempts+=1; s.quizAttempts[qid].bestScore=Math.max(s.quizAttempts[qid].bestScore,score);
  s.quizAttempts[qid].passed=s.quizAttempts[qid].passed||passed;
  saveLearningState(s); return s;
}
export function setOnboarded() { localStorage.setItem(KEYS.ONBOARDED, 'true'); }
export function isOnboarded() { return localStorage.getItem(KEYS.ONBOARDED)==='true'; }
