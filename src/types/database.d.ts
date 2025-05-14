
export interface DbUser {
  id: number;
  username: string;
  passwordHash: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface DbDevice {
  id: number;
  mac: string;
  hostname: string;
  key_code: string | null;
  active: boolean;
  activated_at: string | null;
  expires_at: string | null;
  added_by: number | null;
  created_at: string;
  addedByUsername?: string;
}

export interface DbLog {
  id: number;
  mac: string | null;
  hostname: string | null;
  action: string;
  performed_by: number | null;
  timestamp: string;
  username?: string;
}

export type KeyDuration = '1day' | '3days' | '1month' | '6months' | '2years' | 'forever';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
