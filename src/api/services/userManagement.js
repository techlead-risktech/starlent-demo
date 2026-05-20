import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function createUser(payload) {
  return apiClient.post(API_V1.userManagement.createUser, payload);
}
