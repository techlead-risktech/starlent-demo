import { http, HttpResponse } from 'msw';
import { users, ROLE_LABELS } from '../../data/mockUsers.js';
import { courses } from '../../data/mockCourses.js';
import { audios, flashcards, quizzes, roleplays, sequenceQuizzes, videos } from '../../data/mockContent.js';
import {
  auditLogs,
  courseProgressReport,
  progressByDepartment,
  quizResults,
  reportSummary,
  weakTopics,
} from '../../data/mockReports.js';
import { conversations } from '../../data/mockChats.js';
import { getCurrentUser } from '../../utils/auth.js';
import { jsonError, requireRoleUser } from './_utils.js';
import { assignments, ensureStateHydrated, persistState, reminders } from './_persistentState.js';

const API_BASE = '/api/v1';
const ADMIN_ROLES = ['admin'];
const EDITOR_ROLES = ['editor', 'admin'];
const TRAINER_ROLES = ['trainer', 'admin'];
const LEARNING_MANAGER_ROLES = ['learning_manager', 'admin'];
const DEPT_MANAGER_ROLES = ['dept_manager', 'admin'];
const COURSE_ITEM_TYPES = new Set(['flashcard', 'video', 'audio', 'quiz_mc', 'quiz_sequence', 'roleplay']);
const CONTENT_TYPE_MAP = {
  flashcard: flashcards,
  video: videos,
  audio: audios,
  quiz_mc: quizzes,
  quiz_sequence: sequenceQuizzes,
  roleplay: roleplays,
};
const CONTENT_ID_PREFIX_MAP = {
  flashcard: 'fc',
  video: 'vd',
  audio: 'ad',
  quiz_mc: 'qz',
  quiz_sequence: 'qs',
  roleplay: 'rp',
};

function nextId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function buildDepartmentSummary(user) {
  const members = users.filter((u) => u.department === user.department && u.role === 'learner');
  const stats = progressByDepartment.find((d) => d.department === user.department) || { completionRate: 0, activeLearners: 0 };
  return { members, stats };
}

function nextModuleId(course) {
  const max = course.modules.reduce((m, mod) => {
    const num = Number(String(mod.id).replace(/\D/g, '')) || 0;
    return Math.max(m, num);
  }, 0);
  return `m${max + 1}`;
}

function nextItemId(course) {
  const flat = course.modules.flatMap((m) => m.items || []);
  const max = flat.reduce((m, item) => {
    const num = Number(String(item.id).replace(/\D/g, '')) || 0;
    return Math.max(m, num);
  }, 0);
  return `i${max + 1}`;
}

function contentCatalog() {
  const mapEntries = (obj) => Object.values(obj).map((x) => ({ id: x.id, title: x.title }));
  return {
    flashcard: mapEntries(flashcards),
    video: mapEntries(videos),
    audio: mapEntries(audios),
    quiz_mc: mapEntries(quizzes),
    quiz_sequence: mapEntries(sequenceQuizzes),
    roleplay: mapEntries(roleplays),
  };
}

function resolveContentStore(type) {
  return CONTENT_TYPE_MAP[type] || null;
}

function nextContentId(type, store) {
  const prefix = CONTENT_ID_PREFIX_MAP[type];
  const max = Object.keys(store || {}).reduce((acc, key) => {
    if (!key.startsWith(prefix)) return acc;
    const num = Number(String(key).replace(/\D/g, '')) || 0;
    return Math.max(acc, num);
  }, 0);
  return `${prefix}${max + 1}`;
}

function contentDefaultPayloadByType(type, id, title) {
  switch (type) {
    case 'flashcard':
      return {
        id,
        title,
        cards: [],
      };
    case 'video':
      return {
        id,
        title,
        videoUrl: '',
        youtubeId: '',
        duration: 0,
        transcript: '',
        captions: '',
      };
    case 'audio':
      return {
        id,
        title,
        audioUrl: '',
        duration: 0,
        transcript: '',
      };
    case 'quiz_mc':
      return {
        id,
        title,
        type: 'multiple_choice',
        timeLimit: 300,
        questions: [],
      };
    case 'quiz_sequence':
      return {
        id,
        title,
        description: '',
        items: [],
      };
    case 'roleplay':
      return {
        id,
        title,
        scenario: '',
        suggestedResponse: '',
        tips: [],
      };
    default:
      return {
        id,
        title,
      };
  }
}

function isContentInUse(type, contentId) {
  return courses.some((course) => (course.modules || []).some((module) => (module.items || []).some((item) => (
    item.type === type && item.contentId === contentId
  ))));
}

function createCourseFromPayload(body) {
  return {
    id: nextId('c'),
    title: body.title,
    description: body.description || '',
    thumbnail: null,
    status: body.status || 'draft',
    tags: (body.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    duration: Number(body.duration) || 30,
    moduleCount: 0,
    rating: 0,
    required: false,
    dueDate: null,
    createdAt: new Date().toISOString().slice(0, 10),
    modules: [],
  };
}

function findCourseById(courseId) {
  return courses.find((course) => course.id === courseId);
}

function normalizeModuleOrders(course) {
  course.modules = (course.modules || []).map((module, index) => ({ ...module, order: index + 1 }));
  course.moduleCount = course.modules.length;
}

function findModuleById(course, moduleId) {
  return course.modules.find((module) => module.id === moduleId);
}

function findItemIndex(module, itemId) {
  return (module.items || []).findIndex((item) => item.id === itemId);
}

function reorderByIds(items, ids) {
  if (!Array.isArray(ids) || ids.length !== items.length) return null;
  const map = new Map(items.map((item) => [item.id, item]));
  const reordered = [];
  for (const id of ids) {
    const found = map.get(id);
    if (!found) return null;
    reordered.push(found);
  }
  return reordered;
}

function findLearnerById(userId) {
  return users.find((user) => user.id === userId && user.role === 'learner');
}

function createUserFromPayload(body) {
  return {
    id: nextId('u'),
    email: body.email,
    password: body.password,
    name: body.name,
    role: body.role,
    avatar: null,
    department: body.department,
    streak: 0,
    xp: 0,
    level: 0,
    joinedAt: new Date().toISOString().slice(0, 10),
  };
}

function createAssignmentRecord(payload, actor, learner, course) {
  return {
    id: nextId('assign'),
    courseId: payload.courseId,
    courseName: course.title,
    userId: payload.userId,
    userName: learner.name,
    dueDate: payload.dueDate || null,
    assignedBy: actor.id,
    assignedAt: new Date().toISOString(),
  };
}

function createReminderRecord(payload, actor, prefix = 'reminder') {
  return {
    id: nextId(prefix),
    userId: payload?.userId || null,
    message: payload?.message || 'Nhắc học tập',
    createdBy: actor.id,
    createdAt: new Date().toISOString(),
  };
}

function buildTrainerDashboardPayload(user) {
  const learners = users.filter((item) => item.role === 'learner');
  return {
    user,
    learners,
    learnerProgressDetail: learners.map((item) => ({
      userId: item.id,
      userName: item.name,
      department: item.department,
      coursesEnrolled: 4,
      coursesCompleted: Math.max(0, Math.floor(item.xp / 1500)),
      avgScore: Math.min(95, 65 + Math.floor(item.xp / 120)),
      streak: item.streak,
      lastActive: '2026-05-18',
    })),
    courseProgressReport,
    quizResults,
    reportSummary,
    conversations,
  };
}

function pushAuditLog(user, action, target) {
  auditLogs.unshift({
    id: nextId('log'),
    userId: user.id,
    userName: user.name,
    action,
    target,
    timestamp: new Date().toISOString(),
  });
}

export const managementHandlers = [
  http.get(`${API_BASE}/manager/dashboard`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, LEARNING_MANAGER_ROLES);
    if (error) return error;
    return HttpResponse.json({
      user,
      reportSummary,
      progressByDepartment,
      courseProgressReport,
      weakTopics,
      users,
      courses,
      assignments,
    });
  }),

  http.post(`${API_BASE}/manager/assignments`, async ({ request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, LEARNING_MANAGER_ROLES);
    if (error) return error;
    const body = await request.json().catch(() => null);
    const courseId = body?.courseId;
    const userId = body?.userId;
    if (!courseId || !userId) return jsonError(422, 'VALIDATION_FAILED', 'courseId và userId là bắt buộc.');
    const course = findCourseById(courseId);
    const learner = findLearnerById(userId);
    if (!course || !learner) return jsonError(404, 'NOT_FOUND', 'Course hoặc learner không tồn tại.');
    const record = createAssignmentRecord({ courseId, userId, dueDate: body?.dueDate }, user, learner, course);
    assignments.push(record);
    pushAuditLog(user, 'Gán khoá học cho học viên', `${userId}-${courseId}`);
    await persistState();
    return HttpResponse.json({ ok: true, assignment: record });
  }),

  http.post(`${API_BASE}/manager/reminders`, async ({ request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, LEARNING_MANAGER_ROLES);
    if (error) return error;
    const body = await request.json().catch(() => null);
    const reminder = createReminderRecord(body, user, 'reminder');
    reminders.push(reminder);
    await persistState();
    return HttpResponse.json({ ok: true, reminder });
  }),

  http.get(`${API_BASE}/manager/department`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, DEPT_MANAGER_ROLES);
    if (error) return error;
    const { members, stats } = buildDepartmentSummary(user);
    return HttpResponse.json({
      user,
      members,
      stats,
      reminders: reminders.filter((r) => {
        const learner = users.find((u) => u.id === r.userId);
        return !r.userId || learner?.department === user.department;
      }),
    });
  }),

  http.post(`${API_BASE}/manager/department/reminders`, async ({ request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, DEPT_MANAGER_ROLES);
    if (error) return error;
    const body = await request.json().catch(() => null);
    const message = body?.message?.trim();
    if (!message) return jsonError(422, 'VALIDATION_FAILED', 'message là bắt buộc.');
    const reminder = createReminderRecord({ userId: body?.userId || null, message }, user, 'dept_reminder');
    reminders.push(reminder);
    pushAuditLog(user, 'Gui nhac nho hoc tap', `Phong ${user.department}`);
    await persistState();
    return HttpResponse.json({ ok: true, reminder });
  }),

  http.get(`${API_BASE}/admin/dashboard`, async () => {
    await ensureStateHydrated();
    const { error } = requireRoleUser(getCurrentUser, ADMIN_ROLES);
    if (error) return error;
    return HttpResponse.json({
      users,
      courses,
      roleLabels: ROLE_LABELS,
      reportSummary,
      progressByDepartment,
      courseProgressReport,
      quizResults,
      auditLogs,
    });
  }),

  http.post(`${API_BASE}/admin/users`, async ({ request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, ADMIN_ROLES);
    if (error) return error;
    const body = await request.json().catch(() => null);
    const requiredFields = ['name', 'email', 'role', 'department', 'password'];
    if (!body || requiredFields.some((f) => !body[f])) {
      return jsonError(422, 'VALIDATION_FAILED', 'Thiếu thông tin tạo user.');
    }
    if (users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase())) {
      return jsonError(409, 'USER_EXISTS', 'Email đã tồn tại.');
    }
    const newUser = createUserFromPayload(body);
    users.push(newUser);
    pushAuditLog(user, 'Tạo tài khoản mới', newUser.id);
    await persistState();
    return HttpResponse.json({ ok: true, user: newUser });
  }),

  http.post(`${API_BASE}/admin/courses`, async ({ request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, ADMIN_ROLES);
    if (error) return error;
    const body = await request.json().catch(() => null);
    if (!body?.title) return jsonError(422, 'VALIDATION_FAILED', 'title là bắt buộc.');
    const newCourse = createCourseFromPayload(body);
    courses.push(newCourse);
    pushAuditLog(user, 'Tạo khoá học mới', newCourse.id);
    await persistState();
    return HttpResponse.json({ ok: true, course: newCourse });
  }),

  http.get(`${API_BASE}/trainer/dashboard`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, TRAINER_ROLES);
    if (error) return error;
    return HttpResponse.json(buildTrainerDashboardPayload(user));
  }),

  http.get(`${API_BASE}/editor/dashboard`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    return HttpResponse.json({
      user,
      courses,
    });
  }),

  http.post(`${API_BASE}/editor/courses`, async ({ request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const body = await request.json().catch(() => null);
    if (!body?.title) return jsonError(422, 'VALIDATION_FAILED', 'title is required.');
    const newCourse = createCourseFromPayload(body);
    courses.push(newCourse);
    pushAuditLog(user, 'Editor tạo khoá học mới', newCourse.id);
    await persistState();
    return HttpResponse.json({ ok: true, course: newCourse });
  }),

  http.post(`${API_BASE}/editor/courses/:courseId/publish`, async ({ params }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    course.status = course.status === 'published' ? 'draft' : 'published';
    pushAuditLog(
      user,
      course.status === 'published' ? 'Xuất bản khoá học' : 'Chuyển khoá học về bản nháp',
      course.id
    );
    await persistState();
    return HttpResponse.json({ ok: true, course });
  }),

  http.get(`${API_BASE}/editor/content-catalog`, async () => {
    await ensureStateHydrated();
    const { error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    return HttpResponse.json({ catalog: contentCatalog() });
  }),

  http.get(`${API_BASE}/editor/content-catalog/:type`, async ({ params }) => {
    await ensureStateHydrated();
    const { error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const type = String(params.type || '');
    const store = resolveContentStore(type);
    if (!store) return jsonError(404, 'CONTENT_TYPE_NOT_FOUND', 'Content type not found.');
    const items = Object.values(store).map((content) => ({ id: content.id, title: content.title || content.id }));
    return HttpResponse.json({ type, items });
  }),

  http.get(`${API_BASE}/editor/content-catalog/:type/:contentId`, async ({ params }) => {
    await ensureStateHydrated();
    const { error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const type = String(params.type || '');
    const contentId = String(params.contentId || '');
    const store = resolveContentStore(type);
    if (!store) return jsonError(404, 'CONTENT_TYPE_NOT_FOUND', 'Content type not found.');
    const content = store[contentId];
    if (!content) return jsonError(404, 'CONTENT_NOT_FOUND', 'Content not found.');
    return HttpResponse.json({ type, content });
  }),

  http.post(`${API_BASE}/editor/content-catalog/:type`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const type = String(params.type || '');
    const store = resolveContentStore(type);
    if (!store) return jsonError(404, 'CONTENT_TYPE_NOT_FOUND', 'Content type not found.');
    const body = await request.json().catch(() => null);
    const title = body?.title?.trim();
    if (!title) return jsonError(422, 'VALIDATION_FAILED', 'title is required.');

    const forcedId = String(body?.id || '').trim();
    const contentId = forcedId || nextContentId(type, store);
    if (store[contentId]) return jsonError(409, 'CONTENT_EXISTS', 'Content id already exists.');

    const patch = body?.data && typeof body.data === 'object' ? body.data : {};
    const created = {
      ...contentDefaultPayloadByType(type, contentId, title),
      ...patch,
      id: contentId,
      title,
    };
    store[contentId] = created;

    pushAuditLog(user, 'Tao content', `${type}/${contentId}`);
    await persistState();
    return HttpResponse.json({ ok: true, type, content: created });
  }),

  http.put(`${API_BASE}/editor/content-catalog/:type/:contentId`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const type = String(params.type || '');
    const contentId = String(params.contentId || '');
    const store = resolveContentStore(type);
    if (!store) return jsonError(404, 'CONTENT_TYPE_NOT_FOUND', 'Content type not found.');
    const current = store[contentId];
    if (!current) return jsonError(404, 'CONTENT_NOT_FOUND', 'Content not found.');

    const body = await request.json().catch(() => null);
    const title = body?.title?.trim();
    if (!title) return jsonError(422, 'VALIDATION_FAILED', 'title is required.');

    const patch = body?.data && typeof body.data === 'object' ? body.data : {};
    store[contentId] = {
      ...current,
      ...patch,
      id: contentId,
      title,
    };

    pushAuditLog(user, 'Cap nhat content', `${type}/${contentId}`);
    await persistState();
    return HttpResponse.json({ ok: true, type, content: store[contentId] });
  }),

  http.delete(`${API_BASE}/editor/content-catalog/:type/:contentId`, async ({ params }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const type = String(params.type || '');
    const contentId = String(params.contentId || '');
    const store = resolveContentStore(type);
    if (!store) return jsonError(404, 'CONTENT_TYPE_NOT_FOUND', 'Content type not found.');
    if (!store[contentId]) return jsonError(404, 'CONTENT_NOT_FOUND', 'Content not found.');
    if (isContentInUse(type, contentId)) {
      return jsonError(409, 'CONTENT_IN_USE', 'Content is referenced by course item.');
    }

    delete store[contentId];
    pushAuditLog(user, 'Xoa content', `${type}/${contentId}`);
    await persistState();
    return HttpResponse.json({ ok: true, type, contentId });
  }),

  http.get(`${API_BASE}/editor/courses/:courseId/structure`, async ({ params }) => {
    await ensureStateHydrated();
    const { error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    return HttpResponse.json({ course });
  }),

  http.post(`${API_BASE}/editor/courses/:courseId/modules`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');

    const body = await request.json().catch(() => null);
    const title = body?.title?.trim();
    if (!title) return jsonError(422, 'VALIDATION_FAILED', 'title is required.');

    const module = {
      id: nextModuleId(course),
      title,
      order: (course.modules?.length || 0) + 1,
      items: [],
    };
    course.modules.push(module);
    normalizeModuleOrders(course);
    pushAuditLog(user, 'Them module', `${course.id}/${module.id}`);
    await persistState();
    return HttpResponse.json({ ok: true, course, module });
  }),

  http.post(`${API_BASE}/editor/courses/:courseId/modules/:moduleId/items`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const module = findModuleById(course, params.moduleId);
    if (!module) return jsonError(404, 'MODULE_NOT_FOUND', 'Module not found.');

    const body = await request.json().catch(() => null);
    const type = body?.type;
    const contentId = body?.contentId;
    const title = body?.title?.trim();
    if (!COURSE_ITEM_TYPES.has(type) || !contentId) {
      return jsonError(422, 'VALIDATION_FAILED', 'type/contentId invalid.');
    }

    const item = {
      id: nextItemId(course),
      type,
      title: title || `${type} item`,
      contentId,
    };
    module.items.push(item);
    pushAuditLog(user, 'Them item', `${course.id}/${module.id}/${item.id}`);
    await persistState();
    return HttpResponse.json({ ok: true, course, module, item });
  }),

  http.put(`${API_BASE}/editor/courses/:courseId`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const body = await request.json().catch(() => null);
    const title = body?.title?.trim();
    if (!title) return jsonError(422, 'VALIDATION_FAILED', 'title is required.');

    course.title = title;
    course.description = (body?.description || '').trim();
    course.tags = String(body?.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    course.duration = Math.max(1, Number(body?.duration) || course.duration || 30);

    pushAuditLog(user, 'Cap nhat khoa hoc', course.id);
    await persistState();
    return HttpResponse.json({ ok: true, course });
  }),

  http.delete(`${API_BASE}/editor/courses/:courseId`, async ({ params }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const index = courses.findIndex((course) => course.id === params.courseId);
    if (index < 0) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const [removed] = courses.splice(index, 1);
    pushAuditLog(user, 'Xoa khoa hoc', removed.id);
    await persistState();
    return HttpResponse.json({ ok: true, courseId: removed.id });
  }),

  http.put(`${API_BASE}/editor/courses/:courseId/modules/:moduleId`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const module = findModuleById(course, params.moduleId);
    if (!module) return jsonError(404, 'MODULE_NOT_FOUND', 'Module not found.');

    const body = await request.json().catch(() => null);
    const title = body?.title?.trim();
    if (!title) return jsonError(422, 'VALIDATION_FAILED', 'title is required.');

    module.title = title;
    pushAuditLog(user, 'Cap nhat module', `${course.id}/${module.id}`);
    await persistState();
    return HttpResponse.json({ ok: true, course, module });
  }),

  http.delete(`${API_BASE}/editor/courses/:courseId/modules/:moduleId`, async ({ params }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const index = (course.modules || []).findIndex((module) => module.id === params.moduleId);
    if (index < 0) return jsonError(404, 'MODULE_NOT_FOUND', 'Module not found.');

    const [removed] = course.modules.splice(index, 1);
    normalizeModuleOrders(course);
    pushAuditLog(user, 'Xoa module', `${course.id}/${removed.id}`);
    await persistState();
    return HttpResponse.json({ ok: true, course, moduleId: removed.id });
  }),

  http.post(`${API_BASE}/editor/courses/:courseId/modules/reorder`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const body = await request.json().catch(() => null);
    const moduleIds = body?.moduleIds;
    const reordered = reorderByIds(course.modules || [], moduleIds);
    if (!reordered) return jsonError(422, 'VALIDATION_FAILED', 'moduleIds invalid.');
    course.modules = reordered;
    normalizeModuleOrders(course);
    pushAuditLog(user, 'Sap xep module', course.id);
    await persistState();
    return HttpResponse.json({ ok: true, course });
  }),

  http.put(`${API_BASE}/editor/courses/:courseId/modules/:moduleId/items/:itemId`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const module = findModuleById(course, params.moduleId);
    if (!module) return jsonError(404, 'MODULE_NOT_FOUND', 'Module not found.');
    const index = findItemIndex(module, params.itemId);
    if (index < 0) return jsonError(404, 'ITEM_NOT_FOUND', 'Item not found.');

    const body = await request.json().catch(() => null);
    const type = body?.type;
    const contentId = body?.contentId;
    const title = body?.title?.trim();
    if (!COURSE_ITEM_TYPES.has(type) || !contentId) {
      return jsonError(422, 'VALIDATION_FAILED', 'type/contentId invalid.');
    }

    module.items[index] = {
      ...module.items[index],
      type,
      contentId,
      title: title || `${type} item`,
    };
    pushAuditLog(user, 'Cap nhat item', `${course.id}/${module.id}/${params.itemId}`);
    await persistState();
    return HttpResponse.json({ ok: true, course, module, item: module.items[index] });
  }),

  http.delete(`${API_BASE}/editor/courses/:courseId/modules/:moduleId/items/:itemId`, async ({ params }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const module = findModuleById(course, params.moduleId);
    if (!module) return jsonError(404, 'MODULE_NOT_FOUND', 'Module not found.');
    const index = findItemIndex(module, params.itemId);
    if (index < 0) return jsonError(404, 'ITEM_NOT_FOUND', 'Item not found.');

    const [removed] = module.items.splice(index, 1);
    pushAuditLog(user, 'Xoa item', `${course.id}/${module.id}/${removed.id}`);
    await persistState();
    return HttpResponse.json({ ok: true, course, module, itemId: removed.id });
  }),

  http.post(`${API_BASE}/editor/courses/:courseId/modules/:moduleId/items/reorder`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireRoleUser(getCurrentUser, EDITOR_ROLES);
    if (error) return error;
    const course = findCourseById(params.courseId);
    if (!course) return jsonError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    const module = findModuleById(course, params.moduleId);
    if (!module) return jsonError(404, 'MODULE_NOT_FOUND', 'Module not found.');

    const body = await request.json().catch(() => null);
    const itemIds = body?.itemIds;
    const reordered = reorderByIds(module.items || [], itemIds);
    if (!reordered) return jsonError(422, 'VALIDATION_FAILED', 'itemIds invalid.');
    module.items = reordered;

    pushAuditLog(user, 'Sap xep item', `${course.id}/${module.id}`);
    await persistState();
    return HttpResponse.json({ ok: true, course, module });
  }),
];
















