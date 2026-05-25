import { apiClient } from '../client.js';
import { API_V1 } from '../contracts/v1.js';

export async function createTenant(payload) {
  return apiClient.post(API_V1.admin.createTenant, payload);
}

export async function updateTenant(tenantId, payload) {
  return apiClient.put(API_V1.admin.updateTenant(tenantId), payload);
}

