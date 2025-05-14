
// This file is kept for backward compatibility
// In a real-world implementation, this would be a backend API

import { api } from './api';

// Re-export API functions with compatible signatures
export async function getUserByUsername(username: string) {
  try {
    const users = await api.getUsers();
    return users.find(user => user.username === username) || null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

export async function getAllDevices() {
  try {
    const devices = await api.getDevices();
    return devices.map(device => ({
      id: parseInt(device.id.replace('device-', '')),
      mac: device.macAddress,
      hostname: device.hostname,
      key_code: device.key,
      active: device.status === 'active',
      activated_at: device.status !== 'pending' ? device.updatedAt : null,
      expires_at: device.expiryDate || null,
      added_by: 1, // Mock user ID
      created_at: device.createdAt,
      addedByUsername: 'admin' // Mock username
    }));
  } catch (error) {
    console.error('Error getting all devices:', error);
    return [];
  }
}

// Forward all other database functions to use the API
export const getDeviceByMac = async (mac: string) => {
  const devices = await getAllDevices();
  return devices.find(device => device.mac === mac) || null;
};

export const addDevice = async (device: any) => {
  try {
    await api.addDevice({
      macAddress: device.mac,
      hostname: device.hostname,
      duration: '1month' // Default duration
    });
    return { insertId: Math.floor(Math.random() * 1000) }; // Mock insert ID
  } catch (error) {
    console.error('Error adding device:', error);
    throw error;
  }
};

export const updateDeviceKey = async (deviceId: number, key: string, expiryDate: Date | null) => {
  try {
    const devices = await api.getDevices();
    const deviceIndex = devices.findIndex(d => parseInt(d.id.replace('device-', '')) === deviceId);
    if (deviceIndex >= 0) {
      // In a real app, this would be an API call
      console.log(`Updated device ${deviceId} with key ${key} and expiry ${expiryDate}`);
    }
    return { affectedRows: 1 }; // Mock result
  } catch (error) {
    console.error('Error updating device key:', error);
    throw error;
  }
};

export const resetDevice = async (deviceId: number) => {
  try {
    const deviceIdStr = `device-${deviceId}`;
    await api.resetDevice(deviceIdStr);
    return { affectedRows: 1 }; // Mock result
  } catch (error) {
    console.error('Error resetting device:', error);
    throw error;
  }
};

export const deleteDevice = async (deviceId: number) => {
  try {
    const deviceIdStr = `device-${deviceId}`;
    await api.deleteDevice(deviceIdStr);
    return { affectedRows: 1 }; // Mock result
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
};

export const addLog = async (log: any) => {
  try {
    await api.addLogEntry({
      action: log.action,
      userId: log.performedBy?.toString(),
      deviceDetails: log.mac && log.hostname ? `${log.hostname} (${log.mac})` : undefined
    });
    return { insertId: Math.floor(Math.random() * 1000) }; // Mock insert ID
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
};

export const getLogs = async (limit = 50) => {
  try {
    const logs = await api.getLogs();
    return logs.slice(0, limit).map(log => ({
      id: parseInt(log.id.replace('log-', '')),
      mac: log.deviceDetails ? log.deviceDetails.split('(')[1]?.replace(')', '') : null,
      hostname: log.deviceDetails ? log.deviceDetails.split('(')[0].trim() : null,
      action: log.action,
      performed_by: parseInt(log.userId.replace('user-', '')),
      timestamp: log.timestamp,
      username: log.username
    }));
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
};

// Mock database connection pool
const pool = {
  execute: async () => {
    throw new Error('Direct database access is not supported in browser');
  }
};

export default pool;
