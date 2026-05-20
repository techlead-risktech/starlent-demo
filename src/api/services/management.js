import {
  assignCourseToLearner,
  getDepartmentDashboard,
  getLearningManagerDashboard,
  sendDepartmentReminder as sendDepartmentReminderByDomain,
  sendLearningManagerReminder,
} from './assignmentManagement.js';
import {
  addCourseItem,
  addCourseModule,
  createCourseByScope,
  createCourseContent,
  deleteCourseDefinition,
  deleteCourseContent,
  deleteCourseItem,
  deleteCourseModule,
  getCourseContentCatalog,
  getCourseContentCatalogByType,
  getCourseContentDetail,
  getCourseManagementDashboard,
  getCourseStructure,
  reorderCourseItems,
  reorderCourseModules,
  toggleCoursePublish,
  updateCourseContent,
  updateCourseDefinition,
  updateCourseItem,
  updateCourseModule,
} from './courseManagement.js';
import { getAdminReportingDashboard, getTrainerReportingDashboard } from './reporting.js';
import { createUser } from './userManagement.js';

export async function getManagerDashboard() {
  return getLearningManagerDashboard();
}

export async function assignCourse(payload) {
  return assignCourseToLearner(payload);
}

export async function sendManagerReminder(payload) {
  return sendLearningManagerReminder(payload);
}

export async function getDepartmentData() {
  return getDepartmentDashboard();
}

export async function sendDepartmentReminder(payload) {
  return sendDepartmentReminderByDomain(payload);
}

export async function getAdminDashboard() {
  return getAdminReportingDashboard();
}

export async function createAdminUser(payload) {
  return createUser(payload);
}

export async function createAdminCourse(payload) {
  return createCourseByScope('admin', payload);
}

export async function getTrainerDashboard() {
  return getTrainerReportingDashboard();
}

export async function getEditorDashboard() {
  return getCourseManagementDashboard('editor');
}

export async function createEditorCourse(payload) {
  return createCourseByScope('editor', payload);
}

export async function toggleEditorCoursePublish(courseId) {
  return toggleCoursePublish(courseId);
}

export async function getEditorContentCatalog() {
  return getCourseContentCatalog();
}

export async function getEditorContentCatalogByType(type) {
  return getCourseContentCatalogByType(type);
}

export async function getEditorContentDetail(type, contentId) {
  return getCourseContentDetail(type, contentId);
}

export async function createEditorContent(type, payload) {
  return createCourseContent(type, payload);
}

export async function updateEditorContent(type, contentId, payload) {
  return updateCourseContent(type, contentId, payload);
}

export async function deleteEditorContent(type, contentId) {
  return deleteCourseContent(type, contentId);
}

export async function getEditorCourseStructure(courseId) {
  return getCourseStructure(courseId);
}

export async function addEditorModule(courseId, title) {
  return addCourseModule(courseId, title);
}

export async function addEditorItem(courseId, moduleId, payload) {
  return addCourseItem(courseId, moduleId, payload);
}

export async function updateEditorCourse(courseId, payload) {
  return updateCourseDefinition(courseId, payload);
}

export async function deleteEditorCourse(courseId) {
  return deleteCourseDefinition(courseId);
}

export async function updateEditorModule(courseId, moduleId, payload) {
  return updateCourseModule(courseId, moduleId, payload);
}

export async function deleteEditorModule(courseId, moduleId) {
  return deleteCourseModule(courseId, moduleId);
}

export async function reorderEditorModules(courseId, moduleIds) {
  return reorderCourseModules(courseId, moduleIds);
}

export async function updateEditorItem(courseId, moduleId, itemId, payload) {
  return updateCourseItem(courseId, moduleId, itemId, payload);
}

export async function deleteEditorItem(courseId, moduleId, itemId) {
  return deleteCourseItem(courseId, moduleId, itemId);
}

export async function reorderEditorItems(courseId, moduleId, itemIds) {
  return reorderCourseItems(courseId, moduleId, itemIds);
}
