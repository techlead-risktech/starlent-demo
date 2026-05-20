import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function getLearningManagerDashboard() {
  return apiClient.get(API_V1.assignmentManagement.learningManagerDashboard);
}

export async function assignCourseToLearner(payload) {
  return apiClient.post(API_V1.assignmentManagement.assignCourse, payload);
}

export async function sendLearningManagerReminder(payload) {
  return apiClient.post(API_V1.assignmentManagement.sendReminder, payload);
}

export async function getDepartmentDashboard() {
  return apiClient.get(API_V1.assignmentManagement.departmentDashboard);
}

export async function sendDepartmentReminder(payload) {
  return apiClient.post(API_V1.assignmentManagement.departmentReminder, payload);
}
