
// This file now acts as an adapter between the old mock data system and the new API service

import { DashboardStats } from '@/types';
import { api } from '@/services/api';

export class MockData {
  // Get dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    return api.getDashboardStats();
  }
  
  // Get devices 
  async getDevices() {
    return api.getDevices();
  }
  
  // Get logs
  async getLogs() {
    return api.getLogs();
  }
  
  // Add log entry
  async addLogEntry(logData: any) {
    return api.addLogEntry(logData);
  }
  
  // Get users
  async getUsers() {
    return api.getUsers();
  }
}

export const mockData = new MockData();
