
// File này sẽ được sử dụng trong quá trình chuyển đổi để loại bỏ dữ liệu mẫu
// Chúng ta sẽ thay thế nó bằng các lệnh gọi API thực tế

import { DashboardStats } from '@/types';
import * as db from '@/services/database';

export class MockData {
  // Hàm này sẽ lấy dữ liệu thống kê thực tế từ cơ sở dữ liệu
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Lấy tất cả thiết bị và phân loại chúng
      const devices = await db.getAllDevices();
      
      // Đếm số lượng thiết bị theo trạng thái
      const activeDevices = devices.filter(device => device.active).length;
      const expiredDevices = devices.filter(
        device => device.expires_at && new Date(device.expires_at) < new Date()
      ).length;
      const pendingDevices = devices.filter(
        device => !device.active && !device.key_code
      ).length;
      
      // Lấy 10 bản ghi hoạt động gần đây nhất
      const recentActivity = await db.getLogs(10);
      
      // Định dạng lại dữ liệu để phù hợp với giao diện
      const formattedLogs = recentActivity.map(log => ({
        id: `log-${log.id}`,
        action: log.action,
        userId: log.performed_by?.toString() || '',
        username: log.username || 'Unknown',
        deviceId: log.mac ? `device-${log.id}` : undefined,
        deviceDetails: log.mac && log.hostname ? `${log.hostname} (${log.mac})` : undefined,
        timestamp: log.timestamp,
      }));
      
      return {
        totalDevices: devices.length,
        activeDevices,
        expiredDevices,
        pendingDevices,
        recentActivity: formattedLogs,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Trả về dữ liệu trống nếu có lỗi
      return {
        totalDevices: 0,
        activeDevices: 0,
        expiredDevices: 0,
        pendingDevices: 0,
        recentActivity: [],
      };
    }
  }
  
  // Các phương thức khác sẽ trực tiếp gọi đến các hàm trong database.ts
  
  async getDevices() {
    try {
      const devices = await db.getAllDevices();
      return devices.map(device => ({
        id: `device-${device.id}`,
        macAddress: device.mac,
        hostname: device.hostname,
        status: device.active 
          ? (device.expires_at && new Date(device.expires_at) < new Date() ? 'expired' : 'active') 
          : 'pending',
        key: device.key_code || '',
        expiryDate: device.expires_at || undefined,
        createdAt: device.created_at,
        updatedAt: device.activated_at || device.created_at,
      }));
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }
  
  async getLogs() {
    try {
      const logs = await db.getLogs(50);
      return logs.map(log => ({
        id: `log-${log.id}`,
        action: log.action as any,
        userId: log.performed_by?.toString() || '',
        username: log.username || 'Unknown',
        deviceId: log.mac ? `device-${log.id}` : undefined,
        deviceDetails: log.mac && log.hostname ? `${log.hostname} (${log.mac})` : undefined,
        timestamp: log.timestamp,
      }));
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  }
  
  async addLogEntry(logData: any) {
    try {
      await db.addLog({
        mac: logData.deviceDetails ? logData.deviceDetails.split('(')[1]?.replace(')', '') : undefined,
        hostname: logData.deviceDetails ? logData.deviceDetails.split('(')[0].trim() : undefined,
        action: logData.action,
        performedBy: parseInt(logData.userId) || 1,
      });
    } catch (error) {
      console.error('Error adding log entry:', error);
    }
  }
}

export const mockData = new MockData();
