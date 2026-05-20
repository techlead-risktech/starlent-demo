import { http, HttpResponse } from 'msw';
import { users } from '../../data/mockUsers.js';
import { getCurrentUser, loginUser } from '../../utils/auth.js';
import { jsonError, requireAuthUser } from './_utils.js';
import { ensureStateHydrated } from './_persistentState.js';

const API_BASE = '/api/v1';

export const authHandlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await ensureStateHydrated();
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim();
    const password = body?.password;

    if (!email || !password) {
      return jsonError(422, 'VALIDATION_FAILED', 'Email và mật khẩu là bắt buộc.');
    }

    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      return jsonError(401, 'AUTH_INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
    }

    const safeUser = loginUser(found);
    const accessToken = `mock_${safeUser.id}_${Date.now()}`;
    localStorage.setItem('starlent_access_token', accessToken);

    return HttpResponse.json({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: safeUser,
    });
  }),

  http.get(`${API_BASE}/me`, async () => {
    await ensureStateHydrated();
    const { user, error } = requireAuthUser(getCurrentUser);
    if (error) return error;
    return HttpResponse.json({ user });
  }),
];
