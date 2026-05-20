import { HttpResponse } from 'msw';

export function jsonError(status, code, message, details) {
  return HttpResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export function requireAuthUser(getCurrentUser) {
  const user = getCurrentUser();
  if (!user) return { user: null, error: jsonError(401, 'AUTH_UNAUTHORIZED', 'Unauthorized') };
  return { user, error: null };
}

export function requireRoleUser(getCurrentUser, allowedRoles = []) {
  const { user, error } = requireAuthUser(getCurrentUser);
  if (error) return { user: null, error };
  if (!allowedRoles.includes(user.role)) {
    return { user: null, error: jsonError(403, 'AUTH_FORBIDDEN', 'Forbidden') };
  }
  return { user, error: null };
}
