import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function completeLearningItem(payload) {
  return apiClient.post(API_V1.learning.completeItem, payload);
}

export async function saveQuizAttemptApi(payload) {
  return apiClient.post(API_V1.learning.saveQuizAttempt, payload);
}

export async function saveCardReviewApi(payload) {
  return apiClient.post(API_V1.learning.saveCardReview, payload);
}

