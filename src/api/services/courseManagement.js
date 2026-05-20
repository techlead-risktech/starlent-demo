import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

const ROLE_SCOPES = {
  admin: 'admin',
  editor: 'editor',
};

function resolveScope(scope) {
  return ROLE_SCOPES[scope] || ROLE_SCOPES.editor;
}

export async function getCourseManagementDashboard(scope) {
  const roleScope = resolveScope(scope);
  return apiClient.get(API_V1.courseManagement.dashboard[roleScope]);
}

export async function createCourseByScope(scope, payload) {
  const roleScope = resolveScope(scope);
  return apiClient.post(API_V1.courseManagement.createCourse[roleScope], payload);
}

export async function toggleCoursePublish(courseId) {
  return apiClient.post(API_V1.courseManagement.togglePublish(courseId), {});
}

export async function getCourseContentCatalog() {
  return apiClient.get(API_V1.courseManagement.contentCatalog);
}

export async function getCourseContentCatalogByType(type) {
  return apiClient.get(API_V1.courseManagement.contentCatalogByType(type));
}

export async function getCourseContentDetail(type, contentId) {
  return apiClient.get(API_V1.courseManagement.contentDetail(type, contentId));
}

export async function createCourseContent(type, payload) {
  return apiClient.post(API_V1.courseManagement.contentCatalogByType(type), payload);
}

export async function updateCourseContent(type, contentId, payload) {
  return apiClient.put(API_V1.courseManagement.contentDetail(type, contentId), payload);
}

export async function deleteCourseContent(type, contentId) {
  return apiClient.delete(API_V1.courseManagement.contentDetail(type, contentId));
}

export async function getCourseStructure(courseId) {
  return apiClient.get(API_V1.courseManagement.courseStructure(courseId));
}

export async function addCourseModule(courseId, title) {
  return apiClient.post(API_V1.courseManagement.addModule(courseId), { title });
}

export async function addCourseItem(courseId, moduleId, payload) {
  return apiClient.post(API_V1.courseManagement.addItem(courseId, moduleId), payload);
}

export async function updateCourseDefinition(courseId, payload) {
  return apiClient.put(API_V1.courseManagement.updateCourse(courseId), payload);
}

export async function deleteCourseDefinition(courseId) {
  return apiClient.delete(API_V1.courseManagement.deleteCourse(courseId));
}

export async function updateCourseModule(courseId, moduleId, payload) {
  return apiClient.put(API_V1.courseManagement.updateModule(courseId, moduleId), payload);
}

export async function deleteCourseModule(courseId, moduleId) {
  return apiClient.delete(API_V1.courseManagement.deleteModule(courseId, moduleId));
}

export async function reorderCourseModules(courseId, moduleIds) {
  return apiClient.post(API_V1.courseManagement.reorderModules(courseId), { moduleIds });
}

export async function updateCourseItem(courseId, moduleId, itemId, payload) {
  return apiClient.put(API_V1.courseManagement.updateItem(courseId, moduleId, itemId), payload);
}

export async function deleteCourseItem(courseId, moduleId, itemId) {
  return apiClient.delete(API_V1.courseManagement.deleteItem(courseId, moduleId, itemId));
}

export async function reorderCourseItems(courseId, moduleId, itemIds) {
  return apiClient.post(API_V1.courseManagement.reorderItems(courseId, moduleId), { itemIds });
}
