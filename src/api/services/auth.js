import { apiClient, setAccessToken, clearAccessToken } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function login(email, password) {
  const data = await apiClient.post(API_V1.auth.login, { email, password });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function getMe() {
  return apiClient.get(API_V1.auth.me);
}

export function clearSession() {
  clearAccessToken();
}

