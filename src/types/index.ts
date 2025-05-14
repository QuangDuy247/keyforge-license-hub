
export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  lastLogin?: string;
}

export type DeviceStatus = 'active' | 'expired' | 'pending';

export interface Device {
  id: string;
  macAddress: string;
  hostname: string;
  status: DeviceStatus;
  key: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type KeyDuration = '1day' | '3days' | '1month' | '6months' | '2years' | 'forever';

export interface LogEntry {
  id: string;
  action: 'login' | 'issue_key' | 'reset' | 'delete';
  userId: string;
  username: string;
  deviceId?: string;
  deviceDetails?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  expiredDevices: number;
  pendingDevices: number;
  recentActivity: LogEntry[];
}
