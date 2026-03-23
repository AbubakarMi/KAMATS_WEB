import type { UUID, Timestamp } from './common';
import type { StoreTier } from './enums';

// --- Login ---
export interface LoginRequest {
  username: string;
  password: string;
  deviceId?: string;
}

export interface StoreAssignment {
  storeId: UUID;
  storeName: string;
  storeTier?: StoreTier;
  assignedAt?: Timestamp;
}

export interface UserProfile {
  id: UUID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  storeId: UUID | null;
  storeName: string | null;
  roles: string[];
  permissions: string[];
  storeAssignments: StoreAssignment[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

// --- Token Refresh ---
export interface RefreshRequest {
  refreshToken: string;
  deviceId?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// --- Logout ---
export interface LogoutRequest {
  refreshToken: string;
}

// --- Change Password ---
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  updatedAt: Timestamp;
}

// --- Biometric ---
export interface BiometricEnrollRequest {
  biometricTemplate: string;
  deviceId: string;
}

export interface BiometricEnrollResponse {
  enrolled: boolean;
  enrolledAt: Timestamp;
}

export interface BiometricVerifyRequest {
  biometricTemplate: string;
  deviceId: string;
}

export interface BiometricVerifyResponse {
  verified: boolean;
  confidenceScore: number;
}

// --- PIN ---
export interface PinSetupRequest {
  currentPin?: string;
  newPin: string;
}

export interface PinSetupResponse {
  success: boolean;
  updatedAt: Timestamp;
}

export interface PinVerifyRequest {
  userId: UUID;
  pin: string;
}

export interface PinVerifyResponse {
  verified: boolean;
  userId: UUID;
  verificationToken: string;
}
