
import { Device, User, DeviceStatus, LogEntry, DashboardStats, UserRole } from '@/types';

// Generate a random date within a specific range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate a random MAC address
const generateMacAddress = () => {
  return Array.from({ length: 6 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':').toUpperCase();
};

// Generate a random license key
const generateLicenseKey = () => {
  return Array.from({ length: 5 }, () => 
    Math.random().toString(36).substring(2, 10)
  ).join('-').toUpperCase();
};

// Mock user data
const users: User[] = [
  { id: '1', username: 'admin', role: 'admin' as UserRole, lastLogin: new Date().toISOString() },
  { id: '2', username: 'staff', role: 'staff' as UserRole, lastLogin: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
  { id: '3', username: 'john.smith', role: 'admin' as UserRole, lastLogin: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString() },
  { id: '4', username: 'tech.support', role: 'staff' as UserRole, lastLogin: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString() },
];

// Generate mock devices
const generateDevices = (): Device[] => {
  const devices: Device[] = [];
  const now = new Date();
  const statuses: DeviceStatus[] = ['active', 'expired', 'pending'];
  
  // Generate 25 devices with various statuses
  for (let i = 0; i < 25; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = randomDate(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), now).toISOString();
    
    // Only active and expired devices have expiry dates
    let expiryDate: string | undefined;
    if (status !== 'pending') {
      if (status === 'active') {
        expiryDate = randomDate(now, new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())).toISOString();
      } else { // expired
        expiryDate = randomDate(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), now).toISOString();
      }
    }
    
    devices.push({
      id: `device-${i + 1}`,
      macAddress: generateMacAddress(),
      hostname: `HOST-${i + 100}`,
      status,
      key: generateLicenseKey(),
      expiryDate,
      createdAt,
      updatedAt: new Date(Math.max(Date.parse(createdAt), Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    });
  }
  
  return devices;
};

// Mock devices data
const devices = generateDevices();

// Generate mock logs
const generateLogs = (): LogEntry[] => {
  const logs: LogEntry[] = [];
  const actions = ['login', 'issue_key', 'reset', 'delete'];
  const now = new Date();
  
  // Generate 50 log entries
  for (let i = 0; i < 50; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const timestamp = randomDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), now).toISOString();
    
    // Some logs are associated with devices
    let deviceId: string | undefined;
    let deviceDetails: string | undefined;
    
    if (action !== 'login') {
      const device = devices[Math.floor(Math.random() * devices.length)];
      deviceId = device.id;
      deviceDetails = `${device.hostname} (${device.macAddress})`;
    }
    
    logs.push({
      id: `log-${i + 1}`,
      action: action as 'login' | 'issue_key' | 'reset' | 'delete',
      userId: user.id,
      username: user.username,
      deviceId,
      deviceDetails,
      timestamp,
    });
  }
  
  // Sort logs by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Mock logs data
const logs = generateLogs();

// Global log entry store that can be updated
let globalLogs = [...logs];

class MockData {
  // Get dashboard stats
  getDashboardStats(): DashboardStats {
    const activeDevices = devices.filter(device => device.status === 'active').length;
    const expiredDevices = devices.filter(device => device.status === 'expired').length;
    const pendingDevices = devices.filter(device => device.status === 'pending').length;
    
    return {
      totalDevices: devices.length,
      activeDevices,
      expiredDevices,
      pendingDevices,
      recentActivity: globalLogs.slice(0, 10), // 10 most recent logs
    };
  }
  
  // Get all devices
  getDevices(): Device[] {
    return [...devices];
  }
  
  // Get all users
  getUsers(): User[] {
    return [...users];
  }
  
  // Get all logs
  getLogs(): LogEntry[] {
    return [...globalLogs];
  }
  
  // Add a new log entry
  addLogEntry(logData: Partial<LogEntry>): void {
    const currentUser = users.find(u => u.username === 'admin'); // Default to admin for demo
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      action: logData.action || 'login',
      userId: currentUser?.id || '1',
      username: logData.username || currentUser?.username || 'admin',
      deviceId: logData.deviceId,
      deviceDetails: logData.deviceDetails,
      timestamp: new Date().toISOString(),
    };
    
    globalLogs = [newLog, ...globalLogs];
  }
}

export const mockData = new MockData();
