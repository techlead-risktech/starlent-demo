import { http, HttpResponse } from 'msw';
import { COURSE_STATUS, courses, getCourseProgress } from '../../data/mockCourses.js';
import { getCurrentUser, getLearningState } from '../../utils/auth.js';
import { jsonError, requireAuthUser } from './_utils.js';
import { ensureStateHydrated } from './_persistentState.js';

const API_BASE = '/api/v1';

function mapCourseSummary(course, completedItems) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    tags: course.tags || [],
    duration: course.duration,
    moduleCount: course.moduleCount || course.modules?.length || 0,
    rating: course.rating,
    dueDate: course.dueDate || null,
    required: !!course.required,
    createdAt: course.createdAt,
    progress: getCourseProgress(course, completedItems),
  };
}

function getCourseById(courseId) {
  return courses.find((course) => course.id === courseId && course.status === COURSE_STATUS.PUBLISHED);
}

function filterCoursesByQuery(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((course) => {
    const inTitle = course.title.toLowerCase().includes(q);
    const inTags = (course.tags || []).some((tag) => tag.toLowerCase().includes(q));
    return inTitle || inTags;
  });
}

export const coursesHandlers = [
  http.get(`${API_BASE}/learner/courses`, async () => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const learningState = getLearningState();
    const completedItems = learningState.completedItems || [];
    const courseList = courses
      .filter((course) => course.status === COURSE_STATUS.PUBLISHED)
      .map((course) => mapCourseSummary(course, completedItems));

    return HttpResponse.json({
      items: courseList,
      meta: {
        total: courseList.length,
        generatedAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${API_BASE}/explore/courses`, async ({ request }) => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const url = new URL(request.url);
    const query = (url.searchParams.get('query') || '').trim();
    const tag = (url.searchParams.get('tag') || '').trim().toLowerCase();
    const learningState = getLearningState();
    const completedItems = learningState.completedItems || [];

    let items = courses
      .filter((course) => course.status === COURSE_STATUS.PUBLISHED)
      .map((course) => mapCourseSummary(course, completedItems));
    if (tag) {
      items = items.filter((course) => (course.tags || []).some((courseTag) => courseTag.toLowerCase() === tag));
    }
    items = filterCoursesByQuery(items, query);

    return HttpResponse.json({
      items,
      filters: { query, tag },
      meta: {
        total: items.length,
        generatedAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${API_BASE}/search/courses`, async ({ request }) => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const url = new URL(request.url);
    const query = (url.searchParams.get('q') || '').trim();
    const learningState = getLearningState();
    const completedItems = learningState.completedItems || [];
    const all = courses
      .filter((course) => course.status === COURSE_STATUS.PUBLISHED)
      .map((course) => mapCourseSummary(course, completedItems));

    const items = query ? filterCoursesByQuery(all, query) : [];
    return HttpResponse.json({
      query,
      items,
      meta: {
        total: items.length,
        generatedAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${API_BASE}/courses/:courseId`, async ({ params }) => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;

    const course = getCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');

    const learningState = getLearningState();
    const completedItems = learningState.completedItems || [];
    const completedModules = learningState.completedModules || [];

    return HttpResponse.json({
      course: {
        ...course,
        progress: getCourseProgress(course, completedItems),
      },
      learningState: {
        completedItems,
        completedModules,
        completedCourses: learningState.completedCourses || [],
      },
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  }),
];
