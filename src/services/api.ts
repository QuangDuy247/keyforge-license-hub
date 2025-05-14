
import { DashboardStats, Device, DeviceStatus, LogEntry, User } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Base API URL - in a production app, this would come from environment variables
const API_URL = '/api';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // For demonstration purposes, we'll simulate API responses
    // In a real app, this would be replaced with actual fetch calls to your backend
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock API responses based on endpoints
    let responseData: any;

    if (endpoint === '/dashboard') {
      responseData = mockDashboardStats();
    } else if (endpoint === '/devices') {
      responseData = mockDevices();
    } else if (endpoint.startsWith('/devices/') && method === 'DELETE') {
      responseData = { success: true, message: 'Device deleted successfully' };
    } else if (endpoint.startsWith('/devices/') && method === 'PUT') {
      responseData = { success: true, message: 'Device updated successfully' };
    } else if (endpoint === '/devices' && method === 'POST') {
      responseData = mockNewDevice(body);
    } else if (endpoint === '/logs') {
      responseData = mockLogs();
    } else if (endpoint === '/logs' && method === 'POST') {
      responseData = { success: true, message: 'Log entry added successfully' };
    } else if (endpoint === '/users') {
      responseData = mockUsers();
    } else if (endpoint === '/auth/login') {
      responseData = mockLogin(body);
    } else {
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    return responseData as T;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    toast({
      title: "API Request Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive"
    });
    throw error;
  }
}

// API service functions
export const api = {
  // Auth related endpoints
  login: (username: string, password: string) => {
    return apiRequest<{ user: User; token: string }>('/auth/login', 'POST', { username, password });
  },

  // Dashboard related endpoints
  getDashboardStats: () => {
    return apiRequest<DashboardStats>('/dashboard');
  },

  // Device related endpoints
  getDevices: () => {
    return apiRequest<Device[]>('/devices');
  },
  addDevice: (device: { macAddress: string; hostname: string; duration: string }) => {
    return apiRequest<{ device: Device }>('/devices', 'POST', device);
  },
  resetDevice: (deviceId: string) => {
    return apiRequest(`/devices/${deviceId}/reset`, 'PUT');
  },
  deleteDevice: (deviceId: string) => {
    return apiRequest(`/devices/${deviceId}`, 'DELETE');
  },
  // New endpoint for client activation
  activateClient: (macAddress: string, hostname: string, key: string) => {
    return apiRequest<{ success: boolean; message: string }>('/client/activate', 'POST', { macAddress, hostname, key });
  },
  checkClientActivation: (macAddress: string, hostname: string) => {
    return apiRequest<{ active: boolean; message: string }>('/client/check', 'POST', { macAddress, hostname });
  },

  // Log related endpoints
  getLogs: () => {
    return apiRequest<LogEntry[]>('/logs');
  },
  addLogEntry: (log: Partial<LogEntry>) => {
    return apiRequest('/logs', 'POST', log);
  },

  // User related endpoints
  getUsers: () => {
    return apiRequest<User[]>('/users');
  }
};

// Mock data functions for demonstration - these would be removed in a production app
function mockDashboardStats(): DashboardStats {
  return {
    totalDevices: 15,
    activeDevices: 8,
    expiredDevices: 2,
    pendingDevices: 5,
    recentActivity: Array(5).fill(null).map((_, i) => ({
      id: `log-${i}`,
      action: ['login', 'issue_key', 'reset', 'delete'][Math.floor(Math.random() * 4)] as any,
      userId: `user-${i % 3 + 1}`,
      username: ['admin', 'staff1', 'staff2'][i % 3],
      deviceId: i % 2 === 0 ? `device-${i}` : undefined,
      deviceDetails: i % 2 === 0 ? `Device-${i} (00:1B:44:11:3A:${i}${i})` : undefined,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    })),
  };
}

function mockDevices(): Device[] {
  return Array(15).fill(null).map((_, i) => {
    const status: DeviceStatus = ['active', 'expired', 'pending'][i % 3] as DeviceStatus;
    const now = new Date();
    const createdAt = new Date(now.getTime() - (i * 86400000)).toISOString();
    const updatedAt = new Date(now.getTime() - (i * 43200000)).toISOString();
    const expiryDate = status === 'expired' 
      ? new Date(now.getTime() - 86400000).toISOString() 
      : status === 'active'
        ? new Date(now.getTime() + 86400000 * 30).toISOString()
        : undefined;
    
    return {
      id: `device-${i}`,
      macAddress: `00:1B:44:11:3A:${i}${i}`,
      hostname: `Device-${i}`,
      status: status,
      key: status !== 'pending' ? `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : '',
      expiryDate,
      createdAt,
      updatedAt,
    };
  });
}

function mockNewDevice(data: any): { device: Device } {
  const now = new Date().toISOString();
  let expiryDate: string | undefined;
  
  switch (data.duration) {
    case '1day':
      expiryDate = new Date(Date.now() + 86400000).toISOString();
      break;
    case '3days':
      expiryDate = new Date(Date.now() + 86400000 * 3).toISOString();
      break;
    case '1month':
      expiryDate = new Date(Date.now() + 86400000 * 30).toISOString();
      break;
    case '6months':
      expiryDate = new Date(Date.now() + 86400000 * 180).toISOString();
      break;
    case '2years':
      expiryDate = new Date(Date.now() + 86400000 * 730).toISOString();
      break;
    case 'forever':
      expiryDate = undefined;
      break;
  }
  
  return {
    device: {
      id: `device-${Math.random().toString(36).substring(2, 10)}`,
      macAddress: data.macAddress,
      hostname: data.hostname,
      status: 'active',
      key: `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      expiryDate,
      createdAt: now,
      updatedAt: now,
    }
  };
}

function mockLogs(): LogEntry[] {
  return Array(50).fill(null).map((_, i) => {
    const actionTypes = ['login', 'issue_key', 'reset', 'delete'];
    const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const hasDevice = action !== 'login';
    
    return {
      id: `log-${i}`,
      action: action as any,
      userId: `user-${i % 3 + 1}`,
      username: ['admin', 'staff1', 'staff2'][i % 3],
      deviceId: hasDevice ? `device-${i % 15}` : undefined,
      deviceDetails: hasDevice ? `Device-${i % 15} (00:1B:44:11:3A:${i % 15}${i % 15})` : undefined,
      timestamp: new Date(Date.now() - i * 1800000).toISOString(),
    };
  });
}

function mockUsers(): User[] {
  return [
    {
      id: 'user-1',
      username: 'admin',
      role: 'admin',
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'user-2',
      username: 'staff1',
      role: 'staff',
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'user-3',
      username: 'staff2',
      role: 'staff',
      lastLogin: new Date(Date.now() - 172800000).toISOString(),
    }
  ];
}

function mockLogin(data: { username: string; password: string }): { user: User; token: string } {
  // Demo login logic
  if (data.username === 'admin' && data.password === 'admin123') {
    return {
      user: {
        id: 'user-1',
        username: 'admin',
        role: 'admin',
        lastLogin: new Date().toISOString(),
      },
      token: 'mock-jwt-token-admin',
    };
  } else if (data.username === 'staff' && data.password === 'staff123') {
    return {
      user: {
        id: 'user-2',
        username: 'staff',
        role: 'staff',
        lastLogin: new Date().toISOString(),
      },
      token: 'mock-jwt-token-staff',
    };
  } else {
    throw new Error('Invalid credentials');
  }
}
