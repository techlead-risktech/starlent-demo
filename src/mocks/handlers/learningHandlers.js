import { http, HttpResponse } from 'msw';
import { courses } from '../../data/mockCourses.js';
import {
  completeCourse,
  completeItem,
  completeModule,
  getCurrentUser,
  getLearningState,
  saveCardReview,
  saveQuizAttempt,
} from '../../utils/auth.js';
import { jsonError, requireAuthUser } from './_utils.js';
import { ensureStateHydrated } from './_persistentState.js';

const API_BASE = '/api/v1';

function findCourseAndModule(courseId, moduleId) {
  const course = courses.find((item) => item.id === courseId);
  const module = course?.modules.find((item) => item.id === moduleId);
  return { course, module };
}

function syncCompletionByModule(courseId, moduleId) {
  const { course, module } = findCourseAndModule(courseId, moduleId);
  if (!course || !module) return;

  const state = getLearningState();
  const moduleDone = module.items.every((item) => state.completedItems.includes(item.id) || state.completedItems.includes(item.contentId));
  if (moduleDone && !state.completedModules.includes(moduleId)) {
    completeModule(moduleId);
  }

  const latestState = getLearningState();
  const allModulesDone = course.modules.every((item) => latestState.completedModules.includes(item.id));
  if (allModulesDone && !latestState.completedCourses.includes(courseId)) {
    completeCourse(courseId, { courseName: course.title, duration: course.duration });
  }
}

export const learningHandlers = [
  http.post(`${API_BASE}/learning/complete-item`, async ({ request }) => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const body = await request.json().catch(() => null);
    const itemId = body?.itemId;
    const xpAmount = Number(body?.xpAmount || 0);
    const moduleId = body?.moduleId || null;
    const courseId = body?.courseId || null;

    if (!itemId) {
      return jsonError(422, 'VALIDATION_FAILED', 'itemId là bắt buộc.');
    }

    const updatedState = completeItem(itemId, xpAmount);
    if (moduleId && courseId) syncCompletionByModule(courseId, moduleId);

    return HttpResponse.json({
      ok: true,
      itemId,
      xpAmount,
      learningState: getLearningState(),
      meta: {
        generatedAt: new Date().toISOString(),
      },
      legacy: {
        previousXp: updatedState.xp,
      },
    });
  }),

  http.post(`${API_BASE}/learning/quiz-attempt`, async ({ request }) => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const body = await request.json().catch(() => null);
    const quizId = body?.quizId;
    const score = Number(body?.score);
    const total = Number(body?.total);

    if (!quizId || Number.isNaN(score) || Number.isNaN(total) || total <= 0) {
      return jsonError(422, 'VALIDATION_FAILED', 'quizId, score, total không hợp lệ.');
    }

    const state = saveQuizAttempt(quizId, score, total);
    return HttpResponse.json({
      ok: true,
      quizId,
      score,
      total,
      attempt: state.quizAttempts?.[quizId] || null,
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  }),

  http.post(`${API_BASE}/learning/card-review`, async ({ request }) => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const body = await request.json().catch(() => null);
    const cardId = body?.cardId;
    const rating = body?.rating;
    const validRatings = new Set(['forgot', 'hard', 'ok', 'easy']);
    if (!cardId || !validRatings.has(rating)) {
      return jsonError(422, 'VALIDATION_FAILED', 'cardId hoặc rating không hợp lệ.');
    }

    const state = saveCardReview(cardId, rating);
    return HttpResponse.json({
      ok: true,
      cardId,
      rating,
      review: state.reviewedCards?.[cardId] || null,
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  }),
];
