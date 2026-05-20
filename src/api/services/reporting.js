import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function getAdminReportingDashboard() {
  return apiClient.get(API_V1.reporting.adminDashboard);
}

export async function getTrainerReportingDashboard() {
  return apiClient.get(API_V1.reporting.trainerDashboard);
}
