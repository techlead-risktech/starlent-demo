import { http, HttpResponse } from 'msw';
import { COURSE_STATUS, courses, getCourseProgress } from '../../data/mockCourses.js';
import { flashcards } from '../../data/mockContent.js';
import { getNotificationsForUser } from '../../data/mockChats.js';
import {
  getCurrentUser,
  getLearningState,
  getDailyProgress,
  getDueCards,
  getLast7DaysStreak,
  isOnboarded,
} from '../../utils/auth.js';
import { requireAuthUser } from './_utils.js';
import { ensureStateHydrated } from './_persistentState.js';

const API_BASE = '/api/v1';

function mapCourseCard(course, completedItems) {
  return {
    id: course.id,
    title: course.title,
    moduleCount: course.moduleCount || course.modules?.length || 0,
    dueDate: course.dueDate || null,
    required: !!course.required,
    progress: getCourseProgress(course, completedItems),
  };
}

function getQuickStartContentId() {
  const allCards = Object.values(flashcards).flatMap((f) => f.cards);
  const due = getDueCards(allCards);
  const pool = due.length > 0 ? due : allCards;
  const card = pool[Math.floor(Math.random() * pool.length)];
  if (!card) return null;
  const container = Object.values(flashcards).find((f) => f.cards.some((c) => c.id === card.id));
  return container?.id || null;
}

export const learnerHandlers = [
  http.get(`${API_BASE}/learner/home`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const learningState = getLearningState();
    const completedItems = learningState.completedItems || [];
    const daily = getDailyProgress();
    const streakDays = getLast7DaysStreak();
    const allCards = Object.values(flashcards).flatMap((f) => f.cards);
    const dueCount = getDueCards(allCards).length;
    const unreadNotifications = getNotificationsForUser(user.id).filter((n) => !n.read);

    const xp = learningState.xp || user.xp || 0;
    const level = Math.floor(xp / 500) + 1;
    const xpToNext = 500 - (xp % 500 || 0);

    const courseCards = courses
      .filter((course) => course.status === COURSE_STATUS.PUBLISHED)
      .map((course) => mapCourseCard(course, completedItems));
    const inProgress = courseCards.filter((course) => course.progress > 0 && course.progress < 100);
    const required = courseCards.filter((course) => course.required);

    return HttpResponse.json({
      userSummary: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      onboardingCompleted: isOnboarded(),
      stats: {
        streak: learningState.streak || user.streak || 0,
        xp,
        level,
        xpToNext,
        dailyDone: daily.done,
        dailyGoal: daily.goal,
        dueCount,
        last7Days: streakDays,
      },
      sections: {
        inProgressCourses: inProgress,
        requiredCourses: required,
      },
      notifications: {
        unreadCount: unreadNotifications.length,
        items: unreadNotifications.slice(0, 3),
      },
      actions: {
        quickStart: {
          type: 'flashcard',
          contentId: getQuickStartContentId(),
        },
      },
      meta: {
        source: 'mock-api',
        generatedAt: new Date().toISOString(),
      },
    });
  }),
];
