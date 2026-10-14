/**
 * Authentication Client for OTP-based Login
 * Handles communication with Express backend at localhost:5000
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface LoginPayload {
  phone?: string;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  sessionId: string;
}

export interface VerifyOTPPayload {
  sessionId: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  };
}

export interface UserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  };
}

/**
 * Step 1: Send OTP to phone or email
 */
export async function requestOTP(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }

  return data;
}

/**
 * Step 2: Verify OTP and get JWT token
 */
export async function verifyOTP(payload: VerifyOTPPayload): Promise<VerifyOTPResponse> {
  const response = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Invalid OTP');
  }

  return data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user');
  }

  return data;
}

/**
 * Logout and invalidate session
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  localStorage.removeItem('auth_token');
}
