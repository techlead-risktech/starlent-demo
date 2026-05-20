import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function getNotifications() {
  return apiClient.get(API_V1.learner.notifications);
}

export async function getChatList() {
  return apiClient.get(API_V1.learner.chats);
}

export async function getChatDetail(convId) {
  return apiClient.get(API_V1.chats.detail(convId));
}

export async function sendChatMessage(convId, text) {
  return apiClient.post(API_V1.chats.sendMessage(convId), { text });
}

export async function getLearnerProfile() {
  return apiClient.get(API_V1.learner.profile);
}

export async function getCertificates() {
  return apiClient.get(API_V1.learner.certificates);
}

export async function getCertificateById(certId) {
  return apiClient.get(API_V1.certificates.detail(certId));
}

export async function getLeaderboard() {
  return apiClient.get(API_V1.learner.leaderboard);
}

export async function getOfflineLibrary() {
  return apiClient.get(API_V1.learner.offline);
}

export async function syncOfflineLibrary() {
  return apiClient.post(API_V1.learner.offlineSync, {});
}

export async function getLearnerSettings() {
  return apiClient.get(API_V1.learner.settings);
}

export async function updateLearnerSettings(payload) {
  return apiClient.put(API_V1.learner.settings, payload);
}

export async function syncLearnerData() {
  return apiClient.post(API_V1.learner.dataSync, {});
}
