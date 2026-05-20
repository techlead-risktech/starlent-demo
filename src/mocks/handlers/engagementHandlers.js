import { http, HttpResponse } from 'msw';
import { users } from '../../data/mockUsers.js';
import { courses } from '../../data/mockCourses.js';
import {
  badges,
  conversations,
  findCertificateById,
  getCertificatesForUser,
  getConversationsForUser,
  getNotificationsForUser,
} from '../../data/mockChats.js';
import { getCurrentUser, getLearningState, setDailyGoal } from '../../utils/auth.js';
import { jsonError, requireAuthUser } from './_utils.js';
import { ensureStateHydrated } from './_persistentState.js';

const API_BASE = '/api/v1';
const SETTINGS_KEY = 'starlent_settings';
const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  autoDownloadOffline: true,
  soundEffectsEnabled: false,
};

function getConversationDisplayName(conv, currentUserId) {
  if (conv.groupName) return conv.groupName;
  const peerId = conv.participants.find((id) => id !== currentUserId);
  return users.find((user) => user.id === peerId)?.name || 'Nguoi dung';
}

function mapConversationSummary(conv, currentUserId) {
  const last = conv.messages[conv.messages.length - 1] || null;
  return {
    id: conv.id,
    type: conv.type,
    name: getConversationDisplayName(conv, currentUserId),
    unread: conv.unread || 0,
    resolved: !!conv.resolved,
    lastMessage: last,
  };
}

function getSettingsState() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettingsState(partial) {
  const next = { ...getSettingsState(), ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export const engagementHandlers = [
  http.get(`${API_BASE}/learner/notifications`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const items = getNotificationsForUser(user.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return HttpResponse.json({
      items,
      meta: {
        unreadCount: items.filter((item) => !item.read).length,
      },
    });
  }),

  http.get(`${API_BASE}/learner/chats`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const items = getConversationsForUser(user.id).map((conv) => mapConversationSummary(conv, user.id));
    return HttpResponse.json({ items });
  }),

  http.get(`${API_BASE}/learner/chats/:convId`, async ({ params }) => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const conv = conversations.find((item) => item.id === params.convId);
    if (!conv || !conv.participants.includes(user.id)) {
      return jsonError(404, 'CHAT_NOT_FOUND', 'Conversation not found.');
    }
    return HttpResponse.json({
      conversation: {
        ...conv,
        name: getConversationDisplayName(conv, user.id),
      },
    });
  }),

  http.post(`${API_BASE}/learner/chats/:convId/messages`, async ({ params, request }) => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const conv = conversations.find((item) => item.id === params.convId);
    if (!conv || !conv.participants.includes(user.id)) {
      return jsonError(404, 'CHAT_NOT_FOUND', 'Conversation not found.');
    }

    const body = await request.json().catch(() => null);
    const text = body?.text?.trim();
    if (!text) return jsonError(422, 'VALIDATION_FAILED', 'text is required.');

    const message = {
      id: `n${Date.now()}`,
      senderId: user.id,
      text,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    conv.messages.push(message);
    return HttpResponse.json({ message });
  }),

  http.get(`${API_BASE}/learner/profile`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const state = getLearningState();
    const xp = state?.xp || user?.xp || 0;
    const level = Math.floor(xp / 500) + 1;
    const unlocked = badges.filter((badge) => badge.unlockedAt !== null || state?.unlockedBadges?.includes(badge.id));
    const certs = getCertificatesForUser(user.id);

    return HttpResponse.json({
      user,
      stats: {
        streak: state?.streak || user?.streak || 0,
        xp,
        level,
        completedCourses: state?.completedCourses?.length || 0,
      },
      badges: unlocked,
      certificates: certs,
    });
  }),

  http.get(`${API_BASE}/learner/certificates`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const items = getCertificatesForUser(user.id);
    return HttpResponse.json({ items });
  }),

  http.get(`${API_BASE}/learner/certificates/:certId`, async ({ params }) => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const cert = findCertificateById(params.certId);
    if (!cert || cert.userId !== user.id) {
      return jsonError(404, 'CERT_NOT_FOUND', 'Certificate not found.');
    }
    return HttpResponse.json({ certificate: cert });
  }),

  http.get(`${API_BASE}/learner/leaderboard`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const learners = users
      .filter((item) => item.role === 'learner')
      .sort((a, b) => b.xp - a.xp)
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        department: item.department,
        xp: item.xp,
        streak: item.streak,
        rank: index + 1,
      }));
    const myRank = learners.find((item) => item.id === user.id)?.rank || null;
    return HttpResponse.json({ learners, myRank });
  }),

  http.get(`${API_BASE}/learner/offline`, async () => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const state = getLearningState();
    const downloads = state?.offlineDownloads || [];
    const items = downloads.map((id) => {
      const course = courses.find((item) => item.id === id);
      return {
        id,
        title: course?.title || id,
        moduleCount: course?.moduleCount || course?.modules?.length || 0,
      };
    });
    const storageMB = items.length * 4.2;
    return HttpResponse.json({
      items,
      summary: {
        total: items.length,
        storageMB: Number(storageMB.toFixed(1)),
      },
    });
  }),

  http.post(`${API_BASE}/learner/offline/sync`, async () => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    return HttpResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      message: 'Offline library synced.',
    });
  }),

  http.get(`${API_BASE}/learner/settings`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const learningState = getLearningState();
    const settings = getSettingsState();
    return HttpResponse.json({
      settings: {
        ...settings,
        dailyGoal: learningState.dailyGoal,
      },
      app: {
        version: '1.0.0',
        userName: user.name,
      },
    });
  }),

  http.put(`${API_BASE}/learner/settings`, async ({ request }) => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError(422, 'VALIDATION_FAILED', 'Invalid payload.');
    }

    const merged = saveSettingsState({
      notificationsEnabled: typeof body.notificationsEnabled === 'boolean' ? body.notificationsEnabled : getSettingsState().notificationsEnabled,
      autoDownloadOffline: typeof body.autoDownloadOffline === 'boolean' ? body.autoDownloadOffline : getSettingsState().autoDownloadOffline,
      soundEffectsEnabled: typeof body.soundEffectsEnabled === 'boolean' ? body.soundEffectsEnabled : getSettingsState().soundEffectsEnabled,
    });

    if (typeof body.dailyGoal === 'number') {
      setDailyGoal(body.dailyGoal);
    }
    const learningState = getLearningState();
    return HttpResponse.json({
      settings: {
        ...merged,
        dailyGoal: learningState.dailyGoal,
      },
    });
  }),

  http.post(`${API_BASE}/learner/data/sync`, async () => {
    await ensureStateHydrated();
    const { error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    return HttpResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      message: 'Learner data synced.',
    });
  }),
];
