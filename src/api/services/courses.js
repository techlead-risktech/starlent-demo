import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function getLearnerCourses() {
  return apiClient.get(API_V1.learner.courses);
}

export async function getCourseDetail(courseId) {
  return apiClient.get(API_V1.courses.detail(courseId));
}

export async function getExploreCourses({ query = '', tag = '' } = {}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set('query', query.trim());
  if (tag.trim()) params.set('tag', tag.trim());
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get(`${API_V1.courses.explore}${suffix}`);
}

export async function searchCourses(query) {
  const params = new URLSearchParams();
  if (query?.trim()) params.set('q', query.trim());
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get(`${API_V1.courses.search}${suffix}`);
}
