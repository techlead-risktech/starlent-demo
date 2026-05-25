import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function assignCourseByAdmin(payload) {
  return apiClient.post(API_V1.admin.assignCourse, payload);
}

export async function assignCourseByEditor(payload) {
  return apiClient.post(API_V1.editor.assignCourse, payload);
}
