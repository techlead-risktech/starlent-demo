import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function getLearnerHome() {
  return apiClient.get(API_V1.learner.home);
}

