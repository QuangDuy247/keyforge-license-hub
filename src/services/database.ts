
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3308,
  user: 'KingAutoColony',
  password: 'StrongPass123',
  database: 'license_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function for executing queries
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// User related queries
export async function getUserByUsername(username: string) {
  return executeQuery<any[]>(
    'SELECT id, username, password_hash as passwordHash, role, created_at as createdAt FROM users WHERE username = ?',
    [username]
  ).then(rows => rows[0] || null);
}

// Device related queries
export async function getAllDevices() {
  return executeQuery<any[]>(
    `SELECT d.*, u.username as addedByUsername
     FROM devices d
     LEFT JOIN users u ON d.added_by = u.id
     ORDER BY d.created_at DESC`
  );
}

export async function getDeviceByMac(mac: string) {
  return executeQuery<any[]>(
    'SELECT * FROM devices WHERE mac = ?',
    [mac]
  ).then(rows => rows[0] || null);
}

export async function addDevice(device: {
  mac: string;
  hostname: string;
  addedBy: number;
}) {
  return executeQuery<any>(
    'INSERT INTO devices (mac, hostname, added_by) VALUES (?, ?, ?)',
    [device.mac, device.hostname, device.addedBy]
  );
}

export async function updateDeviceKey(deviceId: number, key: string, expiryDate: Date | null) {
  return executeQuery(
    'UPDATE devices SET key_code = ?, active = TRUE, activated_at = NOW(), expires_at = ? WHERE id = ?',
    [key, expiryDate, deviceId]
  );
}

export async function resetDevice(deviceId: number) {
  return executeQuery(
    'UPDATE devices SET active = FALSE, activated_at = NULL, expires_at = NULL WHERE id = ?',
    [deviceId]
  );
}

export async function deleteDevice(deviceId: number) {
  return executeQuery('DELETE FROM devices WHERE id = ?', [deviceId]);
}

// Log related queries
export async function addLog(log: {
  mac?: string;
  hostname?: string;
  action: string;
  performedBy: number;
}) {
  return executeQuery(
    'INSERT INTO logs (mac, hostname, action, performed_by) VALUES (?, ?, ?, ?)',
    [log.mac, log.hostname, log.action, log.performedBy]
  );
}

export async function getLogs(limit = 50) {
  return executeQuery<any[]>(
    `SELECT l.*, u.username
     FROM logs l
     LEFT JOIN users u ON l.performed_by = u.id
     ORDER BY l.timestamp DESC
     LIMIT ?`,
    [limit]
  );
}

// Export the pool to be used directly if needed
export default pool;
